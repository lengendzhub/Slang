export const DEFAULT_MASTER_LATEX = `%-------------------------
% Resume in Latex
% Author : Alex Morgan
% Template : Jake's Resume
%------------------------

\\documentclass[letterpaper,11pt]{article}

\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{tabularx}
\\input{glyphtounicode}

\\pagestyle{fancy}
\\fancyhf{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

\\addtolength{\\oddsidemargin}{-0.5in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1in}
\\addtolength{\\topmargin}{-.5in}
\\addtolength{\\textheight}{1.0in}

\\urlstyle{same}
\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

\\titleformat{\\section}{
  \\vspace{-4pt}\\scshape\\raggedright\\large
}{}{0em}{}[\\color{black}\\titlerule \\vspace{-5pt}]

\\pdfgentounicode=1

\\newcommand{\\resumeItem}[1]{
  \\item\\small{
    {#1 \\vspace{-2pt}}
  }
}

\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-2pt}\\item
    \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} & #2 \\\\
      \\textit{\\small#3} & \\textit{\\small #4} \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\begin{document}

\\begin{center}
    \\textbf{\\Huge \\scshape Alex Morgan} \\\\ \\vspace{1pt}
    \\small 415-555-0198 $|$ \\href{mailto:alex.morgan@email.com}{\\underline{alex.morgan@email.com}} $|$ 
    \\href{https://linkedin.com/in/alexmorgan}{\\underline{linkedin.com/in/alexmorgan}} $|$
    \\href{https://github.com/alexmorgan}{\\underline{github.com/alexmorgan}}
\\end{center}

\\section{Experience}
  \\begin{itemize}[leftmargin=0.15in, label={}]
    \\resumeSubheading
      {Senior Software Engineer}{June 2022 -- Present}
      {Nexus Cloud Systems}{San Francisco, CA}
      \\begin{itemize}
        \\resumeItem{Architected distributed caching layer with Redis, reducing p99 API query latency by 42\\% across 10M daily requests.}
        \\resumeItem{Spearheaded migration of core billing microservices to Go and PostgreSQL, improving transaction throughput by 3.5x.}
        \\resumeItem{Mentored 4 junior engineers on distributed consensus, design patterns, and automated testing practices.}
      \\end{itemize}

    \\resumeSubheading
      {Software Engineering Intern}{May 2021 -- Aug. 2021}
      {DataVibe Analytics}{San Jose, CA}
      \\begin{itemize}
        \\resumeItem{Developed automated data ingestion pipelines in Python processing 500GB daily log streams into Snowflake.}
        \\resumeItem{Collaborated with data science teams to optimize SQL queries, decreasing ETL pipeline execution cost by 20\\%.}
      \\end{itemize}
  \\end{itemize}

\\section{Projects}
  \\begin{itemize}[leftmargin=0.15in, label={}]
    \\item
      \\textbf{HyperKV Storage Engine} $|$ \\emph{Rust, RocksDB, gRPC, Raft} \\\\
      \\begin{itemize}
        \\resumeItem{Built a high-throughput, distributed key-value store implementing the Raft consensus algorithm in Rust.}
      \\end{itemize}
    \\item
      \\textbf{QueryLens SQL Optimizer} $|$ \\emph{Python, AST, PostgreSQL} \\\\
      \\begin{itemize}
        \\resumeItem{Constructed an AST-based query analyzer suggesting index additions and eliminating N+1 execution bottlenecks. Adopted by 1,200+ GitHub developers with 4.9-star rating.}
      \\end{itemize}
  \\end{itemize}

\\section{Technical Skills}
 \\begin{itemize}[leftmargin=0.15in, label={}]
    \\small{\\item{
     \\textbf{Languages}{: Python, Go, Rust, TypeScript, JavaScript, SQL} \\\\
     \\textbf{Frameworks}{: FastAPI, React, Next.js, Node.js, gRPC} \\\\
     \\textbf{Cloud \\& Systems}{: Docker, Kubernetes, AWS, PostgreSQL, Redis, Snowflake, Linux}
    }}
 \\end{itemize}

\\end{document}
`;

export const DEFAULT_JOB_DESCRIPTION = `Role: Staff / Senior Distributed Systems Engineer
Company: CloudScale Infrastructure
Location: Remote / San Francisco, CA

About the Role:
We are seeking an experienced Backend Engineer to lead our low-latency distributed storage and streaming infrastructure. You will design, scale, and maintain mission-critical data pipelines and caching services handling billions of daily events.

Key Responsibilities:
- Architect high-throughput distributed systems and caching layers with microsecond latencies.
- Lead microservice migrations and refactoring to modern languages (Go, Rust).
- Mentor junior and mid-level software engineers across engineering squads.
- Drive reliability, zero-downtime deployments, and end-to-end distributed tracing.

Mandatory / Essential Requirements:
- 4+ years of professional backend software development experience.
- Deep expertise in distributed caching (Redis, Memcached) and relational databases (PostgreSQL).
- Demonstrated experience writing concurrent, memory-safe backend services in Go, Rust, or Python.
- Proven track record mentoring engineers and conducting architectural design reviews.

Required Qualifications:
- Experience with containerization (Docker, Kubernetes) and CI/CD automation.
- Solid understanding of distributed consensus protocols (Raft, Paxos).

Preferred / Nice to Have:
- Hands-on experience with Kafka or event-driven streaming architectures.
- Bachelor's degree in Computer Science or related quantitative field.
`;
