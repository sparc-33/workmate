import React from 'react';
import LoginScreen from './components/LoginScreen/LoginScreen.jsx';

// Temporary demo entry point for previewing LoginScreen in isolation.
// Simulates the WMI-53 backend: accepts only password "password123".
export default function App() {
  async function handleLogin({ email, password }) {
    await new Promise((resolve) => setTimeout(resolve, 400));
    if (password !== 'password123') {
      throw new Error('Invalid email or password. Please try again.');
    }
    // eslint-disable-next-line no-alert
    alert(`Logged in as ${email}`);
  }

  return <LoginScreen onLogin={handleLogin} />;
}
