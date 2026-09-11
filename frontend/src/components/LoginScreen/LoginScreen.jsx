import React, { useState } from 'react';
import './LoginScreen.css';
import logo from './logo.svg';

/**
 * LoginScreen
 *
 * Implements the WorkMate AI login screen per the wireframe (WMI-52):
 * - Company logo
 * - Email address field
 * - Password field
 * - Login button
 * - Error message placeholder, hidden by default
 *
 * This component only handles the UI/markup and client-side field
 * validation. Actual credential validation happens server-side
 * (see WMI-53: Backend credential validation and session/auth API).
 * Pass an `onLogin` handler that returns a Promise resolving on
 * success or rejecting with an Error whose message is shown in the
 * error placeholder.
 */
export default function LoginScreen({ onLogin, logoSrc = logo, logoAlt = 'Company logo' }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasError = errorMessage.length > 0;

  function validate() {
    if (!email.trim()) {
      return 'Email address is required.';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return 'Please enter a valid email address.';
    }
    if (!password) {
      return 'Password is required.';
    }
    return '';
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const validationError = validate();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);

    try {
      if (typeof onLogin === 'function') {
        await onLogin({ email: email.trim(), password });
      }
    } catch (err) {
      setErrorMessage(err?.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="login-screen">
      <form className="login-card" onSubmit={handleSubmit} noValidate>
        <div className="login-logo">
          <img src={logoSrc} alt={logoAlt} />
        </div>

        <h1 className="login-title">Sign in to WorkMate AI</h1>

        <label className="login-field">
          <span className="login-field-label">Email Address</span>
          <input
            type="email"
            name="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={hasError}
            aria-describedby="login-error"
            placeholder="you@company.com"
          />
        </label>

        <label className="login-field">
          <span className="login-field-label">Password</span>
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={hasError}
            aria-describedby="login-error"
            placeholder="Enter your password"
          />
        </label>

        {/* Error message placeholder: hidden by default, shown only when there's an error */}
        <p
          id="login-error"
          className="login-error"
          role="alert"
          hidden={!hasError}
        >
          {errorMessage}
        </p>

        <button type="submit" className="login-button" disabled={isSubmitting}>
          {isSubmitting ? 'Logging in…' : 'Login'}
        </button>
      </form>
    </div>
  );
}
