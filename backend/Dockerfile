# Multi-stage production container for Slang FastAPI Backend + Tectonic LaTeX Engine
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    fontconfig \
    libfontconfig1 \
    libfreetype6 \
    libgraphite2-3 \
    libharfbuzz0b \
    && rm -rf /var/lib/apt/lists/*

# Install Tectonic typesetting binary (static musl release with zero external shared library conflicts)
RUN curl -sSL https://github.com/tectonic-typesetting/tectonic/releases/download/tectonic%400.15.0/tectonic-0.15.0-x86_64-unknown-linux-musl.tar.gz \
    | tar -xz -C /usr/local/bin \
    && chmod +x /usr/local/bin/tectonic

# Verify Tectonic binary installation
RUN tectonic --version

# Install Python requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source & templates
COPY app/ ./app/
COPY templates/ ./templates/

# Pre-warm Tectonic package cache with real resume template so production compiles are instantaneous
RUN tectonic -X compile templates/jakes_resume.tex --outdir /tmp && rm -rf /tmp/*

# Environment defaults
ENV PORT=8000
ENV PYTHONUNBUFFERED=1

EXPOSE 8000

# Start Uvicorn
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
