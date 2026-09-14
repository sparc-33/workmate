# WorkMate AI - Auth API (WMI-53)

Backend implementation of **WMI-53: Backend: Implement credential validation and session/auth API**,
part of the **WMI-42** user story ("Secure login with valid email and password") under the
**WMI-37: User Authentication** epic.

Validates a user's email/password against a dedicated `auth_users` table and issues a JWT access
token on success. Rejects invalid credentials with a generic 401 error (never reveals whether the
email or the password was the problem).

**Schema note:** the WorkMate AI database already has a `users` table built for SSO login
(`id`, `sso_id`, `role`), with no email/password columns. Rather than altering that shared table,
this task uses its own table, `auth_users` (`id`, `email`, `hashed_password`, `is_active`,
`created_at`), so it doesn't touch or depend on the SSO schema at all.

## Stack

- FastAPI
- SQLAlchemy 2.0 (async) + `asyncmy` driver for MySQL
- Passlib/bcrypt for password hashing
- python-jose for JWT tokens
- pytest + httpx for tests (run against in-memory SQLite, no live DB needed)

## Project layout

```
app/
  core/
    config.py     # settings loaded from .env
    security.py    # password hashing + JWT create/decode
  db/
    session.py     # async engine/session, Base, init_models()
    seed.py         # one-off script to create the auth_users table + a seed user
  models/
    user.py         # auth_users table (separate from the existing SSO users table)
  schemas/
    auth.py         # request/response models
  api/
    deps.py         # get_current_user() JWT dependency
    routes_auth.py  # POST /auth/login, GET /auth/me
  main.py           # FastAPI app
tests/
  conftest.py       # SQLite-backed test fixtures
  test_auth.py       # login + protected-route tests
```

## Setup

1. Create a virtualenv and install dependencies:

   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```

2. Copy `.env.example` to `.env` and point `DATABASE_URL` at your MySQL instance:

   ```bash
   cp .env.example .env
   # edit .env: DATABASE_URL=mysql+asyncmy://<user>:<password>@<host>:3306/<db>
   # and set a real JWT_SECRET_KEY
   ```

3. Create the `auth_users` table and a seed test user:

   ```bash
   python -m app.db.seed
   ```

   This prints the seeded email/password (`test.user@workmate.ai` / `ChangeMe123!`) you can use
   to try the endpoint. In a real rollout, replace this with your actual user-provisioning flow
   (e.g. a signup endpoint) rather than relying on the seed script.

4. Run the API:

   ```bash
   uvicorn app.main:app --reload
   ```

   Docs are then available at `http://localhost:8000/docs`.

## Endpoints

### `POST /auth/login`

Request:

```json
{ "email": "test.user@workmate.ai", "password": "ChangeMe123!" }
```

Success (200):

```json
{
  "access_token": "eyJ...",
  "token_type": "bearer",
  "expires_in": 3600,
  "user": { "id": 1, "email": "test.user@workmate.ai", "is_active": true }
}
```

Failure (401) — wrong password, unknown email, or inactive user all return the same generic error:

```json
{ "detail": "Invalid email or password" }
```

Missing email or password returns `422` (FastAPI request validation).

### `GET /auth/me`

Requires `Authorization: Bearer <access_token>`. Returns the authenticated user, or `401` if the
token is missing/invalid/expired. Useful for verifying the issued token actually works, and as a
template for protecting future endpoints with the same `get_current_user` dependency.

### Try it with curl

```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test.user@workmate.ai", "password": "ChangeMe123!"}'

curl http://localhost:8000/auth/me -H "Authorization: Bearer <token from above>"
```

## Tests

```bash
source .venv/bin/activate
python -m pytest -q
```

Tests use an in-memory SQLite database via a FastAPI dependency override, so they run without a
MySQL server. They cover: valid login issuing a token, wrong password rejected, unknown email
rejected, missing fields returning 422, `/auth/me` requiring a token, and `/auth/me` succeeding
with a valid token / failing with a garbage token.

## Mapping to acceptance criteria

- **WMI-37 AC1** ("valid email/password grants access"): covered by
  `test_login_with_valid_credentials_returns_token`.
- **WMI-37 AC2** ("invalid credentials rejected with an error"): covered by
  `test_login_with_wrong_password_is_rejected` and `test_login_with_unknown_email_is_rejected`.
- **WMI-42 AC2** ("login requires both an email and a password field"): covered by
  `test_login_missing_fields_returns_422` (Pydantic model requires both fields).

## Notes / follow-ups for other WMI-42 subtasks

- **WMI-52** (frontend login screen) should call `POST /auth/login`, store the returned
  `access_token`, and send it as `Authorization: Bearer <token>` on subsequent requests; on 401 it
  should show the generic "Invalid email or password" message in the error placeholder.
- **WMI-54** (QA) can use the seed user (or the seed script's pattern) to test valid/invalid
  login manually, and hit `/docs` for interactive testing.
- The WorkMate AI database already has a `users` table for SSO login (`sso_id`/`role`). This task
  deliberately does not touch it — email/password accounts live in their own `auth_users` table
  instead. If product/eng later want SSO and email/password accounts unified into one table, that
  merge is a separate decision for the team, not something baked in here.
