import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import App from '../App.jsx';
import * as auth from '../api/auth.js';

// App renders the Chat Interface (WMI-F02, Screen 2) once a user session
// exists, so drive it through a signed-in `fetchCurrentUser` rather than
// exercising LoginScreen here (that's covered by LoginScreen's own tests).
function signedInAs(email) {
  vi.spyOn(auth, 'fetchCurrentUser').mockResolvedValue({ email });
}

describe('App — chat interface (WMI-58)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('greets the signed-in user and shows the suggested prompt, input bar, and New chat action', async () => {
    signedInAs('test.user@workmate.ai');
    render(<App />);

    expect(
      await screen.findByText('Hi test.user@workmate.ai! How can I help you today?')
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Onboarding Checklist' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Type your message...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '+ New chat' })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: /conversation history/i })).toBeInTheDocument();
  });

  it('shows only Pending checklist items and hides the suggested prompt once it has been used', async () => {
    signedInAs('test.user@workmate.ai');
    render(<App />);

    fireEvent.click(await screen.findByRole('button', { name: 'Onboarding Checklist' }));

    expect(await screen.findByText('IT Setup')).toBeInTheDocument();
    expect(screen.getByText('Security awareness training')).toBeInTheDocument();
    expect(screen.getAllByText('Pending')).toHaveLength(2);
    expect(screen.queryByText('Complete HR paperwork')).not.toBeInTheDocument();
    expect(screen.queryByText('Meet your manager')).not.toBeInTheDocument();

    // The prompt only makes sense to offer once per conversation.
    expect(screen.queryByRole('button', { name: 'Onboarding Checklist' })).not.toBeInTheDocument();
  });

  it('also shows the filtered checklist when the user types a matching message', async () => {
    signedInAs('test.user@workmate.ai');
    render(<App />);

    const textarea = await screen.findByPlaceholderText('Type your message...');
    fireEvent.change(textarea, { target: { value: 'show me my onboarding checklist' } });
    fireEvent.click(screen.getByRole('button', { name: /send message/i }));

    expect(await screen.findByText('show me my onboarding checklist')).toBeInTheDocument();
    expect(await screen.findByText('IT Setup')).toBeInTheDocument();
    expect(screen.queryByText('Meet your manager')).not.toBeInTheDocument();
  });

  it('falls back to the "no data found" response for an unrelated message', async () => {
    signedInAs('test.user@workmate.ai');
    render(<App />);

    const textarea = await screen.findByPlaceholderText('Type your message...');
    fireEvent.change(textarea, { target: { value: 'What is the weather today?' } });
    fireEvent.click(screen.getByRole('button', { name: /send message/i }));

    expect(await screen.findByText(/couldn't find specific information/i)).toBeInTheDocument();
  });

  it('titles the conversation in the history sidebar from its first message', async () => {
    signedInAs('test.user@workmate.ai');
    render(<App />);

    const textarea = await screen.findByPlaceholderText('Type your message...');
    fireEvent.change(textarea, { target: { value: 'Show my onboarding checklist' } });
    fireEvent.click(screen.getByRole('button', { name: /send message/i }));

    const history = screen.getByRole('navigation', { name: /conversation history/i });
    expect(
      await within(history).findByRole('button', { name: 'Show my onboarding checklist' })
    ).toBeInTheDocument();
  });

  it('starts a fresh conversation with "+ New chat" and keeps the previous one reachable from history', async () => {
    signedInAs('test.user@workmate.ai');
    render(<App />);

    fireEvent.click(await screen.findByRole('button', { name: 'Onboarding Checklist' }));
    expect(await screen.findByText('IT Setup')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '+ New chat' }));

    // Fresh conversation: welcome message again, prompt button is back, no checklist yet.
    expect(
      await screen.findByText('Hi test.user@workmate.ai! How can I help you today?')
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Onboarding Checklist' })).toBeInTheDocument();
    expect(screen.queryByText('IT Setup')).not.toBeInTheDocument();

    // Switch back to the earlier conversation via the history sidebar.
    fireEvent.click(screen.getByRole('button', { name: 'Show my onboarding checklist' }));
    expect(await screen.findByText('IT Setup')).toBeInTheDocument();
  });

  it('shows a user avatar next to the message input bar', async () => {
    signedInAs('test.user@workmate.ai');
    const { container } = render(<App />);

    await screen.findByPlaceholderText('Type your message...');

    expect(container.querySelector('.composer-input-row .avatar--user')).toBeInTheDocument();
  });

  it('closes the chat after a negative reply and only reopens on "hi"', async () => {
    signedInAs('test.user@workmate.ai');
    render(<App />);

    // The textarea's accessible name ("Type your message") stays constant
    // even though its placeholder text changes when the chat is closed, so
    // it's a stable way to find it across both states.
    const send = (value) => {
      const textarea = screen.getByRole('textbox', { name: 'Type your message' });
      fireEvent.change(textarea, { target: { value } });
      fireEvent.click(screen.getByRole('button', { name: /send message/i }));
    };

    await screen.findByPlaceholderText('Type your message...');
    send('hello');
    expect(await screen.findByText(/couldn't find specific information/i)).toBeInTheDocument();

    send('no');
    expect(
      await screen.findByText(/thank you for your message!.*say "hi"/i)
    ).toBeInTheDocument();

    // The input now hints that the chat is closed, and further unrelated
    // messages get a reminder instead of a normal response.
    expect(await screen.findByPlaceholderText(/this chat is closed/i)).toBeInTheDocument();
    send('anything else');
    expect(await screen.findByText(/this chat is closed\. send "hi"/i)).toBeInTheDocument();

    // "hi" reopens it — the input placeholder goes back to normal and a
    // fresh welcome message is shown.
    send('hi');
    expect(await screen.findByPlaceholderText('Type your message...')).toBeInTheDocument();
    const welcomeMessages = await screen.findAllByText(
      'Hi test.user@workmate.ai! How can I help you today?'
    );
    expect(welcomeMessages).toHaveLength(2);

    // Normal processing resumes.
    send('show my onboarding checklist');
    expect(await screen.findByText('IT Setup')).toBeInTheDocument();
  });
});
