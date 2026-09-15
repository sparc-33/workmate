import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MessageInputBar from '../MessageInputBar.jsx';

describe('MessageInputBar', () => {
  it('disables the send button while the field is empty', () => {
    render(<MessageInputBar onSend={() => {}} />);

    expect(screen.getByRole('button', { name: /send message/i })).toBeDisabled();
  });

  it('calls onSend with the trimmed text and clears the field on submit', () => {
    const onSend = vi.fn();
    render(<MessageInputBar onSend={onSend} />);

    const textarea = screen.getByPlaceholderText('Type your message...');
    fireEvent.change(textarea, { target: { value: '  Show my onboarding checklist  ' } });
    fireEvent.click(screen.getByRole('button', { name: /send message/i }));

    expect(onSend).toHaveBeenCalledWith('Show my onboarding checklist');
    expect(textarea).toHaveValue('');
  });

  it('submits on Enter and inserts a newline on Shift+Enter instead', () => {
    const onSend = vi.fn();
    render(<MessageInputBar onSend={onSend} />);

    const textarea = screen.getByPlaceholderText('Type your message...');
    fireEvent.change(textarea, { target: { value: 'Hello' } });
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true });
    expect(onSend).not.toHaveBeenCalled();

    fireEvent.keyDown(textarea, { key: 'Enter' });
    expect(onSend).toHaveBeenCalledWith('Hello');
  });

  it('does not call onSend for whitespace-only input', () => {
    const onSend = vi.fn();
    render(<MessageInputBar onSend={onSend} />);

    fireEvent.change(screen.getByPlaceholderText('Type your message...'), {
      target: { value: '   ' },
    });
    fireEvent.keyDown(screen.getByPlaceholderText('Type your message...'), { key: 'Enter' });

    expect(onSend).not.toHaveBeenCalled();
  });

  it('supports a custom placeholder, e.g. to prompt for "hi" while a chat is closed', () => {
    render(<MessageInputBar onSend={() => {}} placeholder='This chat is closed — type "hi" to resume' />);

    expect(screen.getByPlaceholderText('This chat is closed — type "hi" to resume')).toBeInTheDocument();
  });
});
