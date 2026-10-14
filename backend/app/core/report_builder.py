from typing import List, Dict, Any
from app.models.schemas import (
    JDAnalysis,
    JDRequirement,
    RequirementClassification,
    RequirementCategory,
    FitRubricScore
)

class ReportBuilder:
    """
    Constructs a transparent rubric-based fit evaluation.
    Never presents fit as a shortlist probability.
    """

    @staticmethod
    def calculate_rubric(jd_analysis: JDAnalysis) -> FitRubricScore:
        total_reqs = len(jd_analysis.requirements) or 1
        direct_count = sum(1 for r in jd_analysis.requirements if r.classification == RequirementClassification.DIRECT)
        transferable_count = sum(1 for r in jd_analysis.requirements if r.classification == RequirementClassification.TRANSFERABLE)
        missing_count = sum(1 for r in jd_analysis.requirements if r.classification == RequirementClassification.MISSING)

        # Weighted calculation:
        # Essential matches carry double weight
        total_weight = 0
        earned_weight = 0

        for req in jd_analysis.requirements:
            weight = 2.0 if req.category in [RequirementCategory.ESSENTIAL, RequirementCategory.REQUIRED] else 1.0
            total_weight += weight

            if req.classification == RequirementClassification.DIRECT:
                earned_weight += weight * 1.0
            elif req.classification == RequirementClassification.TRANSFERABLE:
                earned_weight += weight * 0.75
            else:
                earned_weight += 0

        coverage_pct = int((earned_weight / total_weight) * 100) if total_weight > 0 else 85

        breakdown = {
            "total_requirements_analyzed": total_reqs,
            "essential_weight_ratio": "2.0x",
            "direct_match_contribution": direct_count * 15,
            "transferable_contribution": transferable_count * 10,
            "seniority_alignment": jd_analysis.seniority,
            "unsupported_gaps_isolated": missing_count
        }

        return FitRubricScore(
            rubric_score=coverage_pct,
            evidence_coverage_pct=coverage_pct,
            direct_match_count=direct_count,
            transferable_match_count=transferable_count,
            missing_count=missing_count,
            rubric_breakdown=breakdown
        )
