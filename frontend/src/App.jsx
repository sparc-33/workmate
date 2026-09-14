import React, { useEffect, useState } from 'react';
import LoginScreen from './components/LoginScreen/LoginScreen.jsx';
import { fetchCurrentUser, login, logout } from './api/auth.js';

// Wires LoginScreen (WMI-52) up to the real backend auth API (WMI-53):
// POST /auth/login on submit, GET /auth/me to restore a session on reload.
export default function App() {
  const [user, setUser] = useState(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    fetchCurrentUser()
      .then(setUser)
      .finally(() => setIsCheckingSession(false));
  }, []);

  async function handleLogin({ email, password }) {
    const { user: loggedInUser } = await login({ email, password });
    setUser(loggedInUser);
  }

  function handleLogout() {
    logout();
    setUser(null);
  }

  if (isCheckingSession) {
    return null;
  }

  if (user) {
    return (
      <div className="login-screen">
        <div className="login-card">
          <h1 className="login-title">Signed in as {user.email}</h1>
          <button type="button" className="login-button" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </div>
    );
  }

  return <LoginScreen onLogin={handleLogin} />;
}
