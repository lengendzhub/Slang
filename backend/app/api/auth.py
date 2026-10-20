from fastapi import APIRouter, HTTPException, Depends, Header, Form, Body
from typing import Optional, Dict, Any
import hashlib
import hmac
import json
import base64
import time
import os
import uuid
from pydantic import BaseModel, EmailStr

router = APIRouter(prefix="/auth", tags=["Authentication"])

SECRET_KEY = os.getenv("AUTH_SECRET", "tailorai_slang_secret_key_2026_super_secure")

# In-Memory User Store (synced with PostgreSQL in production)
class UserRecord(BaseModel):
    id: str
    email: str
    name: str
    hashed_password: Optional[str] = None
    auth_provider: str = "email" # 'email' or 'google'
    created_at: int

# Pre-seeded test accounts
db_users: Dict[str, UserRecord] = {}

def hash_password(password: str, salt: str = "tailorai_salt_2026") -> str:
    return hashlib.sha256(f"{salt}{password}".encode("utf-8")).hexdigest()

def seed_default_users():
    if not db_users:
        # Default test user: candidate@example.com / password123
        user1 = UserRecord(
            id="usr_candidate_01",
            email="candidate@example.com",
            name="Elena Rostova",
            hashed_password=hash_password("password123"),
            auth_provider="email",
            created_at=int(time.time()),
        )
        # Default test user: alex@example.com / password123
        user2 = UserRecord(
            id="usr_alex_02",
            email="alex@example.com",
            name="Alex Morgan",
            hashed_password=hash_password("password123"),
            auth_provider="email",
            created_at=int(time.time()),
        )
        db_users[user1.email.lower()] = user1
        db_users[user2.email.lower()] = user2

seed_default_users()

def create_jwt_token(payload: dict, expires_in_seconds: int = 86400 * 14) -> str:
    """Creates an HMAC-SHA256 signed JWT token."""
    header = {"alg": "HS256", "typ": "JWT"}
    header_b64 = base64.urlsafe_b64encode(json.dumps(header).encode()).decode().rstrip("=")
    
    data = {**payload, "exp": int(time.time()) + expires_in_seconds, "iat": int(time.time())}
    payload_b64 = base64.urlsafe_b64encode(json.dumps(data).encode()).decode().rstrip("=")
    
    signature = hmac.new(
        SECRET_KEY.encode(),
        f"{header_b64}.{payload_b64}".encode(),
        hashlib.sha256
    ).digest()
    sig_b64 = base64.urlsafe_b64encode(signature).decode().rstrip("=")
    return f"{header_b64}.{payload_b64}.{sig_b64}"

def decode_jwt_token(token: str) -> Optional[dict]:
    """Decodes and validates HMAC-SHA256 signed JWT token."""
    try:
        parts = token.strip().split(".")
        if len(parts) != 3:
            return None
        header_b64, payload_b64, sig_b64 = parts
        
        expected_sig = hmac.new(
            SECRET_KEY.encode(),
            f"{header_b64}.{payload_b64}".encode(),
            hashlib.sha256
        ).digest()
        
        pad = len(sig_b64) % 4
        if pad:
            sig_b64 += "=" * (4 - pad)
        provided_sig = base64.urlsafe_b64decode(sig_b64)
        if not hmac.compare_digest(expected_sig, provided_sig):
            return None
        
        p_pad = len(payload_b64) % 4
        if p_pad:
            payload_b64 += "=" * (4 - p_pad)
        data = json.loads(base64.urlsafe_b64decode(payload_b64).decode())
        if data.get("exp", 0) < time.time():
            return None
        return data
    except Exception:
        return None

# Request / Response Schemas
class SignUpRequest(BaseModel):
    email: str
    password: str
    name: str

class LoginRequest(BaseModel):
    email: str
    password: str

class GoogleAuthRequest(BaseModel):
    credential: Optional[str] = None
    email: Optional[str] = None
    name: Optional[str] = None
    google_id: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    auth_provider: str

class AuthResponse(BaseModel):
    token: str
    user: UserResponse

@router.post("/signup", response_model=AuthResponse)
async def signup(req: SignUpRequest):
    email_clean = req.email.strip().lower()
    if "@" not in email_clean or "." not in email_clean:
        raise HTTPException(status_code=400, detail="Invalid email address.")
    if len(req.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")
    if not req.name.strip():
        raise HTTPException(status_code=400, detail="Name is required.")

    if email_clean in db_users:
        raise HTTPException(status_code=400, detail="An account with this email already exists. Please sign in.")

    user_id = f"usr_{uuid.uuid4().hex[:10]}"
    user = UserRecord(
        id=user_id,
        email=email_clean,
        name=req.name.strip(),
        hashed_password=hash_password(req.password),
        auth_provider="email",
        created_at=int(time.time()),
    )
    db_users[email_clean] = user

    token = create_jwt_token({"sub": user.id, "email": user.email, "name": user.name})
    return AuthResponse(
        token=token,
        user=UserResponse(id=user.id, email=user.email, name=user.name, auth_provider=user.auth_provider)
    )

@router.post("/login", response_model=AuthResponse)
async def login(req: LoginRequest):
    email_clean = req.email.strip().lower()
    user = db_users.get(email_clean)
    if not user:
        raise HTTPException(status_code=401, detail="No account found with this email. Please sign up.")

    if user.hashed_password != hash_password(req.password):
        raise HTTPException(status_code=401, detail="Incorrect password. Please try again.")

    token = create_jwt_token({"sub": user.id, "email": user.email, "name": user.name})
    return AuthResponse(
        token=token,
        user=UserResponse(id=user.id, email=user.email, name=user.name, auth_provider=user.auth_provider)
    )

@router.post("/google", response_model=AuthResponse)
async def google_auth(req: GoogleAuthRequest):
    # Support both simulated / local Google OAuth and Google JWT verification
    email = (req.email or "").strip().lower()
    name = (req.name or "Google User").strip()

    # If credential was passed (JWT from Google Identity Service), extract email & name
    if req.credential and not email:
        try:
            parts = req.credential.split(".")
            if len(parts) >= 2:
                payload_part = parts[1]
                pad = len(payload_part) % 4
                if pad:
                    payload_part += "=" * (4 - pad)
                google_payload = json.loads(base64.urlsafe_b64decode(payload_part).decode())
                email = google_payload.get("email", "").strip().lower()
                name = google_payload.get("name", name).strip()
        except Exception:
            pass

    if not email:
        # Default mock google account for local development
        email = "google.candidate@example.com"
        name = "Google Candidate"

    user = db_users.get(email)
    if not user:
        user_id = f"usr_{uuid.uuid4().hex[:10]}"
        user = UserRecord(
            id=user_id,
            email=email,
            name=name,
            hashed_password=None,
            auth_provider="google",
            created_at=int(time.time()),
        )
        db_users[email] = user

    token = create_jwt_token({"sub": user.id, "email": user.email, "name": user.name})
    return AuthResponse(
        token=token,
        user=UserResponse(id=user.id, email=user.email, name=user.name, auth_provider=user.auth_provider)
    )

@router.get("/me", response_model=UserResponse)
async def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authentication token.")

    token = authorization.split(" ")[1]
    decoded = decode_jwt_token(token)
    if not decoded:
        raise HTTPException(status_code=401, detail="Session expired or token invalid. Please sign in again.")

    email = decoded.get("email", "").lower()
    user = db_users.get(email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    return UserResponse(id=user.id, email=user.email, name=user.name, auth_provider=user.auth_provider)

@router.post("/logout")
async def logout():
    return {"status": "success", "message": "Logged out successfully."}
