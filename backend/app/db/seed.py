"""One-off helper to create the auth_users table and seed a test user.

Usage:
    python -m app.db.seed
"""

import asyncio

from sqlalchemy import select

from app.core.security import hash_password
from app.db.session import AsyncSessionLocal, init_models
from app.models.user import User

SEED_EMAIL = "test.user@workmate.ai"
SEED_PASSWORD = "ChangeMe123!"


async def main() -> None:
    await init_models()
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(User).where(User.email == SEED_EMAIL))
        if result.scalar_one_or_none() is not None:
            print(f"Seed user {SEED_EMAIL} already exists.")
            return

        user = User(email=SEED_EMAIL, hashed_password=hash_password(SEED_PASSWORD))
        db.add(user)
        await db.commit()
        print(f"Created seed user: {SEED_EMAIL} / {SEED_PASSWORD}")


if __name__ == "__main__":
    asyncio.run(main())
