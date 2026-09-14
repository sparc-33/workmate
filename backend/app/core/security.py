"""Password hashing and JWT token utilities for the auth API (WMI-53)."""

from datetime import datetime, timedelta, timezone
from typing import Any

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain_password: str) -> str:
    """Hash a plaintext password for storage."""
    return pwd_context.hash(plain_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Check a plaintext password against a stored bcrypt hash."""
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(subject: str, expires_minutes: int | None = None) -> str:
    """Create a signed JWT access token for the given subject (typically user id or email)."""
    expire_delta = timedelta(
        minutes=expires_minutes
        if expires_minutes is not None
        else settings.access_token_expire_minutes
    )
    expire = datetime.now(timezone.utc) + expire_delta
    to_encode: dict[str, Any] = {"sub": subject, "exp": expire}
    return jwt.encode(to_encode, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


class InvalidTokenError(Exception):
    """Raised when a JWT is missing, malformed, expired, or otherwise invalid."""


def decode_access_token(token: str) -> dict[str, Any]:
    """Decode and validate a JWT access token, raising InvalidTokenError on failure."""
    try:
        payload = jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
        return payload
    except JWTError as exc:
        raise InvalidTokenError(str(exc)) from exc
