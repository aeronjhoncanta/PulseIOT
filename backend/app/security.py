import hashlib
import hmac
import secrets
from datetime import datetime, timedelta, timezone
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.orm import Session
from .config import settings
from .models import UserModel
from .schemas import LoginRequest, TokenResponse


def _hash_password(password: str, salt: bytes) -> bytes:
    return hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 120_000)


_tokens: dict[str, datetime] = {}
_bearer = HTTPBearer(auto_error=False)


def create_password_hash(password: str) -> tuple[str, str]:
    salt = secrets.token_bytes(16)
    return _hash_password(password, salt).hex(), salt.hex()


def authenticate(db: Session, payload: LoginRequest) -> TokenResponse:
    user = db.scalar(select(UserModel).where(UserModel.username == payload.username))
    if user is None or not hmac.compare_digest(_hash_password(payload.password, bytes.fromhex(user.password_salt)).hex(), user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password")
    token = secrets.token_urlsafe(32)
    _tokens[token] = datetime.now(timezone.utc) + timedelta(hours=8)
    return TokenResponse(access_token=token)


def require_auth(credentials: HTTPAuthorizationCredentials | None = Depends(_bearer)) -> str:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
    expiry = _tokens.get(credentials.credentials)
    if expiry is None or expiry <= datetime.now(timezone.utc):
        _tokens.pop(credentials.credentials, None)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired or invalid")
    return credentials.credentials


def logout(token: str) -> None:
    _tokens.pop(token, None)
