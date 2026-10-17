import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app, db_resumes
from app.core.resume_parser import ResumeParser

SAMPLE_LATEX = r"""
\documentclass[letterpaper,11pt]{article}
\usepackage{titlesec}
\begin{document}
\section{Experience}
\resumeItem{Architected distributed caching layer with Redis, reducing p99 API query latency by 42% across 10M daily requests.}
\section{Education}
\resumeItem{Bachelor of Science in Computer Science, UC Berkeley, 2019.}
\end{document}
"""

@pytest.mark.asyncio
async def test_evidence_bank_crud_and_section_locking():
    # 1. Parse and register resume
    parser = ResumeParser(SAMPLE_LATEX)
    parsed = parser.parse()
    db_resumes[parsed.id] = parsed

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 2. Get evidence list
        res = await client.get(f"/resumes/{parsed.id}/evidence")
        assert res.status_code == 200
        items = res.json()
        assert len(items) == 2
        assert items[0]["status"] == "extracted"

        # 3. Add custom evidence fact
        add_res = await client.post(
            f"/resumes/{parsed.id}/evidence",
            data={
                "text": "Authored internal architecture decision record (ADR) on Redis eviction policies.",
                "category": "Experience",
                "source": "user_qa",
                "source_name": "What did you actually do? Q&A",
                "context": "Nexus Cloud Systems",
                "skills": "Redis, Architecture, Technical Writing"
            }
        )
        assert add_res.status_code == 200
        new_fact = add_res.json()
        assert new_fact["status"] == "confirmed"
        assert new_fact["source"] == "user_qa"
        assert "Redis" in new_fact["skills"]

        # 4. Confirm an existing extracted fact
        item_id = items[0]["id"]
        update_res = await client.put(
            f"/resumes/{parsed.id}/evidence/{item_id}",
            data={"status": "confirmed"}
        )
        assert update_res.status_code == 200
        updated = update_res.json()
        assert updated["status"] == "confirmed"

        # 5. Lock a section
        sec_id = parsed.sections[0].id
        lock_res = await client.patch(
            f"/resumes/{parsed.id}/sections/{sec_id}/lock",
            data={"is_locked": True}
        )
        assert lock_res.status_code == 200
        assert lock_res.json()["is_locked"] is True
        assert parsed.sections[0].is_locked is True

        # 6. Delete added fact
        del_res = await client.delete(f"/resumes/{parsed.id}/evidence/{new_fact['id']}")
        assert del_res.status_code == 200
        assert del_res.json()["deleted_id"] == new_fact["id"]
