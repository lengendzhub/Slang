# Multi-stage production container for Slang FastAPI Backend + Tectonic LaTeX Engine
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies & download official Tectonic binary
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    fontconfig \
    libfreetype6 \
    && rm -rf /var/lib/apt/lists/*

# Install Tectonic typesetting binary
RUN curl -sSL https://github.com/tectonic-typesetting/tectonic/releases/download/tectonic%400.15.0/tectonic-0.15.0-x86_64-unknown-linux-gnu.tar.gz \
    | tar -xz -C /usr/local/bin \
    && chmod +x /usr/local/bin/tectonic

# Pre-warm tectonic cache with a minimal test file so production compiles are instantaneous
RUN echo "\\documentclass{article}\\begin{document}init\\end{document}" > /tmp/init.tex \
    && tectonic /tmp/init.tex --outdir /tmp \
    && rm -rf /tmp/init.*

# Install Python requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source & templates
COPY app/ ./app/
COPY templates/ ./templates/

# Environment defaults
ENV PORT=8000
ENV PYTHONUNBUFFERED=1

EXPOSE 8000

# Start Uvicorn
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
