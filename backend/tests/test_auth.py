import pytest

from tests.conftest import TEST_USER_EMAIL, TEST_USER_PASSWORD

pytestmark = pytest.mark.asyncio


async def test_login_with_valid_credentials_returns_token(client):
    """WMI-37 AC1 / WMI-42 AC1: valid credentials grant access."""
    response = await client.post(
        "/auth/login", json={"email": TEST_USER_EMAIL, "password": TEST_USER_PASSWORD}
    )
    assert response.status_code == 200
    body = response.json()
    assert body["token_type"] == "bearer"
    assert body["access_token"]
    assert body["user"]["email"] == TEST_USER_EMAIL


async def test_login_with_wrong_password_is_rejected(client):
    """WMI-37 AC2: invalid credentials are rejected with an error."""
    response = await client.post(
        "/auth/login", json={"email": TEST_USER_EMAIL, "password": "wrong-password"}
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid email or password"


async def test_login_with_unknown_email_is_rejected(client):
    response = await client.post(
        "/auth/login", json={"email": "nobody@example.com", "password": "whatever123"}
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid email or password"


async def test_login_missing_fields_returns_422(client):
    """WMI-42 AC2: both email and password are required."""
    response = await client.post("/auth/login", json={"email": TEST_USER_EMAIL})
    assert response.status_code == 422


async def test_me_requires_bearer_token(client):
    response = await client.get("/auth/me")
    assert response.status_code == 401


async def test_me_returns_user_with_valid_token(client):
    login_response = await client.post(
        "/auth/login", json={"email": TEST_USER_EMAIL, "password": TEST_USER_PASSWORD}
    )
    token = login_response.json()["access_token"]

    me_response = await client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_response.status_code == 200
    assert me_response.json()["email"] == TEST_USER_EMAIL


async def test_me_rejects_invalid_token(client):
    response = await client.get("/auth/me", headers={"Authorization": "Bearer garbage-token"})
    assert response.status_code == 401
