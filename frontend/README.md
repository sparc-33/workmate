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

## Onboarding checklist in the chat interface (WMI-58)

Epic WMI-38 (AI Onboarding & Process Assistant) → Story WMI-44 (role-specific
onboarding checklist) → Task WMI-58: display checklist items (task, status,
due date) as structured chat responses, per the wireframe (WMI-F02, Screen 2
— Chat Interface) and PRD WorkMate AI v1.0.

Four components implement this:

- `src/components/Avatar/Avatar.jsx` — a shared circular avatar: `kind="ai"`
  renders "AI" initials, `kind="user"` renders a person icon. Used both in
  `ChatMessage` and next to the composer's input bar.
- `src/components/ChatMessage/ChatMessage.jsx` — a generic AI/user message
  bubble for the chat history area. Pass `sender="ai"` or `sender="user"`;
  children can be plain text or a structured component. AI messages show an
  "AI" avatar on the left of the bubble; user messages show a user-icon
  avatar on the right.
- `src/components/OnboardingChecklist/OnboardingChecklist.jsx` — renders a
  list of checklist items as `{ task, status, dueDate }` rows, meant to be
  used as the content of an AI `ChatMessage`. Status is normalized to
  `Pending` / `In Progress` / `Completed` (unrecognized or missing statuses
  fall back to `Pending`); due dates are formatted `YYYY-MM-DD` per the
  wireframe's global date format. An empty `items` list renders a
  "No onboarding tasks yet" placeholder rather than an empty card. It does
  not filter by status itself — pass it whatever items the caller wants
  shown (see below).
- `src/components/MessageInputBar/MessageInputBar.jsx` — the wireframe's
  message input bar + icon send button ("Type your message..."). Enter
  submits, Shift+Enter inserts a newline, and the send button is disabled
  while the field is empty.

```jsx
<ChatMessage sender="ai">
  <OnboardingChecklist
    items={[{ id: 1, task: 'IT Setup', status: 'Pending', dueDate: '2026-09-15' }]}
  />
</ChatMessage>
```

`src/App.jsx` wires these into a working chat screen:

- **Header** (fixed, spans the full window width) — "WorkMate AI" + the
  signed-in user's email and a Log out button. The sidebar and chat area
  sit in a row underneath it.
- **History sidebar** (left, independently scrollable, under the header) —
  a "+ New chat" action that starts a fresh conversation (its own welcome
  message and its own one-time suggested prompt), and a list of every
  conversation in this session, titled from each conversation's first
  message. Clicking an entry switches the chat history to that
  conversation without losing its messages.
- **Chat history** (center, the *only* region that scrolls — the header,
  sidebar, and composer stay put; it also auto-scrolls to the latest
  message).
- **Composer** (fixed, bottom) — the "Onboarding Checklist" suggested
  prompt (only shown until it's been used once in the current
  conversation) above the message input bar, which has the current user's
  avatar beside it.

Asking for the checklist — by clicking the suggested prompt (which then
disappears for that conversation), or by typing any message containing
"checklist" or "onboarding" — filters `SAMPLE_CHECKLIST` down to
**Pending** items only and renders that as the AI response; any other
message gets the wireframe's "No Data Found" fallback ("I couldn't find
specific information on that. Would you like to contact HR or IT?").
`SAMPLE_CHECKLIST` is placeholder data (seeded from, and extended beyond,
the PRD's sample data) until the real per-user, role-specific checklist API
is wired up — see WMI-44's other subtasks for that backend work, which is
out of scope for WMI-58.

**Closing/reopening the conversation:** replying "no" (or "nope"/"nah"/"no
thanks"/"not now") to the "No Data Found" fallback's HR/IT offer closes the
conversation with a goodbye message ("Thank you for your message! ... just
say \"hi\" ..."). While closed, the input's placeholder changes to say so,
and any message other than "hi" just gets a "this chat is closed" reminder
instead of a normal response; sending "hi" reopens it with a fresh welcome
message and normal processing resumes. This state is per-conversation, so
starting a "+ New chat" or switching to a different history entry is
always open.

## Scripts

```bash
npm install
npm run dev      # preview the demo app (frontend/src/App.jsx)
npm run test     # run the component unit/interaction tests (vitest)
npm run build
```

Note: dependencies could not be installed/verified in the sandbox this was
authored in (outbound npm registry access was blocked there) — run
`npm install && npm test` locally before merging.
