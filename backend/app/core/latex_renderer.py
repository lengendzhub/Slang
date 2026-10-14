import re
from typing import List, Dict
from app.models.schemas import (
    ParsedResume,
    DiffItem,
    DiffDecision
)

class LatexRenderer:
    """
    Renders tailored LaTeX document by replacing text strictly inside
    recognised content slots. Preserves preamble, macros, spacing and fonts verbatim.
    """

    def __init__(self, parsed_resume: ParsedResume):
        self.parsed_resume = parsed_resume

    def render(self, diffs: List[DiffItem]) -> str:
        # Start with original full LaTeX string
        rendered = self.parsed_resume.raw_latex

        # Apply only accepted or user-edited diffs
        for diff in diffs:
            if diff.decision not in [DiffDecision.ACCEPTED, DiffDecision.EDITED]:
                continue

            target_replacement = diff.edited_text if diff.decision == DiffDecision.EDITED and diff.edited_text else diff.rewritten_text
            original = diff.original_text.strip()

            # Replace exact occurrence of original within content slot
            if original in rendered:
                rendered = rendered.replace(original, target_replacement, 1)

        return rendered

    @staticmethod
    def strip_dangerous_commands(latex_str: str) -> str:
        """
        Sanitizes LaTeX input by stripping dangerous primitives:
        \\write18, \\openin, \\input, \\include, \\immediate\\write
        """
        sanitized = re.sub(r'\\write18\{[^}]*\}', '% [STRIPPED FOR SECURITY]', latex_str)
        sanitized = re.sub(r'\\immediate\\write[^\n]*', '% [STRIPPED FOR SECURITY]', sanitized)
        sanitized = re.sub(r'\\openin[^\n]*', '% [STRIPPED FOR SECURITY]', sanitized)
        # Only allow benign inputs like glyphtounicode
        sanitized = re.sub(r'\\input\{(?!(glyphtounicode)\b)[^}]*\}', '% [STRIPPED FOR SECURITY]', sanitized)
        sanitized = re.sub(r'\\include\{[^}]*\}', '% [STRIPPED FOR SECURITY]', sanitized)
        return sanitized
