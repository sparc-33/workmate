// Thin client for the WorkMate AI auth API (WMI-53: backend credential
// validation / session API). Base URL is configurable via VITE_API_BASE_URL
// so the same build can point at a local backend, staging, etc.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const ACCESS_TOKEN_KEY = 'workmate.access_token';

const GENERIC_ERROR_MESSAGE = 'Invalid email or password. Please try again.';

/**
 * POST /auth/login — exchange email/password for a JWT access token.
 * Throws an Error with a user-facing message on any failure (invalid
 * credentials, validation error, or network/server error), matching the
 * generic message the backend uses so we never leak which field was wrong.
 */
export async function login({ email, password }) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
  } catch {
    throw new Error('Could not reach the server. Please try again.');
  }

  if (!response.ok) {
    let detail;
    try {
      detail = (await response.json())?.detail;
    } catch {
      // Non-JSON error body; fall back to the generic message below.
    }
    throw new Error(typeof detail === 'string' ? detail : GENERIC_ERROR_MESSAGE);
  }

  const data = await response.json();
  setAccessToken(data.access_token);
  return data;
}

/** GET /auth/me — resolve the current user from the stored token, if any. */
export async function fetchCurrentUser() {
  const token = getAccessToken();
  if (!token) return null;

  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    clearAccessToken();
    return null;
  }

  return response.json();
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token) {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function clearAccessToken() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

export function logout() {
  clearAccessToken();
}
