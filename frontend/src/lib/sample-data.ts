export const SAMPLE_MASTER_LATEX = `\\documentclass[11pt,a4paper]{article}
\\usepackage[empty]{fullpage}
\\newcommand{\\resumeItem}[1]{\\item\\small{#1 \\vspace{-2pt}}}
\\begin{document}
\\begin{center}
{\\huge \\textbf{Alex Chen}} \\\\
\\vspace{2pt}
\\small alex.chen@example.com \\textbar\\ (555) 234-5678 \\textbar\\ San Francisco, CA \\textbar\\ linkedin.com/in/alexchen
\\end{center}

\\vspace{-8pt}
\\section*{Experience}
\\textbf{CloudScale Technologies} \\hfill \\textbf{San Francisco, CA} \\\\
\\textit{Senior Systems Engineer} \\hfill \\textit{2021 -- Present}
\\begin{itemize}
  \\resumeItem{Built internal streaming and caching services handling database records and operational logging across application clusters.}
  \\resumeItem{Collaborated with data science teams to optimize SQL queries on recurring schedules, improving batch processing runtimes.}
  \\resumeItem{Engineered open-source developer tooling in Python and Go, maintaining continuous integration pipelines and releasing community packages.}
\\end{itemize}

\\vspace{-6pt}
\\section*{Skills}
\\textbf{Languages}: Python, Go, SQL, Bash \\\\
\\textbf{Infrastructure}: Redis, PostgreSQL, Docker, Kubernetes, AWS, Kafka, CI/CD
\\end{document}`;

export const SAMPLE_TARGET_JD = `Staff Infrastructure & Distributed Systems Engineer
Company: CloudScale AI
Location: San Francisco, CA / Remote

About the Role:
We are seeking an experienced Staff Distributed Systems Engineer to lead the architecture of our core infrastructure. You will design, scale, and optimize high-throughput distributed caching tiers and transactional databases.

Responsibilities:
- Architect distributed caching layer handling 10M+ daily events with sub-millisecond query latency using Redis.
- Spearhead microservices architecture in Go and Python, guaranteeing 99.99% availability and zero-downtime deployment pipelines.
- Audit high-volume PostgreSQL query bottlenecks and optimize transactional throughput to reduce infrastructure spend.
- Champion engineering rigor, automated CI/CD practices, and mentor junior engineers across the platform organization.

Requirements:
- 5+ years building and scaling distributed backend systems in production.
- Proven hands-on experience with Redis caching, PostgreSQL query optimization, and streaming pipelines.
- Deep expertise in Go or Python backend microservices.
- Track record of driving reliability and measurable latency reductions.`;

export const SAMPLE_DIFFS = [
  {
    id: "diff_sample_1",
    section: "Experience",
    roleTitle: "Senior Systems Engineer",
    company: "CloudScale Technologies",
    dateRange: "2021 — Present",
    originalText: "Built internal streaming and caching services handling database records and operational logging across application clusters.",
    proposedText: "Architected multi-region Redis caching layer handling 10M+ daily events, cutting p99 query latency by 42% with sub-millisecond reliability.",
    charBudget: 160,
    matchType: "direct" as const,
    reason: "Emphasizes multi-region scale while locking to verified 42% latency reduction proof.",
    evidenceId: "ev_exp_01",
    evidenceSourceQuote: "Master Resume: 'Built internal streaming and caching services handling database records...'",
    decision: "pending" as const,
  },
  {
    id: "diff_sample_2",
    section: "Experience",
    roleTitle: "Senior Systems Engineer",
    company: "CloudScale Technologies",
    dateRange: "2021 — Present",
    originalText: "Collaborated with data science teams to optimize SQL queries on recurring schedules, improving batch processing runtimes.",
    proposedText: "Audited multi-department data queries and automated ETL runtime bottlenecks, delivering a 20% recurring cloud infrastructure cost reduction.",
    charBudget: 160,
    matchType: "direct" as const,
    reason: "Reframes SQL performance tuning into executive bottom-line cloud spend savings.",
    evidenceId: "ev_exp_02",
    evidenceSourceQuote: "Master Resume: 'Collaborated with data science teams to optimize SQL queries...'",
    decision: "pending" as const,
  },
  {
    id: "diff_sample_3",
    section: "Experience",
    roleTitle: "Senior Systems Engineer",
    company: "CloudScale Technologies",
    dateRange: "2021 — Present",
    originalText: "Engineered open-source developer tooling in Python and Go, maintaining continuous integration pipelines and releasing community packages.",
    proposedText: "Engineered core microservices infrastructure in Go and Python, ensuring 99.99% uptime and automated zero-downtime deployment workflows.",
    charBudget: 160,
    matchType: "transferable" as const,
    reason: "Highlights high-availability microservices engineering and modern CI/CD automation.",
    evidenceId: "ev_exp_03",
    evidenceSourceQuote: "Master Resume: 'Engineered open-source developer tooling in Python and Go...'",
    decision: "pending" as const,
  },
];

export const SAMPLE_REQUIREMENTS = [
  {
    id: "req_sample_1",
    text: "Architect distributed caching layer handling 10M+ daily events with sub-millisecond query latency using Redis",
    category: "Essential" as const,
    status: "direct" as const,
    linkedEvidenceId: "ev_exp_01",
    note: "Directly matched with candidate Redis streaming experience.",
  },
  {
    id: "req_sample_2",
    text: "Audit high-volume PostgreSQL query bottlenecks and optimize transactional throughput",
    category: "Essential" as const,
    status: "direct" as const,
    linkedEvidenceId: "ev_exp_02",
    note: "Supported by database optimization evidence.",
  },
  {
    id: "req_sample_3",
    text: "Spearhead microservices architecture in Go and Python, guaranteeing 99.99% availability",
    category: "Essential" as const,
    status: "transferable" as const,
    linkedEvidenceId: "ev_exp_03",
    note: "Re-framed from Python/Go developer tooling into production microservices reliability.",
  },
  {
    id: "req_sample_4",
    text: "Champion automated CI/CD practices and mentor platform engineers",
    category: "Preferred" as const,
    status: "direct" as const,
    linkedEvidenceId: "ev_exp_03",
    note: "Supported by continuous integration pipeline achievements.",
  },
];
