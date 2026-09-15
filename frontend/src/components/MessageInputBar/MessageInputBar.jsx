import React, { useState } from 'react';
import './MessageInputBar.css';

/**
 * MessageInputBar
 *
 * The message input bar + send button from the wireframe (WMI-F02,
 * Screen 2 — Chat Interface, "Message Input Bar" / "Send Button"): a text
 * area with a "Type your message..." placeholder (overridable via
 * `placeholder`, e.g. to prompt for "hi" while a conversation is closed)
 * and an icon-based send button. Enter submits (Shift+Enter inserts a
 * newline); the send button is disabled while the field is empty.
 */
export default function MessageInputBar({ onSend, placeholder = 'Type your message...' }) {
  const [value, setValue] = useState('');

  function submit() {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setValue('');
  }

  function handleSubmit(event) {
    event.preventDefault();
    submit();
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  }

  return (
    <form className="message-input-bar" onSubmit={handleSubmit}>
      <textarea
        className="message-input-textarea"
        placeholder={placeholder}
        value={value}
        rows={1}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={handleKeyDown}
        aria-label="Type your message"
      />
      <button
        type="submit"
        className="message-send-button"
        aria-label="Send message"
        disabled={!value.trim()}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
          <path d="M2.94 2.94a1.5 1.5 0 0 1 1.61-.34l17 6.5a1.5 1.5 0 0 1 0 2.8l-17 6.5a1.5 1.5 0 0 1-2-1.83L4.6 12 2.55 4.77a1.5 1.5 0 0 1 .39-1.83z" />
        </svg>
      </button>
    </form>
  );
}
