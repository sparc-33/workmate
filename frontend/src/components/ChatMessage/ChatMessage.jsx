import React from 'react';
import Avatar from '../Avatar/Avatar.jsx';
import './ChatMessage.css';

/**
 * ChatMessage
 *
 * Generic message bubble for the WorkMate AI chat interface (wireframe
 * WMI-F02, Screen 2 — "Chat History Area": a scrollable container of user
 * and AI message bubbles). AI messages show an "AI" avatar on the left of
 * the bubble; user messages show a user-icon avatar on the right. Wraps
 * either plain text or a structured AI response component, such as the
 * onboarding checklist (WMI-58).
 */
export default function ChatMessage({ sender = 'ai', children }) {
  const isAi = sender === 'ai';

  return (
    <div
      className={`chat-message chat-message--${sender}`}
      role="group"
      aria-label={isAi ? 'WorkMate AI message' : 'Your message'}
    >
      <Avatar kind={isAi ? 'ai' : 'user'} />
      <div className="chat-message-bubble">{children}</div>
    </div>
  );
}
