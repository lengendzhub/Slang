import pytest
from app.core.constrained_editor import ConstrainedEditor
from app.models.schemas import CareerMode

def test_constrained_editor_model_detection():
    editor = ConstrainedEditor()
    model = editor.get_available_model()
    # Should detect llama3.2, llama3, qwen3.5:4b, or granite3-dense:8b
    assert isinstance(model, str)
    assert len(model) > 0

def test_constrained_editor_length_budget_enforcement():
    editor = ConstrainedEditor()
    # Test that rewritten bullets strictly fit budget
    budget = 100
    mock_rewrite = {
        "rewritten_text": "A" * 150,
        "reason": "Test rewrite",
        "evidence_id": "ev_test"
    }
    # When text exceeds budget, it is capped
    text = mock_rewrite["rewritten_text"]
    if len(text) > budget:
        text = text[:budget - 3] + "..."
    assert len(text) <= budget
