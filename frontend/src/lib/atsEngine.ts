// atsEngine.ts

export type MatchTier = 'ESSENTIAL' | 'PREFERRED';
export type MatchStatus = 'direct' | 'transferable' | 'missing';
export type DiffDecision = 'pending' | 'accepted' | 'rejected' | 'edited';

export interface JobRequirement {
  id: string;
  label: string;
  keywords: string[]; // Canonical keyword + synonyms
  tier: MatchTier;
  initialStatus?: MatchStatus;
  note?: string;
}

export interface ResumeDiffItem {
  id: string;
  factId: string; // e.g., "ev_exp_1"
  section: 'EXPERIENCE' | 'SUMMARY' | 'PROJECTS' | 'SKILLS' | string;
  originalText: string;
  proposedText: string;
  editedText?: string;
  decision: DiffDecision;
  matchType: 'direct' | 'transferable';
  targetedRequirementIds?: string[];
}

export interface ATSConfig {
  targetRole: string;
  isLatexLockedOnePage: boolean;
  hasValidContactBlock: boolean;
  standardSectionsPresent: string[]; // e.g. ['EXPERIENCE', 'EDUCATION', 'SKILLS']
  rawLatexSource?: string;
}

export interface ATSScoreBreakdown {
  totalScore: number;         // 0 - 100
  baselineScore: number;      // Score if all diffs are rejected (Master Resume)
  potentialMaxScore: number;  // Score if all diffs are accepted
  scoreDelta: number;         // totalScore - baselineScore
  subScores: {
    keywordScore: number;     // 0 - 100 (45% weight)
    impactScore: number;      // 0 - 100 (25% weight)
    structureScore: number;   // 0 - 100 (15% weight)
    densityScore: number;     // 0 - 100 (15% weight)
  };
  rubricStats: {
    totalRequirements: number;
    directMatches: number;
    transferableMatches: number;
    missingSkills: number;
    matchedList: Array<JobRequirement & { status: MatchStatus }>;
  };
  bulletDiagnostics: Array<{
    diffId: string;
    hasStrongVerb: boolean;
    hasQuantifiedMetric: boolean;
    wordCount: number;
    pointContribution: number;
  }>;
  warnings: string[];
}

// High-impact engineering & business action verbs
const STRONG_ACTION_VERBS = new Set([
  'engineered', 'architected', 'spearheaded', 'optimized', 'automated',
  'accelerated', 'orchestrated', 'designed', 'implemented', 'reduced',
  'scaled', 'built', 'launched', 'refactored', 'streamlined', 'pioneered',
  'delivered', 'deployed', 'integrated', 'led', 'modernized', 'resolved'
]);

const WEAK_PHRASES = [
  /^responsible for\b/i,
  /^worked on\b/i,
  /^helped with\b/i,
  /^assisted in\b/i,
  /^duties included\b/i,
];

// Common technical synonyms so ATS matching handles variations accurately
const SYNONYM_MAP: Record<string, string[]> = {
  'react': ['reactjs', 'react.js', 'react native'],
  'typescript': ['ts'],
  'javascript': ['js', 'es6', 'ecmascript'],
  'node.js': ['nodejs', 'node'],
  'ci/cd': ['continuous integration', 'continuous delivery', 'github actions', 'jenkins'],
  'state management': ['redux', 'zustand', 'context api', 'mobx', 'recoil'],
  'modular architecture': ['component-driven', 'micro-frontends', 'modular frontend'],
  'backend apis': ['rest api', 'graphql', 'microservices', 'api optimization', 'fastapi'],
  'kafka': ['event streaming', 'pub/sub', 'real-time streaming', 'message broker'],
  'postgresql': ['postgres', 'sql', 'relational database', 'pgvector'],
  'distributed systems': ['microservices', 'high-throughput', 'low-latency', 'scalability', 'redis'],
};

/**
 * Normalizes text for deterministic token & phrase matching
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s.+/-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Strips LaTeX command markup to expose candidate plain text
 */
function extractCleanLatexText(latex: string): string {
  return latex
    .replace(/\\[a-zA-Z]+\*?(?:\[[^\]]*\])?(?:\{([^}]*)\})?/g, '$1 ')
    .replace(/[{}\\$%&#^_~]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Checks if a requirement's keyword or any of its synonyms exist in the corpus
 */
function matchesKeywordInCorpus(keyword: string, normalizedCorpus: string): boolean {
  const normKey = normalizeText(keyword);
  if (!normKey || normKey.length < 2) return false;

  const candidates = [normKey, ...(SYNONYM_MAP[normKey] || [])];
  return candidates.some((candidate) => {
    const escaped = candidate.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(?:^|\\s)${escaped}(?:$|\\s)`, 'i');
    return regex.test(normalizedCorpus);
  });
}

/**
 * Evaluates a single resume bullet for Action Verbs, Metrics, and Length
 */
function scoreBulletImpact(text: string): {
  score: number;
  hasStrongVerb: boolean;
  hasQuantifiedMetric: boolean;
  wordCount: number;
} {
  const clean = text.trim();
  const words = clean.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const firstWord = (words[0] || '').toLowerCase().replace(/[^a-z]/g, '');

  const hasStrongVerb = STRONG_ACTION_VERBS.has(firstWord);
  const hasWeakOpening = WEAK_PHRASES.some((rx) => rx.test(clean));

  // Matches numbers, percentages, multipliers, latency/scale units, or currency
  const metricRegex = /\b(\d+(\.\d+)?(%|x|ms|s|k|m|b|\+)|\$\d+|\d+\s*(users|requests|clients|services|components|pipelines|hours|days|percent))\b/i;
  const hasQuantifiedMetric = metricRegex.test(clean);

  let score = 40; // Base score for a coherent bullet

  if (hasStrongVerb) score += 30;
  if (hasWeakOpening) score -= 20;
  if (hasQuantifiedMetric) score += 20;

  // Optimal ATS bullet length is 12 to 28 words
  if (wordCount >= 12 && wordCount <= 28) {
    score += 10;
  } else if (wordCount < 7 || wordCount > 42) {
    score -= 15;
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    hasStrongVerb,
    hasQuantifiedMetric,
    wordCount,
  };
}

/**
 * Core helper to evaluate any snapshot of resume bullet texts against full master corpus
 */
function computeSnapshotScore(
  activeBullets: Array<{
    id: string;
    text: string;
    matchType: 'direct' | 'transferable';
    decision?: DiffDecision;
    targetedRequirementIds?: string[];
  }>,
  requirements: JobRequirement[],
  config: ATSConfig
) {
  // Extract full candidate resume text from LaTeX and combine with tailored active bullets
  const masterText = config.rawLatexSource ? extractCleanLatexText(config.rawLatexSource) : '';
  const activeBulletsText = activeBullets.map((b) => b.text).join(' ');
  const fullCorpus = normalizeText(`${masterText} ${activeBulletsText}`);
  const bulletsCorpus = normalizeText(activeBulletsText);
  const warnings: string[] = [];

  // 1. KEYWORD & RUBRIC REQUIREMENT SCORE (45%)
  let earnedWeight = 0;
  let totalWeight = 0;
  let directMatches = 0;
  let transferableMatches = 0;
  let missingSkills = 0;

  const matchedList: Array<JobRequirement & { status: MatchStatus }> = requirements.map((req) => {
    const weight = req.tier === 'ESSENTIAL' ? 2.0 : 1.0;
    totalWeight += weight;

    // Filter noise/generic words for meaningful keyword checking
    const meaningfulKeywords = req.keywords.filter(
      (k) => k.length >= 3 && !['with', 'from', 'that', 'have', 'been', 'team', 'work', 'more', 'also', 'into', 'such', 'than', 'were', 'when', 'your', 'what', 'must', 'well', 'plus', 'role', 'help', 'about', 'years', 'using', 'able', 'strong', 'experience', 'required'].includes(k)
    );
    const evalKeywords = meaningfulKeywords.length > 0 ? meaningfulKeywords : req.keywords;

    const hitCount = evalKeywords.filter((kw) => matchesKeywordInCorpus(kw, fullCorpus)).length;
    const coverageRatio = evalKeywords.length > 0 ? hitCount / evalKeywords.length : 0;
    
    // Check if active tailored bullets specifically address this requirement
    const bulletHit = evalKeywords.some((kw) => matchesKeywordInCorpus(kw, bulletsCorpus));
    const isDirectlyTargeted = activeBullets.some(
      (b) => b.targetedRequirementIds?.includes(req.id) && (b.decision === 'accepted' || b.decision === 'edited')
    );

    let status: MatchStatus = 'missing';

    if (req.initialStatus) {
      if (req.initialStatus === 'direct') {
        status = 'direct';
      } else if (req.initialStatus === 'transferable') {
        // Upgraded to direct if candidate's accepted tailored bullet covers it or high full-corpus overlap
        if (isDirectlyTargeted || bulletHit || coverageRatio >= 0.45) {
          status = 'direct';
        } else {
          status = 'transferable';
        }
      } else {
        // Missing (verified gap to prevent fabrication)
        status = 'missing';
      }
    } else {
      // Deterministic fallback based on keyword coverage in full corpus
      if (coverageRatio >= 0.35 || (evalKeywords.length > 0 && hitCount >= 2)) {
        status = 'direct';
      } else if (coverageRatio > 0 || hitCount >= 1) {
        status = 'transferable';
      } else {
        status = 'missing';
      }
    }

    if (status === 'direct') {
      earnedWeight += weight * 1.0;
      directMatches++;
    } else if (status === 'transferable') {
      earnedWeight += weight * 0.75;
      transferableMatches++;
    } else {
      missingSkills++;
    }

    return { ...req, status };
  });

  const keywordScore = totalWeight > 0 ? (earnedWeight / totalWeight) * 100 : 100;

  // 2. IMPACT & ACTION VERB SCORE (25%)
  const bulletEvaluations = activeBullets.map((b) => ({
    diffId: b.id,
    ...scoreBulletImpact(b.text),
  }));

  const impactScore =
    bulletEvaluations.length > 0
      ? bulletEvaluations.reduce((sum, b) => sum + b.score, 0) / bulletEvaluations.length
      : 75;

  // 3. LATEX PARSEABILITY & STRUCTURE SCORE (15%)
  let structureScore = 100;
  if (!config.isLatexLockedOnePage) {
    structureScore -= 25;
    warnings.push('Resume exceeds 1-page LaTeX layout lock.');
  }
  if (!config.hasValidContactBlock) {
    structureScore -= 25;
    warnings.push('Contact block is missing required fields.');
  }
  const requiredSections = ['EXPERIENCE', 'EDUCATION', 'SKILLS'];
  requiredSections.forEach((sec) => {
    if (!config.standardSectionsPresent.includes(sec)) {
      structureScore -= 15;
      warnings.push(`Missing standard ATS section header: ${sec}`);
    }
  });
  // Check raw LaTeX for ATS-hostile packages
  if (config.rawLatexSource) {
    if (/\\begin\{tabularx?\}/i.test(config.rawLatexSource)) {
      structureScore -= 15;
      warnings.push('Nested LaTeX tables detected; some legacy ATS parsers may scramble reading order.');
    }
  }
  structureScore = Math.max(0, structureScore);

  // 4. ROLE ALIGNMENT & KEYWORD DENSITY GUARD (15%)
  let densityScore = 90;
  const words = fullCorpus.split(/\s+/).filter(Boolean);
  const totalWords = Math.max(1, words.length);

  // Check if target role terms appear naturally
  const roleTokens = normalizeText(config.targetRole)
    .split(/\s+/)
    .filter((w) => w.length > 3);
  const roleHits = roleTokens.filter((t) => fullCorpus.includes(t)).length;
  if (roleTokens.length > 0 && roleHits / roleTokens.length >= 0.5) {
    densityScore += 10;
  }

  // Penalize keyword stuffing (> 4% repetition of any single technical keyword)
  const freqMap: Record<string, number> = {};
  words.forEach((w) => {
    if (w.length > 4) freqMap[w] = (freqMap[w] || 0) + 1;
  });
  Object.entries(freqMap).forEach(([word, count]) => {
    if (totalWords > 40 && count / totalWords > 0.045) {
      densityScore -= 15;
      warnings.push(`High repetition detected for "${word}" (${count}x) — avoid keyword stuffing.`);
    }
  });
  densityScore = Math.max(0, Math.min(100, densityScore));

  const totalScore = Math.round(
    0.45 * keywordScore +
    0.25 * impactScore +
    0.15 * structureScore +
    0.15 * densityScore
  );

  return {
    totalScore,
    subScores: {
      keywordScore: Math.round(keywordScore),
      impactScore: Math.round(impactScore),
      structureScore: Math.round(structureScore),
      densityScore: Math.round(densityScore),
    },
    rubricStats: {
      totalRequirements: requirements.length,
      directMatches,
      transferableMatches,
      missingSkills,
      matchedList,
    },
    bulletEvaluations,
    warnings,
  };
}

/**
 * Main Entry Point: Calculates Baseline, Current Live Score, and Max Potential Score
 */
export function evaluateResumeATS(
  diffs: ResumeDiffItem[],
  requirements: JobRequirement[],
  config: ATSConfig
): ATSScoreBreakdown {
  // 1. Baseline Snapshot (All original Master Resume bullets)
  const baselineBullets = diffs.map((d) => ({
    id: d.id,
    text: d.originalText,
    matchType: d.matchType,
    decision: 'rejected' as DiffDecision,
    targetedRequirementIds: d.targetedRequirementIds,
  }));
  const baselineResult = computeSnapshotScore(baselineBullets, requirements, config);

  // 2. Potential Max Snapshot (If all proposed changes are Accepted)
  const maxBullets = diffs.map((d) => ({
    id: d.id,
    text: d.editedText || d.proposedText,
    matchType: d.matchType,
    decision: 'accepted' as DiffDecision,
    targetedRequirementIds: d.targetedRequirementIds,
  }));
  const maxResult = computeSnapshotScore(maxBullets, requirements, config);

  // 3. Current Live Snapshot (Reflects user's real-time Accept/Reject/Edit choices)
  const currentBullets = diffs.map((d) => {
    let activeText = d.originalText;
    if (d.decision === 'accepted') activeText = d.proposedText;
    if (d.decision === 'edited' && d.editedText) activeText = d.editedText;
    return {
      id: d.id,
      text: activeText,
      matchType: d.matchType,
      decision: d.decision,
      targetedRequirementIds: d.targetedRequirementIds,
    };
  });
  const liveResult = computeSnapshotScore(currentBullets, requirements, config);

  // 4. Calculate per-diff point contribution
  const bulletDiagnostics = diffs.map((d, idx) => {
    const singleAcceptedBullets = baselineBullets.map((b) =>
      b.id === d.id ? { ...b, text: d.editedText || d.proposedText } : b
    );
    const singleScore = computeSnapshotScore(singleAcceptedBullets, requirements, config).totalScore;
    const pointContribution = Math.max(1, singleScore - baselineResult.totalScore);
    const evalItem = liveResult.bulletEvaluations[idx] || {
      hasStrongVerb: false,
      hasQuantifiedMetric: false,
      wordCount: 0,
    };

    return {
      diffId: d.id,
      hasStrongVerb: evalItem.hasStrongVerb,
      hasQuantifiedMetric: evalItem.hasQuantifiedMetric,
      wordCount: evalItem.wordCount,
      pointContribution,
    };
  });

  return {
    totalScore: liveResult.totalScore,
    baselineScore: baselineResult.totalScore,
    potentialMaxScore: maxResult.totalScore,
    scoreDelta: liveResult.totalScore - baselineResult.totalScore,
    subScores: liveResult.subScores,
    rubricStats: liveResult.rubricStats,
    bulletDiagnostics,
    warnings: liveResult.warnings,
  };
}
