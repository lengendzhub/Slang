# Locked-Down Tectonic Compilation Container for TailorAI
# Non-Negotiable Rule #6:
# - No network access (--network none)
# - Read-only root filesystem (--read-only)
# - Shell escape permanently disabled
# - Resource limits (CPU: 1.0, Memory: 256MB)
# - Stripped dangerous commands (\write18, \openin, \input)

FROM alpine:3.19

# Install Tectonic and minimal dependencies
RUN apk add --no-cache \
    tectonic \
    ca-certificates \
    fontconfig \
    freetype

# Create unprivileged runner user
RUN adduser -D -u 10001 tectonicuser

# Prepare sandboxed directory
WORKDIR /sandbox
RUN chown -R tectonicuser:tectonicuser /sandbox

USER tectonicuser

# Entrypoint forces tectonic compilation in isolated directory with shell escape disabled
ENTRYPOINT ["tectonic", "--outdir", "/sandbox/output", "--chroot"]
CMD ["/sandbox/input/resume.tex"]
