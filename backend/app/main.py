from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes_auth import router as auth_router
from app.core.config import settings

tags_metadata = [
    {
        "name": "auth",
        "description": (
            "Login and session verification (WMI-53). Call **POST /auth/login** with "
            "`email`/`password`, then use the `access_token` from the response: click "
            "**Authorize** (top right) and paste it in to try the protected **GET /auth/me**."
        ),
    },
    {"name": "health", "description": "Liveness check."},
]

app = FastAPI(
    title="WorkMate AI - Auth API",
    description=(
        "Credential validation and session/auth API for WMI-53 "
        "(epic WMI-37, story WMI-42: secure login with email/password)."
    ),
    version="1.0.0",
    openapi_tags=tags_metadata,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_allow_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)


@app.get("/health", tags=["health"], summary="Health check")
async def health() -> dict[str, str]:
    return {"status": "ok"}
