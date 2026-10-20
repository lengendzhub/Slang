import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.api.auth import db_users

@pytest.mark.asyncio
async def test_auth_full_lifecycle():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Test Login with pre-seeded test account
        login_res = await client.post(
            "/auth/login",
            json={"email": "candidate@example.com", "password": "password123"}
        )
        assert login_res.status_code == 200
        data = login_res.json()
        assert "token" in data
        assert data["user"]["email"] == "candidate@example.com"
        assert data["user"]["name"] == "Elena Rostova"
        token = data["token"]

        # 2. Test /auth/me with Bearer token
        me_res = await client.get(
            "/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert me_res.status_code == 200
        me_data = me_res.json()
        assert me_data["email"] == "candidate@example.com"

        # 3. Test Login with wrong password (401)
        bad_pass_res = await client.post(
            "/auth/login",
            json={"email": "candidate@example.com", "password": "wrongpassword"}
        )
        assert bad_pass_res.status_code == 401

        # 4. Test Login with non-existent user (401)
        unknown_res = await client.post(
            "/auth/login",
            json={"email": "nonexistent@example.com", "password": "password123"}
        )
        assert unknown_res.status_code == 401

        # 5. Test Signup with new user
        new_email = "newuser@example.com"
        if new_email in db_users:
            del db_users[new_email]

        signup_res = await client.post(
            "/auth/signup",
            json={"email": new_email, "password": "securepassword", "name": "New Candidate"}
        )
        assert signup_res.status_code == 200
        signup_data = signup_res.json()
        assert signup_data["user"]["email"] == new_email
        assert signup_data["user"]["name"] == "New Candidate"
        assert "token" in signup_data

        # 6. Test duplicate signup rejection (400)
        dup_res = await client.post(
            "/auth/signup",
            json={"email": new_email, "password": "securepassword", "name": "New Candidate"}
        )
        assert dup_res.status_code == 400

        # 7. Test Google Auth
        google_res = await client.post(
            "/auth/google",
            json={"email": "googleuser@gmail.com", "name": "Google User"}
        )
        assert google_res.status_code == 200
        google_data = google_res.json()
        assert google_data["user"]["email"] == "googleuser@gmail.com"
        assert google_data["user"]["auth_provider"] == "google"

        # 8. Test /auth/me with invalid token (401)
        invalid_res = await client.get(
            "/auth/me",
            headers={"Authorization": "Bearer invalid.fake.token"}
        )
        assert invalid_res.status_code == 401
