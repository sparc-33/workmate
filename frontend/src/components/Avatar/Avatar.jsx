import React from 'react';
import './Avatar.css';

function UserGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
      <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-4.42 0-8 2.24-8 5v1a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-1c0-2.76-3.58-5-8-5Z" />
    </svg>
  );
}

/**
 * Avatar
 *
 * Shared circular avatar: "AI" initials for `kind="ai"`, a person icon for
 * `kind="user"`. Used both inside chat message bubbles (ChatMessage, on
 * the left for AI / right for user) and next to the message composer's
 * input bar in App.jsx, so the same user avatar appears consistently
 * wherever a user's own message or input is shown.
 */
export default function Avatar({ kind = 'ai' }) {
  return (
    <div className={`avatar avatar--${kind}`} aria-hidden="true">
      {kind === 'ai' ? 'AI' : <UserGlyph />}
    </div>
  );
}
