# WorkMate Frontend

## LoginScreen (WMI-52)

`src/components/LoginScreen/LoginScreen.jsx` implements the login screen for
"Secure login with valid email and password" (WMI-42, epic WMI-37 — User
Authentication):

- Company logo
- Email Address field
- Password field
- Login button
- Error message placeholder, hidden by default, shown on validation failure
  or when the `onLogin` promise rejects

Client-side validation (required fields + email format) covers the "hidden
error placeholder" UI state without depending on the backend. Actual
credential validation is out of scope here — see WMI-53 (backend
credential validation / auth API). Wire it up by passing an `onLogin`
handler:

```jsx
<LoginScreen
  onLogin={async ({ email, password }) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error('Invalid email or password. Please try again.');
  }}
/>
```

## Scripts

```bash
npm install
npm run dev      # preview the demo app (frontend/src/App.jsx)
npm run test     # run the LoginScreen unit/interaction tests (vitest)
npm run build
```

Note: dependencies could not be installed/verified in the sandbox this was
authored in (outbound npm registry access was blocked there) — run
`npm install && npm test` locally before merging.
