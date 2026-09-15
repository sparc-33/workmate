import React, { useEffect, useRef, useState } from 'react';
import LoginScreen from './components/LoginScreen/LoginScreen.jsx';
import ChatMessage from './components/ChatMessage/ChatMessage.jsx';
import OnboardingChecklist from './components/OnboardingChecklist/OnboardingChecklist.jsx';
import MessageInputBar from './components/MessageInputBar/MessageInputBar.jsx';
import Avatar from './components/Avatar/Avatar.jsx';
import { fetchCurrentUser, login, logout } from './api/auth.js';
import './App.css';

// Placeholder checklist data until the onboarding checklist API (WMI-F02
// backend) is wired up. Extends the PRD's sample data (PRD WorkMate AI
// v1.0, Wireframe Instructions) with a mix of statuses so the "Onboarding
// Checklist" suggested prompt has something to filter down to Pending.
const SAMPLE_CHECKLIST = [
  { id: 1, task: 'IT Setup', status: 'Pending', dueDate: '2026-09-15' },
  { id: 2, task: 'Complete HR paperwork', status: 'In Progress', dueDate: '2026-09-16' },
  { id: 3, task: 'Meet your manager', status: 'Completed', dueDate: '2026-09-14' },
  { id: 4, task: 'Security awareness training', status: 'Pending', dueDate: '2026-09-18' },
];

// Wireframe "First Use" suggested prompts (PRD WorkMate AI v1.0). Clicking
// one sends its text through the same path as typing it into the message
// input bar, then disappears — offering it again in the same conversation
// wouldn't make sense once it's been used.
const SUGGESTED_PROMPTS = [
  { id: 'onboarding-checklist', label: 'Onboarding Checklist', text: 'Show my onboarding checklist' },
];

// Wireframe "No Data Found" edge state (PRD WorkMate AI v1.0).
const NO_DATA_FOUND_MESSAGE =
  "I couldn't find specific information on that. Would you like to contact HR or IT?";

// Shown once the user declines that offer; the conversation then "closes"
// until they say "hi" again.
const CLOSING_MESSAGE =
  'Thank you for your message! If you have any other questions, just say "hi" and I\'ll be happy to assist you.';
const CLOSED_REMINDER_MESSAGE = 'This chat is closed. Send "hi" to start again.';
const CLOSED_PLACEHOLDER = 'This chat is closed — type "hi" to resume';

const NEW_CHAT_TITLE = 'New chat';
const HISTORY_TITLE_MAX_LENGTH = 32;

function normalize(text) {
  return text.trim().toLowerCase().replace(/[.!]+$/, '');
}

function isOnboardingChecklistIntent(text) {
  const normalized = text.toLowerCase();
  return normalized.includes('checklist') || normalized.includes('onboarding');
}

function isNegativeReply(text) {
  return ['no', 'nope', 'nah', 'no thanks', 'not now'].includes(normalize(text));
}

function isReopenTrigger(text) {
  return normalize(text) === 'hi';
}

function titleFromMessage(text) {
  const trimmed = text.trim();
  return trimmed.length > HISTORY_TITLE_MAX_LENGTH
    ? `${trimmed.slice(0, HISTORY_TITLE_MAX_LENGTH - 1)}…`
    : trimmed;
}

function welcomeText(email) {
  return `Hi ${email}! How can I help you today?`;
}

// Wires LoginScreen (WMI-52) up to the real backend auth API (WMI-53):
// POST /auth/login on submit, GET /auth/me to restore a session on reload.
// After sign-in, renders the Chat Interface (wireframe WMI-F02, Screen 2):
// a full-width "WorkMate AI" header, a history sidebar underneath it (with
// a "+ New chat" action), a scrollable chat history, a one-time
// "Onboarding Checklist" suggested prompt, and a message input bar.
// Asking for the checklist — via the suggested prompt or by typing —
// renders it as a structured AI chat response filtered to Pending tasks
// only (WMI-58). Declining the fallback's HR/IT offer ("no") closes the
// conversation until the user says "hi" again.
export default function App() {
  const [user, setUser] = useState(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const nextConversationId = useRef(0);
  const nextMessageId = useRef(0);
  const chatHistoryRef = useRef(null);

  useEffect(() => {
    fetchCurrentUser()
      .then(setUser)
      .finally(() => setIsCheckingSession(false));
  }, []);

  function createConversation(email) {
    const conversationId = nextConversationId.current;
    nextConversationId.current += 1;
    const messageId = nextMessageId.current;
    nextMessageId.current += 1;

    return {
      id: conversationId,
      title: NEW_CHAT_TITLE,
      closed: false,
      messages: [{ id: messageId, sender: 'ai', kind: 'text', text: welcomeText(email) }],
      usedPromptIds: [],
    };
  }

  useEffect(() => {
    if (user) {
      const conversation = createConversation(user.email);
      setConversations([conversation]);
      setActiveConversationId(conversation.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const activeConversation = conversations.find((c) => c.id === activeConversationId) || null;

  // Auto-scroll the chat history to the latest message. The chat-history
  // element is the only scrollable region (see App.css) — the header,
  // sidebar, and composer stay put.
  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [activeConversation?.messages]);

  async function handleLogin({ email, password }) {
    const { user: loggedInUser } = await login({ email, password });
    setUser(loggedInUser);
  }

  function handleLogout() {
    logout();
    setUser(null);
    setConversations([]);
    setActiveConversationId(null);
  }

  function handleNewChat() {
    if (!user) return;
    const conversation = createConversation(user.email);
    setConversations((prev) => [conversation, ...prev]);
    setActiveConversationId(conversation.id);
  }

  function updateActiveConversation(updater) {
    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.id === activeConversationId ? updater(conversation) : conversation
      )
    );
  }

  function addMessage(message) {
    const id = nextMessageId.current;
    nextMessageId.current += 1;
    updateActiveConversation((conversation) => ({
      ...conversation,
      messages: [...conversation.messages, { id, ...message }],
    }));
  }

  function handleSend(text) {
    const conversation = activeConversation;
    if (!conversation) return;

    addMessage({ sender: 'user', kind: 'text', text });
    updateActiveConversation((c) => ({
      ...c,
      title: c.title === NEW_CHAT_TITLE ? titleFromMessage(text) : c.title,
    }));

    if (conversation.closed) {
      if (isReopenTrigger(text)) {
        updateActiveConversation((c) => ({ ...c, closed: false }));
        addMessage({ sender: 'ai', kind: 'text', text: welcomeText(user.email) });
      } else {
        addMessage({ sender: 'ai', kind: 'text', text: CLOSED_REMINDER_MESSAGE });
      }
      return;
    }

    if (isNegativeReply(text)) {
      addMessage({ sender: 'ai', kind: 'text', text: CLOSING_MESSAGE });
      updateActiveConversation((c) => ({ ...c, closed: true }));
      return;
    }

    if (isOnboardingChecklistIntent(text)) {
      const pendingItems = SAMPLE_CHECKLIST.filter(
        (item) => item.status.toLowerCase() === 'pending'
      );
      addMessage({ sender: 'ai', kind: 'checklist', items: pendingItems });
      return;
    }

    addMessage({ sender: 'ai', kind: 'text', text: NO_DATA_FOUND_MESSAGE });
  }

  function handlePromptClick(prompt) {
    updateActiveConversation((conversation) => ({
      ...conversation,
      usedPromptIds: [...conversation.usedPromptIds, prompt.id],
    }));
    handleSend(prompt.text);
  }

  if (isCheckingSession) {
    return null;
  }

  if (user && activeConversation) {
    const visiblePrompts = activeConversation.closed
      ? []
      : SUGGESTED_PROMPTS.filter((prompt) => !activeConversation.usedPromptIds.includes(prompt.id));

    return (
      <div className="app-shell">
        <header className="app-header">
          <span className="app-header-title">WorkMate AI</span>
          <div className="app-header-user">
            <span className="app-header-email">{user.email}</span>
            <button type="button" className="login-button" onClick={handleLogout}>
              Log out
            </button>
          </div>
        </header>

        <div className="app-body">
          <aside className="sidebar">
            <button type="button" className="new-chat-button" onClick={handleNewChat}>
              + New chat
            </button>

            <div className="sidebar-section-label">History</div>
            <nav className="conversation-history" aria-label="Conversation history">
              {conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  type="button"
                  title={conversation.title}
                  className={
                    conversation.id === activeConversationId
                      ? 'conversation-history-item conversation-history-item--active'
                      : 'conversation-history-item'
                  }
                  onClick={() => setActiveConversationId(conversation.id)}
                >
                  {conversation.title}
                </button>
              ))}
            </nav>
          </aside>

          <div className="chat-screen">
            <div className="chat-history" role="log" aria-label="Chat history" ref={chatHistoryRef}>
              {activeConversation.messages.map((message) => (
                <ChatMessage key={message.id} sender={message.sender}>
                  {message.kind === 'checklist' ? (
                    <OnboardingChecklist items={message.items} />
                  ) : (
                    message.text
                  )}
                </ChatMessage>
              ))}
            </div>

            <div className="chat-composer">
              {visiblePrompts.length > 0 && (
                <div className="suggested-prompts">
                  {visiblePrompts.map((prompt) => (
                    <button
                      key={prompt.id}
                      type="button"
                      className="suggested-prompt-button"
                      onClick={() => handlePromptClick(prompt)}
                    >
                      {prompt.label}
                    </button>
                  ))}
                </div>
              )}
              <div className="composer-input-row">
                <Avatar kind="user" />
                <MessageInputBar
                  onSend={handleSend}
                  placeholder={activeConversation.closed ? CLOSED_PLACEHOLDER : undefined}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <LoginScreen onLogin={handleLogin} />;
}
