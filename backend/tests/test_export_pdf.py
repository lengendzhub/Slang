from app.api.export_pdf import sanitize_latex_characters


def test_sanitize_latex_percent_and_underscore():
    raw = (
        r"\begin{document}" "\n"
        r"\resumeItem{Architected Redis caching layer, cutting p99 latency 42% through connection pooling across 10M daily requests for google_pay_service saving $500K annually.}" "\n"
        r"\end{document}"
    )
    clean = sanitize_latex_characters(raw)
    assert r"42\%" in clean
    assert r"google\_pay\_service" in clean
    assert r"\$500K" in clean

    raw_dollar = r"\begin{document}" "\n" r"\resumeItem{Managed budget ($ USD) scaling revenue $10M+}" "\n" r"\end{document}"
    clean_dollar = sanitize_latex_characters(raw_dollar)
    assert r"(\$ USD)" in clean_dollar
    assert r"\$10M+" in clean_dollar


def test_sanitize_preserves_preamble_and_already_escaped():
    raw = (
        r"\documentclass{article}" "\n"
        r"\newcommand{\resumeItem}[1]{#1}" "\n"
        r"\begin{document}" "\n"
        r"% Full line comment with 100% untouched" "\n"
        r"\resumeItem{Already escaped 50\% and \#1 should remain verbatim.}" "\n"
        r"\end{document}"
    )
    clean = sanitize_latex_characters(raw)
    assert r"#1" in clean
    assert r"50\%" in clean
    assert r"% Full line comment with 100% untouched" in clean
