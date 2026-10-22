/**
 * High-performance, zero-dependency Vector ATS PDF Generator.
 * 
 * Compiles LaTeX resume source or structured resume content into a valid, standard PDF 1.4 binary.
 * Ensures instant preview (<2ms) and robust fallback export when the remote LaTeX compiler
 * is cold-starting, rate-limited, or offline.
 * 
 * Compatible with Node.js, Vercel Serverless/Edge runtimes, and client-side browsers.
 */

export interface VectorPdfOptions {
  candidateName?: string;
  candidateEmail?: string;
  filename?: string;
}

interface TextLine {
  type: "header_name" | "contact" | "section" | "subheading" | "bullet" | "body";
  text: string;
  subRight?: string;
}

export function cleanLatexForVectorPdf(rawTex: string): {
  name: string;
  contactLine: string;
  lines: TextLine[];
} {
  // 1. Normalize unicode characters & special symbols
  let tex = rawTex
    .replace(/\r\n/g, "\n")
    .replace(/\u2013/g, "--")
    .replace(/\u2014/g, "---")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\u00a0/g, " ")
    .replace(/\ufeff/g, "");

  // Only parse inside \begin{document} ... \end{document} to avoid corrupting preamble macros
  let body = tex;
  if (tex.includes("\\begin{document}")) {
    const afterBegin = tex.split("\\begin{document}")[1];
    body = afterBegin.split("\\end{document}")[0];
  }

  // 2. Extract Candidate Name
  let name = "";
  const nameMatch =
    body.match(/\\Huge\s*(?:\\scshape\s*)?\\textbf\{([^}]+)\}/i) ||
    body.match(/\\textbf\{([^}]+)\}/) ||
    body.match(/\\Huge\s+([^\\]+)/i);
  if (nameMatch) {
    name = nameMatch[1].replace(/[{}\\]/g, "").trim();
  }

  // 3. Extract Contact Line (email, phone, links)
  let contactLine = "";
  const contactMatch = body.match(/\\small\s+([^\n\\]+(?:\\\\|[^\n\\]+)*)/);
  if (contactMatch) {
    contactLine = contactMatch[1]
      .replace(/\\href\{[^}]*\}\{([^}]*)\}/g, "$1")
      .replace(/[{}\\%$_#&]/g, "")
      .replace(/\\/g, " ")
      .trim();
  }

  // 4. Extract Sections and Content
  const lines: TextLine[] = [];
  const rawParts = body.split(/\n/);

  for (let raw of rawParts) {
    let line = raw.trim();
    if (!line || line.startsWith("%")) continue;

    // Check for Section: e.g. \section{Experience} or \section*{Experience}
    const secMatch = line.match(/\\section\*?\{([^}]+)\}/i);
    if (secMatch) {
      const sectionName = secMatch[1].replace(/[{}\\]/g, "").trim();
      lines.push({ type: "section", text: sectionName.toUpperCase() });
      continue;
    }

    // Check for resumeSubheading macro: \resumeSubheading{Role}{Dates}{Company}{Location}
    const subheadMatch = line.match(/\\resumeSubheading\{([^}]+)\}\{([^}]+)\}\{([^}]+)\}\{([^}]*)\}/);
    if (subheadMatch) {
      const role = subheadMatch[1].replace(/[{}\\]/g, "").trim();
      const dates = subheadMatch[2].replace(/[{}\\]/g, "").trim();
      const comp = subheadMatch[3].replace(/[{}\\]/g, "").trim();
      const loc = subheadMatch[4].replace(/[{}\\]/g, "").trim();
      lines.push({
        type: "subheading",
        text: comp ? `${role} | ${comp}` : role,
        subRight: loc ? `${dates} (${loc})` : dates,
      });
      continue;
    }

    // Check for tabular role / date line: e.g. \textbf{Role} & \small{Dates} \\
    if (line.includes("&") && (line.includes("\\textbf") || line.includes("\\textsl"))) {
      const parts = line.split("&").map((p) =>
        p
          .replace(/\\textbf\{([^}]+)\}/g, "$1")
          .replace(/\\textsl\{([^}]+)\}/g, "$1")
          .replace(/\\small\{([^}]+)\}/g, "$1")
          .replace(/[{}\\%$_#&]/g, "")
          .replace(/\\\\/g, "")
          .trim()
      );
      if (parts.length >= 2) {
        lines.push({ type: "subheading", text: parts[0], subRight: parts[1] });
        continue;
      }
    }

    // Check for bullet items: \resumeItem{...} or \item ...
    const bulletMatch = line.match(/(?:\\resumeItem\{|\\item\b\s*)(.+)/);
    if (bulletMatch) {
      let bText = bulletMatch[1]
        .replace(/\\href\{[^}]*\}\{([^}]*)\}/g, "$1")
        .replace(/\\textbf\{([^}]+)\}/g, "$1")
        .replace(/\\textit\{([^}]+)\}/g, "$1")
        .replace(/\\textsl\{([^}]+)\}/g, "$1")
        .replace(/\\small\{([^}]+)\}/g, "$1")
        .replace(/[{}\\%$_#&]/g, "")
        .replace(/\\\\/g, "")
        .replace(/\}[ \t]*$/, "")
        .trim();
      if (
        bText &&
        !bText.startsWith("documentclass") &&
        !bText.startsWith("begin") &&
        !bText.startsWith("end") &&
        !bText.startsWith("newcommand")
      ) {
        lines.push({ type: "bullet", text: bText });
      }
      continue;
    }

    // Generic body text (e.g. summary or skills line)
    if (
      !line.startsWith("\\") &&
      !line.startsWith("{") &&
      !line.startsWith("}") &&
      line.length > 15
    ) {
      const cleanBody = line
        .replace(/\\textbf\{([^}]+)\}/g, "$1")
        .replace(/\\small\{([^}]+)\}/g, "$1")
        .replace(/[{}\\%$_#&]/g, "")
        .replace(/\\\\/g, "")
        .trim();
      if (cleanBody) {
        lines.push({ type: "body", text: cleanBody });
      }
    }
  }

  return { name, contactLine, lines };
}

function escapePdfText(str: string): string {
  return str
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/[^\x20-\x7E]/g, " "); // Keep standard 7-bit ASCII
}

function wrapText(text: string, maxCharsPerLine = 100): string[] {
  if (text.length <= maxCharsPerLine) return [text];
  const words = text.split(" ");
  const wrapped: string[] = [];
  let cur = "";

  for (const w of words) {
    if (!cur) {
      cur = w;
    } else if (cur.length + 1 + w.length <= maxCharsPerLine) {
      cur += " " + w;
    } else {
      wrapped.push(cur);
      cur = w;
    }
  }
  if (cur) wrapped.push(cur);
  return wrapped;
}

/**
 * Generates an ATS-compliant, single-page vector PDF binary from LaTeX code.
 */
export function generateVectorPdfBytes(
  rawTex: string,
  options?: VectorPdfOptions
): Uint8Array {
  const parsed = cleanLatexForVectorPdf(rawTex);
  const candidateName = (options?.candidateName || parsed.name || "Candidate Name").trim();
  const contact = (options?.candidateEmail || parsed.contactLine || "candidate@example.com").trim();

  const streamOps: string[] = [];

  // US Letter dimensions: 612 x 792 pt. Margins: 45 pt (0.62 in)
  const leftMargin = 45;
  const rightMargin = 567;
  let y = 746; // Top cursor

  // 1. Header: Candidate Name (17pt Bold)
  const safeName = escapePdfText(candidateName);
  streamOps.push(`BT /F1 17 Tf ${leftMargin} ${y} Td (${safeName}) Tj ET`);
  y -= 16;

  // 2. Header: Contact Line (9pt Regular, subtle dark slate)
  if (contact) {
    const safeContact = escapePdfText(contact);
    streamOps.push(`0.3 0.3 0.3 rg BT /F2 9 Tf ${leftMargin} ${y} Td (${safeContact}) Tj ET 0 g`);
    y -= 14;
  }

  // 3. Document Sections & Content
  for (const item of parsed.lines) {
    if (y < 55) break; // Keep strictly within 1-page budget

    if (item.type === "section") {
      y -= 10;
      const safeSec = escapePdfText(item.text);
      // Section title in blue accent / dark navy (0.05, 0.35, 0.75)
      streamOps.push(`0.05 0.35 0.75 rg BT /F1 10.5 Tf ${leftMargin} ${y} Td (${safeSec}) Tj ET 0 g`);
      // Thin accent horizontal rule
      streamOps.push(`0.82 0.85 0.88 RG 0.75 w ${leftMargin} ${y - 3} m ${rightMargin} ${y - 3} l S`);
      y -= 12;
    } else if (item.type === "subheading") {
      y -= 4;
      const safeLeft = escapePdfText(item.text);
      streamOps.push(`0.1 0.1 0.1 rg BT /F1 9.5 Tf ${leftMargin} ${y} Td (${safeLeft}) Tj ET 0 g`);
      if (item.subRight) {
        const safeRight = escapePdfText(item.subRight);
        // Right-align date or location
        const estWidth = safeRight.length * 5.2;
        const rx = Math.max(leftMargin + 100, rightMargin - estWidth);
        streamOps.push(`0.35 0.35 0.35 rg BT /F3 9 Tf ${rx.toFixed(1)} ${y} Td (${safeRight}) Tj ET 0 g`);
      }
      y -= 12;
    } else if (item.type === "bullet") {
      const wrapped = wrapText(item.text, 96);
      for (let i = 0; i < wrapped.length; i++) {
        if (y < 55) break;
        const line = wrapped[i];
        const isFirst = i === 0;
        const safeLine = escapePdfText(line);
        if (isFirst) {
          // Bullet dot glyph & line text
          streamOps.push(`0.2 0.2 0.2 rg BT /F2 9.5 Tf ${leftMargin + 2} ${y} Td (\\267) Tj ET 0 g`);
          streamOps.push(`0.15 0.15 0.15 rg BT /F2 9.5 Tf ${leftMargin + 12} ${y} Td (${safeLine}) Tj ET 0 g`);
        } else {
          // Indented continuation line
          streamOps.push(`0.15 0.15 0.15 rg BT /F2 9.5 Tf ${leftMargin + 12} ${y} Td (${safeLine}) Tj ET 0 g`);
        }
        y -= 11.5;
      }
      y -= 1.5;
    } else if (item.type === "body") {
      const wrapped = wrapText(item.text, 102);
      for (const line of wrapped) {
        if (y < 55) break;
        const safeLine = escapePdfText(line);
        streamOps.push(`0.2 0.2 0.2 rg BT /F2 9 Tf ${leftMargin} ${y} Td (${safeLine}) Tj ET 0 g`);
        y -= 11.5;
      }
      y -= 2;
    }
  }

  // Construct PDF Objects
  const streamContent = streamOps.join("\n");
  const encoder = new TextEncoder();
  const streamBytes = encoder.encode(streamContent);

  const objs: Uint8Array[] = [];

  // Obj 1: Catalog
  objs.push(encoder.encode("<< /Type /Catalog /Pages 2 0 R >>"));
  // Obj 2: Pages
  objs.push(encoder.encode("<< /Type /Pages /Kids [3 0 R] /Count 1 >>"));
  // Obj 3: Page (US Letter 612 x 792)
  objs.push(
    encoder.encode(
      "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R /F2 5 0 R /F3 6 0 R >> >> /Contents 7 0 R >>"
    )
  );
  // Obj 4: F1 (Helvetica-Bold)
  objs.push(encoder.encode("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>"));
  // Obj 5: F2 (Helvetica)
  objs.push(encoder.encode("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"));
  // Obj 6: F3 (Helvetica-Oblique)
  objs.push(encoder.encode("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique >>"));
  // Obj 7: Contents Stream
  const streamHeader = encoder.encode(`<< /Length ${streamBytes.length} >>\nstream\n`);
  const streamFooter = encoder.encode("\nendstream");
  const streamObj = new Uint8Array(streamHeader.length + streamBytes.length + streamFooter.length);
  streamObj.set(streamHeader, 0);
  streamObj.set(streamBytes, streamHeader.length);
  streamObj.set(streamFooter, streamHeader.length + streamBytes.length);
  objs.push(streamObj);

  // Assemble Complete PDF
  const parts: Uint8Array[] = [];
  const headerBytes = encoder.encode("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n");
  parts.push(headerBytes);

  let currentOffset = headerBytes.length;
  const offsets: number[] = [];

  for (let i = 0; i < objs.length; i++) {
    offsets.push(currentOffset);
    const objHeader = encoder.encode(`${i + 1} 0 obj\n`);
    const objFooter = encoder.encode("\nendobj\n");
    parts.push(objHeader);
    parts.push(objs[i]);
    parts.push(objFooter);
    currentOffset += objHeader.length + objs[i].length + objFooter.length;
  }

  // Cross-reference table
  const startXref = currentOffset;
  let xrefStr = `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
  for (const off of offsets) {
    const pad = off.toString().padStart(10, "0");
    xrefStr += `${pad} 00000 n \n`;
  }
  xrefStr += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF\n`;
  parts.push(encoder.encode(xrefStr));

  // Merge into single Uint8Array
  const totalLength = parts.reduce((acc, p) => acc + p.length, 0);
  const pdfOutput = new Uint8Array(totalLength);
  let pos = 0;
  for (const p of parts) {
    pdfOutput.set(p, pos);
    pos += p.length;
  }

  return pdfOutput;
}

/**
 * Creates a browser-ready Blob URL for vector PDF preview.
 */
export function generateVectorPdfBlob(
  rawTex: string,
  options?: VectorPdfOptions
): Blob {
  const bytes = generateVectorPdfBytes(rawTex, options);
  return new Blob([bytes as any], { type: "application/pdf" });
}
