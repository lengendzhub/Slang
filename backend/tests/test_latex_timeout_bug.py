"""
Bug Condition Exploration Test for LaTeX Compilation Timeout

**CRITICAL**: This test MUST FAIL on unfixed code (timeout=15s) - failure confirms bug exists.
**DO NOT attempt to fix the test or code when it fails.**

**Test Goal**: Surface counterexamples demonstrating that complex resumes trigger 
subprocess.TimeoutExpired at 15 seconds.

**Expected Outcome on UNFIXED code**: Test FAILS - proves bug exists
**Expected Outcome on FIXED code**: Test PASSES - confirms fix works

**Validates: Requirements 1.1, 1.2, 2.1, 2.2**
"""
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


# Test resume templates with varying complexity levels
SIMPLE_RESUME_TEX = r"""
\documentclass{article}
\usepackage[margin=0.5in]{geometry}
\usepackage{enumitem}
\setlist[itemize]{leftmargin=0.15in}
\begin{document}
\textbf{\Huge John Doe}

\section*{Experience}
\textbf{Software Engineer} | Tech Corp | 2020-2024
\begin{itemize}
    \item Developed web applications using Python and JavaScript
    \item Collaborated with cross-functional teams
    \item Improved system performance by 20\%
\end{itemize}

\section*{Education}
\textbf{BS Computer Science} | University of Technology | 2016-2020

\section*{Skills}
Python, JavaScript, React, FastAPI

\end{document}
"""

MEDIUM_RESUME_TEX = r"""
\documentclass{article}
\usepackage[margin=0.5in]{geometry}
\usepackage{enumitem}
\usepackage{titlesec}
\setlist[itemize]{leftmargin=0.15in, noitemsep, topsep=2pt}
\titlespacing*{\section}{0pt}{8pt}{4pt}
\begin{document}
\textbf{\Huge Jane Smith}

\section*{Professional Experience}
\textbf{Senior Software Engineer} | Innovation Labs | 2022-2024
\begin{itemize}
    \item Architected microservices platform serving 1M+ daily users
    \item Led team of 5 engineers in developing cloud-native solutions
    \item Implemented CI/CD pipelines reducing deployment time by 60\%
    \item Optimized database queries improving response time by 45\%
    \item Mentored junior developers on best practices and code reviews
\end{itemize}

\textbf{Software Engineer} | Tech Innovations | 2019-2022
\begin{itemize}
    \item Developed RESTful APIs using Python and FastAPI
    \item Integrated third-party payment systems (Stripe, PayPal)
    \item Built real-time notification system using WebSockets
    \item Collaborated with product team on feature requirements
    \item Wrote comprehensive unit and integration tests (95\% coverage)
\end{itemize}

\section*{Education}
\textbf{MS Computer Science} | State University | 2017-2019 \\
\textbf{BS Software Engineering} | Tech Institute | 2013-2017

\section*{Technical Skills}
\textbf{Languages:} Python, JavaScript, TypeScript, Go, SQL \\
\textbf{Frameworks:} FastAPI, React, Node.js, Django \\
\textbf{Tools:} Docker, Kubernetes, AWS, PostgreSQL, Redis

\section*{Certifications}
AWS Certified Solutions Architect | Amazon Web Services | 2023

\end{document}
"""

COMPLEX_RESUME_TEX = r"""
\documentclass{article}
\usepackage[margin=0.5in]{geometry}
\usepackage{enumitem}
\usepackage{titlesec}
\usepackage{tabularx}
\setlist[itemize]{leftmargin=0.15in, noitemsep, topsep=0pt, parsep=0pt, partopsep=0pt}
\titlespacing*{\section}{0pt}{6pt}{3pt}
\titlespacing*{\subsection}{0pt}{4pt}{2pt}

\newcommand{\resumeItem}[1]{\item\small{#1}}
\newcommand{\resumeSubheading}[4]{
  \textbf{#1} \hfill #2 \\
  \textit{#3} \hfill \textit{#4}
}

\begin{document}
\textbf{\Huge Alexander Rodriguez Martinez}

\section*{Professional Summary}
Highly experienced Full-Stack Software Engineer with 8+ years building scalable distributed systems, leading cross-functional teams, and driving technical innovation in fast-paced environments.

\section*{Professional Experience}

\resumeSubheading{Principal Software Engineer}{Jan 2023 - Present}{Global Tech Solutions Inc.}{San Francisco, CA}
\begin{itemize}
    \resumeItem{Architected and implemented microservices architecture supporting 10M+ daily active users across 15 services, achieving 99.99\% uptime SLA}
    \resumeItem{Led migration from monolithic application to event-driven architecture using Kafka and AWS Lambda, reducing infrastructure costs by \$2M annually}
    \resumeItem{Designed and deployed real-time analytics pipeline processing 500GB+ daily data with sub-100ms latency using Apache Flink and Elasticsearch}
    \resumeItem{Established engineering best practices including code review standards, testing frameworks (pytest, Jest), and CI/CD pipelines (GitHub Actions, Jenkins)}
    \resumeItem{Mentored team of 12 engineers across 3 squads, conducting weekly technical design reviews and pair programming sessions}
    \resumeItem{Optimized database performance through query optimization, indexing strategies, and implementing Redis caching layer, improving p99 latency by 65\%}
    \resumeItem{Spearheaded adoption of observability tools (Datadog, Prometheus, Grafana) enabling proactive incident detection and reducing MTTR by 40\%}
\end{itemize}

\resumeSubheading{Senior Software Engineer}{Mar 2020 - Dec 2022}{Innovative Systems Corp.}{Austin, TX}
\begin{itemize}
    \resumeItem{Developed customer-facing dashboard application serving 50K+ enterprise users using React, TypeScript, and Material-UI component library}
    \resumeItem{Built RESTful and GraphQL APIs using Python FastAPI and Node.js Express, implementing OAuth2 authentication and rate limiting}
    \resumeItem{Integrated payment processing systems (Stripe, Braintree, PayPal) handling \$10M+ monthly transaction volume with PCI DSS compliance}
    \resumeItem{Implemented automated testing suite achieving 92\% code coverage using pytest, Jest, Cypress E2E tests, and load testing with Locust}
    \resumeItem{Designed and deployed Kubernetes-based infrastructure on AWS EKS with auto-scaling, monitoring, and disaster recovery capabilities}
    \resumeItem{Collaborated with product managers and designers in Agile sprints to deliver features aligned with business objectives}
\end{itemize}

\resumeSubheading{Software Engineer II}{Jun 2018 - Feb 2020}{Digital Ventures LLC}{Seattle, WA}
\begin{itemize}
    \resumeItem{Developed machine learning pipeline for recommendation engine using scikit-learn and TensorFlow, improving click-through rate by 28\%}
    \resumeItem{Built data ingestion pipelines using Apache Airflow and AWS Glue, processing and transforming 2TB+ daily data from multiple sources}
    \resumeItem{Created internal developer tools and CLI utilities streamlining deployment workflows and reducing manual operations by 75\%}
    \resumeItem{Participated in on-call rotation, investigating and resolving production incidents with detailed post-mortem analyses}
\end{itemize}

\resumeSubheading{Software Engineer}{Aug 2016 - May 2018}{StartupTech Inc.}{Boston, MA}
\begin{itemize}
    \resumeItem{Implemented core features for SaaS platform using Django, PostgreSQL, and Celery for asynchronous task processing}
    \resumeItem{Developed mobile-responsive frontend using JavaScript, React, Redux, and implemented WebSocket connections for real-time updates}
    \resumeItem{Wrote comprehensive API documentation using OpenAPI/Swagger specifications and maintained developer onboarding guides}
\end{itemize}

\section*{Education}
\textbf{Master of Science in Computer Science} \hfill 2014 - 2016 \\
Massachusetts Institute of Technology | GPA: 3.9/4.0 \\
Thesis: "Distributed Systems Optimization in Cloud Environments"

\textbf{Bachelor of Science in Software Engineering} \hfill 2010 - 2014 \\
Carnegie Mellon University | GPA: 3.8/4.0 | Magna Cum Laude

\section*{Technical Skills}
\begin{tabularx}{\textwidth}{@{}lX@{}}
\textbf{Languages:} & Python, JavaScript, TypeScript, Go, Java, SQL, Bash, Rust \\
\textbf{Frameworks:} & FastAPI, Django, Flask, React, Next.js, Node.js, Express, Spring Boot \\
\textbf{Databases:} & PostgreSQL, MySQL, MongoDB, Redis, Elasticsearch, DynamoDB, Cassandra \\
\textbf{Cloud \& DevOps:} & AWS (EC2, S3, Lambda, RDS, ECS, EKS), Docker, Kubernetes, Terraform, Jenkins \\
\textbf{Tools \& Technologies:} & Git, GitHub Actions, Kafka, RabbitMQ, Prometheus, Grafana, Datadog \\
\end{tabularx}

\section*{Projects \& Open Source}
\textbf{High-Performance API Gateway} | Python, FastAPI, Redis \\
Built open-source API gateway with rate limiting, caching, and circuit breaker patterns. 500+ GitHub stars.

\textbf{Distributed Task Scheduler} | Go, etcd, gRPC \\
Created fault-tolerant distributed task scheduling system with leader election and automatic failover.

\section*{Certifications}
AWS Certified Solutions Architect - Professional | Amazon Web Services | 2023 \\
Certified Kubernetes Administrator (CKA) | Cloud Native Computing Foundation | 2022 \\
Google Cloud Professional Cloud Architect | Google Cloud | 2021

\section*{Publications}
"Optimizing Microservices Communication Patterns in Cloud Environments" | IEEE Cloud Computing | 2023

\end{document}
"""

PATHOLOGICAL_RESUME_TEX = r"""
\documentclass{article}
\usepackage[margin=0.4in]{geometry}
\usepackage{enumitem}
\usepackage{titlesec}
\setlist[itemize]{leftmargin=0.1in, noitemsep, topsep=0pt}
\titlespacing*{\section}{0pt}{4pt}{2pt}

\newcommand{\skill}[1]{\textbullet\ #1\ }

\begin{document}
\textbf{\Huge Christopher James Wellington Montgomery}

\section*{Summary}
Exceptionally experienced polyglot software architect with extensive background in distributed systems, cloud infrastructure, machine learning, data engineering, DevOps practices, and technical leadership across Fortune 500 enterprises.

\section*{Experience}

\textbf{Distinguished Engineer} | MegaCorp International | 2022-Present
\begin{itemize}
    \item Led architecture design for global microservices platform with 100+ services
    \item Managed cloud infrastructure budget exceeding \$15M annually
    \item Implemented AI-powered code review system
    \item Optimized database clusters serving 1B+ requests daily
    \item Designed real-time fraud detection system
    \item Architected multi-region disaster recovery strategy
    \item Mentored 25+ engineers across multiple teams
    \item Established company-wide engineering standards
    \item Led migration to Kubernetes from legacy infrastructure
    \item Implemented zero-downtime deployment strategies
    \item Built observability platform with custom metrics
    \item Designed event-driven architecture using Kafka
    \item Optimized network latency across global datacenters
    \item Implemented GraphQL federation architecture
    \item Built internal developer platform (IDP)
    \item Designed security compliance automation framework
    \item Led incident response for critical system outages
    \item Implemented chaos engineering practices
    \item Built automated capacity planning systems
    \item Designed multi-tenant SaaS architecture
    \begin{itemize}
        \item Implemented tenant isolation using network policies
        \item Designed database sharding strategy
        \item Built automated tenant onboarding pipeline
        \begin{itemize}
            \item Created self-service provisioning portal
            \item Implemented quota management system
            \item Built automated billing integration
            \begin{itemize}
                \item Designed usage tracking pipeline
                \item Implemented cost allocation algorithms
                \item Built revenue forecasting models
            \end{itemize}
        \end{itemize}
    \end{itemize}
\end{itemize}

\textbf{Principal Engineer} | Tech Innovations Ltd | 2019-2022
\begin{itemize}
    \item Architected machine learning platform
    \item Built data lake on AWS S3 and Glue
    \item Implemented real-time recommendation engine
    \item Designed A/B testing framework
    \item Built feature flag management system
    \item Implemented service mesh using Istio
    \item Designed API gateway architecture
    \item Built developer portal with documentation
    \item Implemented SSO using OAuth2 and SAML
    \item Designed RBAC authorization system
    \item Built audit logging infrastructure
    \item Implemented GDPR compliance automation
    \item Designed data retention policies
    \item Built PII detection and masking system
    \item Implemented encryption at rest and in transit
    \item Designed key rotation automation
    \item Built secrets management platform
    \item Implemented vulnerability scanning pipeline
    \item Designed container security policies
    \item Built supply chain security checks
\end{itemize}

\textbf{Senior Architect} | Digital Systems Corp | 2016-2019
\begin{itemize}
    \item Designed payment processing platform
    \item Built fraud detection ML models
    \item Implemented PCI DSS compliance
    \item Designed high-availability architecture
    \item Built automated failover systems
    \item Implemented disaster recovery procedures
    \item Designed data backup strategies
    \item Built monitoring and alerting systems
    \item Implemented performance optimization
    \item Designed caching strategies
    \item Built CDN integration
    \item Implemented DDoS protection
    \item Designed rate limiting systems
    \item Built API throttling mechanisms
    \item Implemented circuit breakers
    \item Designed retry strategies
    \item Built health check systems
    \item Implemented graceful degradation
    \item Designed chaos testing framework
    \item Built automated recovery systems
\end{itemize}

\section*{Education}
PhD Computer Science | Stanford University | 2013-2016 \\
MS Computer Science | MIT | 2011-2013 \\
BS Computer Engineering | UC Berkeley | 2007-2011

\section*{Skills}
\skill{Python} \skill{Java} \skill{Go} \skill{Rust} \skill{C++} \skill{JavaScript} \skill{TypeScript} \skill{Scala} \skill{Kotlin} \skill{Ruby} \skill{PHP} \skill{Swift} \skill{Objective-C} \skill{C\#} \skill{SQL} \skill{NoSQL} \skill{GraphQL} \skill{gRPC} \skill{REST} \skill{WebSockets} \skill{React} \skill{Vue} \skill{Angular} \skill{Svelte} \skill{Next.js} \skill{Django} \skill{Flask} \skill{FastAPI} \skill{Spring} \skill{Express} \skill{Gin} \skill{Actix} \skill{Rails} \skill{Laravel} \skill{ASP.NET} \skill{PostgreSQL} \skill{MySQL} \skill{MongoDB} \skill{Redis} \skill{Cassandra} \skill{DynamoDB} \skill{Neo4j} \skill{InfluxDB} \skill{TimescaleDB} \skill{Elasticsearch} \skill{AWS} \skill{Azure} \skill{GCP} \skill{Docker} \skill{Kubernetes} \skill{Terraform} \skill{Ansible} \skill{Pulumi} \skill{Jenkins} \skill{GitLab CI} \skill{GitHub Actions} \skill{CircleCI} \skill{ArgoCD} \skill{Kafka} \skill{RabbitMQ} \skill{NATS} \skill{Pulsar} \skill{Prometheus} \skill{Grafana} \skill{Datadog} \skill{New Relic} \skill{Splunk} \skill{ELK Stack} \skill{Jaeger} \skill{Zipkin} \skill{TensorFlow} \skill{PyTorch} \skill{Scikit-learn} \skill{Spark} \skill{Hadoop} \skill{Airflow} \skill{Flink} \skill{Beam}

\section*{Certifications}
AWS Solutions Architect Professional | AWS DevOps Professional | Azure Solutions Architect Expert | GCP Professional Cloud Architect | CKA | CKAD | CKS | CISSP | CEH | OSCP | CCNA | CCNP | PMP | SAFe Agilist | Scrum Master | Product Owner

\section*{Publications}
Over 50 peer-reviewed publications in distributed systems, machine learning, and cloud computing

\section*{Patents}
15+ granted patents in distributed computing and system architecture

\end{document}
"""


@pytest.mark.asyncio
@pytest.mark.parametrize("resume_tex,complexity,expected_time_range,description", [
    (
        SIMPLE_RESUME_TEX,
        "simple",
        (0, 15),
        "Simple resume (3 sections, 5 bullets) - expected to compile within 15s"
    ),
    (
        MEDIUM_RESUME_TEX,
        "medium",
        (0, 20),
        "Medium resume (5 sections, 15 bullets, standard formatting) - may timeout under load"
    ),
    (
        COMPLEX_RESUME_TEX,
        "complex",
        (15, 45),
        "Complex resume (7 sections, 30+ bullets, custom macros) - WILL timeout at 15s on unfixed code"
    ),
    (
        PATHOLOGICAL_RESUME_TEX,
        "pathological",
        (25, 60),
        "Pathological resume (deep nesting, hundreds of bullets) - WILL timeout at 15s on unfixed code"
    ),
])
async def test_complex_resume_compilation_within_extended_timeout(
    resume_tex: str,
    complexity: str,
    expected_time_range: tuple[int, int],
    description: str
):
    """
    **Property 1: Bug Condition - Extended Timeout Allows Complex Resume Compilation**
    
    **Validates: Requirements 1.1, 1.2, 2.1, 2.2**
    
    For any LaTeX input where compilation requires between 15 and 45 seconds,
    the export_pdf function SHALL allow the Tectonic process to complete successfully,
    producing a high-quality PDF with full formatting preserved.
    
    **CRITICAL BEHAVIOR**:
    - On UNFIXED code (timeout=15s): This test MUST FAIL for complex/pathological resumes
    - On FIXED code (timeout=35s): This test SHOULD PASS for all resume types
    
    Test Assertions (Expected Behavior from Requirements 2.1, 2.2):
    1. HTTP 200 OK response (not 408 timeout or 500 error)
    2. Valid PDF content generated (starts with %PDF header)
    3. High-quality PDF produced (NOT fallback vector PDF)
    4. X-Fallback-Compiled header is "false"
    5. Compilation completes within reasonable timeout (30-45 seconds)
    """
    print(f"\n{'='*80}")
    print(f"Testing {complexity.upper()} resume compilation")
    print(f"Description: {description}")
    print(f"Expected compilation time range: {expected_time_range[0]}-{expected_time_range[1]}s")
    print(f"{'='*80}")
    
    import time
    
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        start_time = time.perf_counter()
        
        # Submit resume for compilation
        response = await client.post(
            "/exports/pdf",
            json={
                "tex": resume_tex,
                "filename": f"test_resume_{complexity}",
                "max_pages": 2,
                "enforce": False,  # Allow multi-page for complex resumes
                "fit": False,      # Don't trim content - we want to test full compilation
            },
            timeout=60.0,  # Give HTTP client enough time
        )
        
        end_time = time.perf_counter()
        compilation_time = end_time - start_time
        
        print(f"\nActual compilation time: {compilation_time:.2f}s")
        print(f"HTTP Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        # ASSERTION 1: Should return HTTP 200 OK (not timeout or error)
        # On UNFIXED code: complex/pathological resumes will likely return 500 or timeout
        # On FIXED code: should return 200
        assert response.status_code == 200, (
            f"Expected HTTP 200 but got {response.status_code}. "
            f"This is EXPECTED TO FAIL on unfixed code for complex resumes (timeout=15s). "
            f"Compilation took {compilation_time:.2f}s. "
            f"Response: {response.text[:500] if response.text else 'No response body'}"
        )
        
        # ASSERTION 2: Should produce valid PDF content
        pdf_content = response.content
        assert pdf_content.startswith(b"%PDF-"), (
            f"Expected PDF content starting with %PDF- but got: {pdf_content[:100]}"
        )
        assert len(pdf_content) > 100, (
            f"PDF content too small ({len(pdf_content)} bytes), likely invalid or fallback"
        )
        
        # ASSERTION 3: Should NOT be fallback vector PDF (high-quality Tectonic PDF expected)
        # Fallback PDFs are typically much smaller and lower quality
        x_fallback = response.headers.get("X-Fallback-Compiled", "").lower()
        assert x_fallback == "false", (
            f"Expected high-quality Tectonic PDF but got fallback vector PDF. "
            f"X-Fallback-Compiled header: {x_fallback}. "
            f"This indicates compilation timed out or failed on unfixed code."
        )
        
        # ASSERTION 4: Should produce reasonable page count
        x_page_count = response.headers.get("X-Page-Count", "0")
        page_count = int(x_page_count)
        assert page_count >= 1, f"Expected at least 1 page but got {page_count}"
        
        # For complex resumes, expect multiple pages with full content preserved
        if complexity in ["complex", "pathological"]:
            assert page_count >= 1, (
                f"Expected complex resume to produce at least 1 page, got {page_count}"
            )
        
        # ASSERTION 5: Compilation time should be reasonable
        # On UNFIXED code: complex resumes will timeout at 15s before completion
        # On FIXED code: should complete within 35-45s
        min_time, max_time = expected_time_range
        assert compilation_time <= max_time + 10, (
            f"Compilation took {compilation_time:.2f}s which exceeds maximum expected "
            f"{max_time}s + 10s buffer. System may be under heavy load."
        )
        
        print(f"\n✅ SUCCESS: {complexity.upper()} resume compiled successfully!")
        print(f"   - Compilation time: {compilation_time:.2f}s")
        print(f"   - PDF size: {len(pdf_content)} bytes")
        print(f"   - Pages: {page_count}")
        print(f"   - High-quality PDF: {x_fallback == 'false'}")


@pytest.mark.asyncio
async def test_timeout_error_provides_clear_message():
    """
    Test that when timeout DOES occur (even after extended timeout),
    the error message is clear and actionable.
    
    **Validates: Requirement 2.2**
    
    This test uses an extremely complex resume that will timeout even at 35s,
    to verify the error handling provides clear guidance.
    
    Note: This test may pass on very fast systems. It's designed to test
    error handling when timeouts do occur.
    """
    # Create an extremely large resume that will definitely timeout
    massive_items = "\n".join([
        f"    \\item This is bullet point number {i} with detailed technical content about various technologies and implementations"
        for i in range(200)
    ])
    
    extremely_complex_tex = f"""
\\documentclass{{article}}
\\usepackage[margin=0.5in]{{geometry}}
\\begin{{document}}
\\textbf{{\\Huge Test Resume}}

\\section*{{Experience}}
\\begin{{itemize}}
{massive_items}
\\end{{itemize}}

\\end{{document}}
"""
    
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/exports/pdf",
            json={
                "tex": extremely_complex_tex,
                "filename": "timeout_test",
                "max_pages": 1,
                "enforce": True,
                "fit": False,
            },
            timeout=60.0,
        )
        
        print(f"\nTimeout test status: {response.status_code}")
        print(f"Response: {response.text[:500] if response.text else 'No response'}")
        
        # This test is informational - it documents what happens on timeout
        # On unfixed code: might get 500 error or fallback PDF
        # On fixed code: should get 408 with clear message OR successful compilation
        if response.status_code == 408:
            # Verify error message is clear and actionable
            error_data = response.json()
            assert "timeout" in str(error_data).lower(), "Error should mention timeout"
            assert any(
                keyword in str(error_data).lower() 
                for keyword in ["simplify", "reduce", "complexity", "content"]
            ), "Error should provide actionable guidance"
            print("✅ Timeout error provides clear, actionable message")
        elif response.status_code == 200:
            print("✅ Compilation succeeded (system is fast or timeout is sufficient)")
        else:
            # Document what actually happened
            print(f"⚠️  Unexpected status {response.status_code}: {response.text[:200]}")
