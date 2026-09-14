from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.config import settings
from app.core.security import create_access_token, verify_password
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import LoginRequest, TokenResponse, UserOut

router = APIRouter(prefix="/auth", tags=["auth"])

# Generic message so we never reveal whether the email or the password was wrong
# (WMI-37 AC2 / WMI-42 AC1: reject invalid credentials with an error, without
# leaking which field was incorrect).
INVALID_CREDENTIALS_DETAIL = "Invalid email or password"


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Log in with email + password",
    responses={
        401: {
            "description": "Invalid email or password",
            "content": {
                "application/json": {"example": {"detail": INVALID_CREDENTIALS_DETAIL}}
            },
        }
    },
)
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_db)) -> TokenResponse:
    """Validate email/password credentials and issue a JWT session token on success."""
    result = await db.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()

    if user is None or not user.is_active or not verify_password(
        payload.password, user.hashed_password
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=INVALID_CREDENTIALS_DETAIL,
        )

    access_token = create_access_token(subject=user.email)

    return TokenResponse(
        access_token=access_token,
        expires_in=settings.access_token_expire_minutes * 60,
        user=UserOut.model_validate(user),
    )


@router.get(
    "/me",
    response_model=UserOut,
    summary="Get the current authenticated user",
    responses={401: {"description": "Missing, invalid, or expired token"}},
)
async def read_current_user(current_user: User = Depends(get_current_user)) -> UserOut:
    """Return the authenticated user, proving the issued token is valid and usable."""
    return UserOut.model_validate(current_user)
