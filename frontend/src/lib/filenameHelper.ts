/**
 * Automatically derives a clean, ATS/filesystem-safe filename for tailored resumes
 * based on the candidate name, company, and target role from the Job Description.
 *
 * Example Outputs:
 * - Alex_Morgan_Apex_Technical_Business_Analyst_Resume
 * - Alex_Morgan_Staff_Distributed_Systems_Engineer_Resume
 * - Google_Full_Stack_Software_Engineer_Resume
 */

interface GenerateFilenameOptions {
  candidateName?: string;
  targetRole?: string;
  targetCompany?: string;
  jdText?: string;
}

export function generateJdFilename({
  candidateName = "",
  targetRole = "",
  targetCompany = "",
  jdText = "",
}: GenerateFilenameOptions): string {
  const sanitize = (text: string) =>
    text
      .trim()
      .replace(/[/\\?%*:|"<>#~`!@$^&()+={}[\];,'’]/g, "") // strip illegal characters
      .replace(/[\s\-_]+/g, "_")                         // collapse spaces and dashes to single underscore
      .replace(/^_+|_+$/g, "");                         // trim leading/trailing underscores

  const isGeneric = (val?: string, generics: string[] = []) => {
    if (!val || !val.trim()) return true;
    const lower = val.trim().toLowerCase();
    return generics.some((g) => lower === g.toLowerCase() || lower.includes("default"));
  };

  let resolvedRole = targetRole.trim();
  resolvedRole = resolvedRole.split(/\n|corporate_fare|places|info_outline|Minimum qualifications|About the job|Responsibilities/i)[0].trim();
  if (resolvedRole.toLowerCase().startsWith("enior ")) {
    resolvedRole = "S" + resolvedRole;
  }
  if (resolvedRole.length > 50) {
    resolvedRole = resolvedRole.slice(0, 48).replace(/[,_\-\s]+$/, "");
  }

  let resolvedCompany = targetCompany.trim();

  // If role is missing or generic, attempt extraction from JD text
  if (
    (!resolvedRole ||
      isGeneric(resolvedRole, [
        "target role",
        "target professional role",
        "role",
        "position",
        "job",
        "job title",
      ])) &&
    jdText
  ) {
    const lines = jdText.split("\n").map((l) => l.trim()).filter(Boolean);
    for (const line of lines.slice(0, 5)) {
      const clean = line.replace(/^[#*\-•\s]+/, "").trim();
      const lower = clean.toLowerCase();
      if (
        lower.startsWith("role:") ||
        lower.startsWith("title:") ||
        lower.startsWith("position:") ||
        lower.startsWith("job title:")
      ) {
        resolvedRole = clean.split(":", 2)[1].trim();
        break;
      }
      if (
        /engineer|developer|manager|analyst|architect|specialist|designer|consultant|lead|director|scientist/i.test(
          clean
        )
      ) {
        const cand = clean.split(/corporate_fare|places|info_outline|Minimum qualifications|About the job|Responsibilities|\n/i)[0].trim();
        resolvedRole = cand.length > 50 ? cand.slice(0, 48).replace(/[,_\-\s]+$/, "") : cand;
        break;
      }
    }
  }

  // If company is missing or generic, attempt extraction from JD text
  if (
    (!resolvedCompany ||
      isGeneric(resolvedCompany, [
        "target organization",
        "target employer",
        "target company",
        "company",
        "organization",
        "unknown",
      ])) &&
    jdText
  ) {
    const lines = jdText.split("\n").map((l) => l.trim()).filter(Boolean);
    for (const line of lines.slice(0, 6)) {
      const clean = line.replace(/^[#*\-•\s]+/, "").trim();
      const lower = clean.toLowerCase();
      if (
        lower.startsWith("company:") ||
        lower.startsWith("organization:") ||
        lower.startsWith("employer:") ||
        lower.startsWith("at:")
      ) {
        resolvedCompany = clean.split(":", 2)[1].trim();
        break;
      }
    }
  }

  const parts: string[] = [];

  // 1. Candidate Name (if personalized)
  if (!isGeneric(candidateName, ["candidate", "user", "anonymous", "my name", "candidate name"])) {
    const cleanCand = sanitize(candidateName);
    if (cleanCand) parts.push(cleanCand);
  }

  // 2. Target Company (if detected)
  if (
    !isGeneric(resolvedCompany, [
      "target organization",
      "target employer",
      "target company",
      "company",
      "organization",
      "unknown",
    ])
  ) {
    const cleanComp = sanitize(resolvedCompany);
    if (cleanComp) parts.push(cleanComp);
  }

  // 3. Target Role from Job Description
  if (
    !isGeneric(resolvedRole, [
      "target role",
      "target professional role",
      "role",
      "position",
      "job title",
    ])
  ) {
    const cleanRole = sanitize(resolvedRole);
    if (cleanRole) parts.push(cleanRole);
  }

  if (parts.length === 0) {
    return "Tailored_Resume";
  }

  const combined = parts.join("_");
  if (!/resume$/i.test(combined)) {
    return `${combined}_Resume`;
  }
  return combined;
}
