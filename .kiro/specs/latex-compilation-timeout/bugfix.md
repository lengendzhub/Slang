# Bugfix Requirements Document

## Introduction

The LaTeX compilation system currently fails when resume compilation takes longer than 15 seconds, resulting in a timeout that produces either a low-quality fallback PDF or compilation failure. This impacts users with complex resumes containing multiple sections, detailed formatting, or extensive content. The error manifests as user-facing messages like "LaTeX compilation has too long" and "Preview Compilation Issue - LaTeX compilation was too slow", blocking the core resume generation functionality.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN a resume LaTeX document requires more than 15 seconds to compile THEN the system terminates the Tectonic process with `subprocess.TimeoutExpired` exception

1.2 WHEN the compilation timeout occurs THEN the system silently falls back to a low-quality vector PDF generator without informing the user of the quality degradation

1.3 WHEN the timeout exception is caught THEN the system sets `run = None` and breaks the compilation loop, leaving `data` empty or minimal

1.4 WHEN users receive timeout-related errors THEN the error messages are vague ("too long", "too slow") without actionable guidance on how to resolve the issue

### Expected Behavior (Correct)

2.1 WHEN a resume LaTeX document requires more than 15 seconds to compile THEN the system SHALL allow up to 30-45 seconds for compilation to complete successfully

2.2 WHEN the compilation timeout occurs even after extended timeout THEN the system SHALL provide a clear error message explaining the timeout and suggesting user actions (e.g., "Resume compilation exceeded 30 seconds - try simplifying content or reducing formatting complexity")

2.3 WHEN the system falls back to the vector PDF generator THEN the system SHALL clearly communicate to the user that a simplified PDF was generated and offer options to retry with optimizations

2.4 WHEN compilation is in progress THEN the system SHALL provide progressive feedback to indicate the operation is active and not stalled

### Unchanged Behavior (Regression Prevention)

3.1 WHEN a resume LaTeX document compiles successfully within the original 15-second window THEN the system SHALL CONTINUE TO produce the same high-quality PDF output without any changes to compilation behavior

3.2 WHEN the Tectonic compilation produces a multi-page resume requiring trimming THEN the system SHALL CONTINUE TO apply the iterative trimming logic (compact spacing, trim bullets) as currently implemented

3.3 WHEN the LaTeX content contains blocked security commands THEN the system SHALL CONTINUE TO reject the compilation with the existing security validation

3.4 WHEN the vector PDF fallback generator is invoked for valid reasons (missing Tectonic binary, compilation errors) THEN the system SHALL CONTINUE TO generate the fallback PDF with the same content extraction and formatting logic
