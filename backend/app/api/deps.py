from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import InvalidTokenError, decode_access_token
from app.db.session import get_db
from app.models.user import User

# HTTPBearer (rather than OAuth2PasswordBearer) matches our JSON login body:
# in Swagger UI, call POST /auth/login via "Try it out", copy the access_token
# from the response, then click the top-right "Authorize" button and paste it
# in (no "Bearer " prefix needed) to unlock protected endpoints like /auth/me.
bearer_scheme = HTTPBearer(auto_error=False, description="Paste the access_token from /auth/login")

CREDENTIALS_ERROR = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Resolve the current user from a Bearer JWT, raising 401 if invalid/missing."""
    if credentials is None:
        raise CREDENTIALS_ERROR
    token = credentials.credentials

    try:
        payload = decode_access_token(token)
    except InvalidTokenError as exc:
        raise CREDENTIALS_ERROR from exc

    subject = payload.get("sub")
    if subject is None:
        raise CREDENTIALS_ERROR

    result = await db.execute(select(User).where(User.email == subject))
    user = result.scalar_one_or_none()
    if user is None or not user.is_active:
        raise CREDENTIALS_ERROR

    return user
