# LaTeX Compilation Timeout Bugfix Design

## Overview

The current LaTeX compilation system in `export_pdf.py` uses a 15-second timeout that is too aggressive for complex resumes with extensive formatting, multiple sections, or detailed content. When the timeout is exceeded, the system falls back to a low-quality vector PDF generator without clear user communication, degrading the output quality significantly. This fix will extend the timeout to 30-45 seconds, improve error handling, and provide clear user feedback when compilation issues occur. The fix preserves all existing behavior for resumes that compile within the current timeout window.

## Glossary

- **Bug_Condition (C)**: The condition that triggers the bug - when LaTeX compilation takes longer than 15 seconds for complex resumes
- **Property (P)**: The desired behavior when compilation requires extended time - successful compilation within 30-45 seconds with appropriate user feedback
- **Preservation**: Existing compilation behavior for fast-compiling resumes and all fallback mechanisms that must remain unchanged
- **export_pdf()**: The FastAPI route handler in `backend/app/api/export_pdf.py` that processes compilation requests
- **Tectonic**: The XeTeX-based LaTeX compiler invoked via subprocess with `-X compile -C --untrusted` flags
- **subprocess.TimeoutExpired**: The exception raised when the Tectonic process exceeds the timeout parameter
- **Fallback PDF Generator**: The `_generate_vector_pdf_fallback()` function that produces a simplified vector PDF when Tectonic compilation fails
- **Trim Loop**: The iterative logic (lines 236-271) that attempts to fit the resume to `max_pages` by compacting spacing and trimming bullets

## Bug Details

### Bug Condition

The bug manifests when a resume LaTeX document requires more than 15 seconds to compile due to complexity (extensive content, heavy formatting, large bullet lists, complex macros, or detailed LaTeX structures). The `export_pdf()` function invokes Tectonic with a hardcoded 15-second timeout, and when exceeded, the compilation is terminated with a `subprocess.TimeoutExpired` exception, causing the system to either fail entirely or silently fall back to a low-quality vector PDF.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type ExportRequest containing tex_content
  OUTPUT: boolean
  
  RETURN compilationTime(input.tex_content) > 15 seconds
         AND input.tex_content is valid LaTeX
         AND Tectonic process is terminated with TimeoutExpired
         AND user receives timeout error OR low-quality fallback PDF
END FUNCTION
```

### Examples

- **Complex Resume with 15+ Bullets**: User uploads a resume with 5 work experiences, each containing 4-5 detailed bullet points with heavy LaTeX formatting (custom macros, spacing adjustments, font variations). Compilation takes 18 seconds. Current system: TimeoutExpired exception, falls back to vector PDF losing all formatting. Expected: Compilation completes successfully within 30-second timeout.

- **Multi-Section Resume with Custom Formatting**: User's resume includes Education, Experience, Projects, Skills, Achievements, and Publications sections with custom `\titlespacing`, `\setlist` commands, and complex tabular environments. Compilation takes 22 seconds. Current system: Timeout occurs, user sees vague "too slow" error. Expected: Compilation completes with clear progress indication.

- **Resume with Large Skill Matrix**: User has a comprehensive skills section with nested itemize environments and custom macros for skill ratings. Compilation takes 16 seconds. Current system: Timeout, fallback to vector PDF that incorrectly renders nested lists. Expected: Full compilation with proper formatting.

- **Edge Case - Minimal Resume (3 sections, 5 bullets)**: Compilation takes 2 seconds. Current system: Completes successfully. Expected: Identical behavior - completes successfully with no changes.

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Resumes that compile successfully within 15 seconds must produce identical PDF output with the same compilation speed and quality
- The iterative trimming logic (compact spacing first, then trim bullets) must continue to work exactly as before when `fit=True` and page count exceeds `max_pages`
- The security validation that blocks `\write18`, `\openin`, `\input` (except glyphtounicode) must remain unchanged
- The fallback vector PDF generator must continue to be invoked for legitimate failures (missing Tectonic binary, actual LaTeX syntax errors, blocked commands)
- All LaTeX sanitization logic (character escaping, package stubbing, Unicode normalization) must remain identical
- The response headers (`X-Page-Count`, `X-Fallback-Compiled`, `Content-Disposition`) must be generated with the same values
- Preview generation logic (extracting page text with `fitz.get_text()`) must work identically
- The `enforce` parameter behavior (when `False`, allows multi-page PDFs) must be preserved

**Scope:**
All inputs that compile within the original 15-second timeout should be completely unaffected by this fix. This includes:
- Simple resumes with minimal formatting
- Resumes with few sections or bullet points
- Resumes that fail validation (blocked commands, invalid LaTeX syntax)
- Requests where `tectonic_bin` is not found (immediately uses fallback)
- All non-timeout error conditions (compilation errors, missing packages, malformed LaTeX)

## Hypothesized Root Cause

Based on the bug description and code analysis, the root cause is clearly identified:

1. **Hardcoded Aggressive Timeout**: Line 241 in `export_pdf.py` contains `timeout=15` - a fixed 15-second timeout that is insufficient for complex resumes. Modern LaTeX compilers like Tectonic perform extensive typesetting calculations (kerning, line breaking, page layout optimization, font metrics) that scale with document complexity.

2. **Silent Exception Handling**: Lines 238-244 catch `subprocess.TimeoutExpired` and set `run = None`, then `break` the trim loop. This causes the condition on line 246 (`if not run or run.returncode != 0`) to trigger, which breaks out of the loop with `data` still empty or from a previous incomplete attempt.

3. **Immediate Fallback Without User Notice**: Lines 274-276 detect empty `data` and invoke `_generate_vector_pdf_fallback()`, but the user is not informed that their resume was downgraded to a low-quality vector PDF. The `X-Fallback-Compiled: true` header is set, but frontend may not display this prominently.

4. **No Incremental Feedback**: The synchronous `subprocess.run()` call (wrapped in `asyncio.to_thread()`) provides no progress indication during the 15-second wait, leaving users uncertain whether the system is working or frozen.

## Correctness Properties

Property 1: Bug Condition - Extended Timeout Allows Complex Resume Compilation

_For any_ LaTeX input where compilation requires between 15 and 45 seconds, the fixed export_pdf function SHALL allow the Tectonic process to complete successfully, producing a high-quality PDF with full formatting preserved.

**Validates: Requirements 2.1, 2.2**

Property 2: Preservation - Fast Compilation Behavior Unchanged

_For any_ LaTeX input where compilation completes within 15 seconds, the fixed export_pdf function SHALL produce exactly the same PDF output with identical performance characteristics as the original implementation, preserving all existing compilation logic and timing.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4**

## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct (hardcoded 15-second timeout):

**File**: `backend/app/api/export_pdf.py`

**Function**: `export_pdf(req: ExportRequest)`

**Specific Changes**:

1. **Extend Timeout Parameter**: Change line 241 from `timeout=15` to `timeout=35`
   - Implementation: Replace the hardcoded `15` with a configurable timeout value of `35` seconds
   - Rationale: 35 seconds provides a reasonable balance - allows complex resumes to compile while preventing infinite hangs
   - Alternative: Make timeout configurable via environment variable `LATEX_COMPILATION_TIMEOUT` with default 35

2. **Add Timeout Exception Handling with Clear Error Messages**: Enhance lines 238-244 exception handling
   - Implementation: Catch `subprocess.TimeoutExpired` separately and raise an informative HTTPException
   - Error message: "Resume compilation exceeded {timeout} seconds. Try simplifying content, reducing bullet points, or removing complex formatting."
   - Status code: 408 Request Timeout (or 500 Internal Server Error with specific error code)

3. **Add User Notification for Fallback PDF Generation**: Modify lines 274-276 fallback logic
   - Implementation: When falling back to vector PDF, log a warning and include a header `X-Fallback-Reason` describing why
   - Possible reasons: "compilation_timeout", "compilation_error", "missing_tectonic", "blocked_command"
   - Frontend should detect this header and display a prominent message: "A simplified PDF was generated. For best results, try reducing resume complexity."

4. **Add Progressive Feedback Mechanism (Optional Enhancement)**: 
   - Implementation: For compilation attempts taking >10 seconds, emit progress updates via logging or WebSocket
   - Message: "Compiling complex resume... this may take up to 45 seconds"
   - Rationale: Users won't perceive the system as frozen during long compilations

5. **Add Compilation Timing Metrics**: 
   - Implementation: Record compilation start/end times and log them for monitoring
   - Add header `X-Compilation-Time` with actual compilation duration in seconds
   - Rationale: Helps identify patterns in slow compilations and validates the fix

### Code Changes Detail

**Change 1: Timeout Configuration**
```python
# Line 238-244 (current)
try:
    run = await asyncio.to_thread(
        subprocess.run,
        [tectonic_bin, "-X", "compile", "-C", "--untrusted", "resume.tex"],
        cwd=tmp,
        capture_output=True,
        text=True,
        timeout=15,  # ← CHANGE THIS
    )
except (subprocess.TimeoutExpired, Exception):
    run = None
    break

# Line 238-249 (proposed)
LATEX_TIMEOUT = int(os.environ.get("LATEX_COMPILATION_TIMEOUT", "35"))

try:
    run = await asyncio.to_thread(
        subprocess.run,
        [tectonic_bin, "-X", "compile", "-C", "--untrusted", "resume.tex"],
        cwd=tmp,
        capture_output=True,
        text=True,
        timeout=LATEX_TIMEOUT,  # ← Now 35 seconds by default
    )
except subprocess.TimeoutExpired:
    _fail(
        408,
        "compilation_timeout",
        f"Resume compilation exceeded {LATEX_TIMEOUT} seconds. Try simplifying content or reducing formatting complexity.",
        f"Tectonic process timed out after {LATEX_TIMEOUT}s"
    )
except Exception as e:
    run = None
    break
```

**Change 2: Fallback Notification**
```python
# Lines 274-276 (current)
if not data or len(data) < 100:
    is_fallback = True
    data, pages, previews = _generate_vector_pdf_fallback(clean_tex, req.filename)

# Lines 274-280 (proposed)
fallback_reason = None
if not data or len(data) < 100:
    is_fallback = True
    fallback_reason = "compilation_error" if run and run.returncode != 0 else "compilation_timeout"
    import logging
    logging.warning(f"Falling back to vector PDF generator: {fallback_reason}")
    data, pages, previews = _generate_vector_pdf_fallback(clean_tex, req.filename)

# Lines 283-289 (add fallback_reason to headers)
headers = {
    "Content-Disposition": f'attachment; filename="{safe}.pdf"',
    "X-Page-Count": str(pages),
    "X-Fallback-Compiled": "true" if is_fallback else "false",
    "Access-Control-Expose-Headers": "X-Page-Count, X-Fallback-Compiled, X-Fallback-Reason",
}
if fallback_reason:
    headers["X-Fallback-Reason"] = fallback_reason
```

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bug on unfixed code (resumes timing out at 15 seconds), then verify the fix allows successful compilation within the extended timeout while preserving all existing behavior for fast-compiling resumes.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug BEFORE implementing the fix. Confirm that complex resumes genuinely exceed 15 seconds and trigger `TimeoutExpired`. If no resumes timeout, we will need to re-hypothesize or generate synthetic slow-compiling LaTeX.

**Test Plan**: Create test resumes of varying complexity and measure compilation times on the UNFIXED code. Identify which resumes trigger the timeout exception and observe the error messages and fallback behavior.

**Test Cases**:
1. **Simple Resume (Control)**: 3 sections, 5 bullets, minimal formatting. Measure compilation time on unfixed code (expected: <5 seconds, no timeout)
2. **Medium Resume**: 5 sections, 15 bullets, standard formatting with `\titlespacing`, `\setlist`. Measure compilation time (expected: 8-12 seconds, may timeout under load)
3. **Complex Resume**: 7 sections, 30+ bullets, custom macros, nested itemize, tabular environments, detailed formatting. Measure compilation time (expected: 16-25 seconds, will fail on unfixed code)
4. **Pathological Resume**: Generate a synthetic resume with extremely deep nesting, hundreds of bullets, complex math mode expressions. Measure compilation time (expected: 25-40 seconds, will fail on unfixed code)

**Expected Counterexamples**:
- Complex Resume: `subprocess.TimeoutExpired` raised, `run = None`, loop breaks, `data` is empty, fallback PDF generated with poor quality
- Pathological Resume: Timeout occurs, user sees HTTP 500 error or receives fallback PDF with missing formatting
- Possible causes: hardcoded `timeout=15`, no exception-specific handling, silent fallback invocation

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds (compilation takes 15-45 seconds), the fixed function produces the expected behavior (successful compilation with high-quality PDF).

**Pseudocode:**
```
FOR ALL input WHERE isBugCondition(input) DO
  result := export_pdf_fixed(input)
  ASSERT result.status_code == 200
  ASSERT result.headers["X-Fallback-Compiled"] == "false"
  ASSERT result.content.starts_with(b"%PDF-1.")
  ASSERT pdf_page_count(result.content) >= 1
  ASSERT pdf_quality(result.content) == "high"  # Not vector fallback
END FOR
```

**Testing Approach**: Use property-based testing to generate resumes with varying complexity levels and verify that all resumes compiling between 15-45 seconds now succeed.

**Test Cases**:
1. **Complex Resume Compilation Test**: Submit the Complex Resume (identified in exploratory phase) to fixed endpoint, assert 200 OK, high-quality PDF returned, `X-Fallback-Compiled: false`
2. **Timeout Boundary Test**: Create a resume that compiles in exactly 20 seconds, verify successful compilation
3. **Maximum Timeout Test**: Create a resume that compiles in 34 seconds (just under new timeout), verify successful compilation
4. **Timeout Exceeded Test**: Create a resume that compiles in 50 seconds (exceeds new timeout), verify clear error message with 408 status code and actionable guidance

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold (resumes compiling <15 seconds, invalid LaTeX, blocked commands, missing Tectonic), the fixed function produces the same result as the original function.

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition(input) DO
  ASSERT export_pdf_original(input) = export_pdf_fixed(input)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the input domain (simple resumes, various section counts, bullet counts, formatting styles)
- It catches edge cases that manual unit tests might miss (empty sections, Unicode characters, special LaTeX commands)
- It provides strong guarantees that behavior is unchanged for all non-buggy inputs

**Test Plan**: Observe behavior on UNFIXED code first for fast-compiling resumes, then write property-based tests capturing that exact behavior (compilation time, PDF byte-for-byte equality, header values).

**Test Cases**:
1. **Fast Compilation Preservation**: Generate 100 random simple resumes (1-3 sections, 3-10 bullets), compile on unfixed code, record PDF checksums and compilation times, compile on fixed code, assert identical checksums and times within 1% variance
2. **Trim Loop Preservation**: Create a resume with 50 bullets that overflows to 2 pages, set `fit=True` and `max_pages=1`, verify trim loop executes identically (same bullets trimmed, same spacing compaction applied)
3. **Security Validation Preservation**: Submit LaTeX with `\write18{malicious}`, verify both unfixed and fixed code return 400 with `blocked_command` error
4. **Fallback Trigger Preservation**: Submit LaTeX with syntax errors (`\begin{document` missing `}`), verify both versions invoke `_generate_vector_pdf_fallback()` with identical output
5. **Missing Tectonic Preservation**: Mock `shutil.which()` and `Path.exists()` to return None/False, verify both versions immediately use fallback without attempting compilation
6. **Header Preservation**: For all non-timeout scenarios, verify `X-Page-Count`, `X-Fallback-Compiled`, `Content-Disposition` headers are identical between unfixed and fixed versions

### Unit Tests

- Test timeout configuration: Verify `LATEX_TIMEOUT` environment variable is read correctly, defaults to 35 if not set
- Test exception handling: Mock `subprocess.run` to raise `TimeoutExpired`, verify 408 response with correct error message
- Test fallback reason tracking: Mock compilation failure scenarios, verify `X-Fallback-Reason` header is set correctly
- Test compilation timing: Verify `X-Compilation-Time` header is present and accurate (within 1 second of actual duration)
- Test edge cases: Empty LaTeX, LaTeX without `\begin{document}`, extremely short timeout (1 second), extremely long timeout (1000 seconds)

### Property-Based Tests

- Generate random resume structures (varying section counts, bullet counts, formatting complexity) and verify all compile successfully within timeout
- Generate random valid LaTeX snippets and verify preservation of existing behavior (same PDF output for fast compilations)
- Test boundary conditions: Generate resumes that compile in 14.9s, 15.1s, 34.9s, 35.1s and verify correct handling at timeout boundaries
- Test concurrent requests: Submit multiple compilation requests simultaneously, verify all timeout correctly without interference

### Integration Tests

- Test full end-to-end flow: POST to `/exports/pdf` with complex resume JSON, verify 200 OK and high-quality PDF within 35 seconds
- Test frontend integration: Verify frontend displays clear error messages when timeout occurs (if 408 returned) or when fallback PDF is generated (`X-Fallback-Reason` detection)
- Test performance monitoring: Submit 10 resumes of varying complexity, collect `X-Compilation-Time` headers, verify distribution matches expected (simple: 2-5s, medium: 8-15s, complex: 18-30s)
- Test Docker environment: Run compilation in Docker container with resource limits, verify timeout still works correctly under constrained resources
