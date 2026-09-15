import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ChatMessage from '../ChatMessage.jsx';

describe('ChatMessage', () => {
  it('renders AI messages with an "AI" avatar inside a labeled group', () => {
    render(<ChatMessage sender="ai">Hello there</ChatMessage>);

    expect(screen.getByText('Hello there')).toBeInTheDocument();
    expect(screen.getByRole('group', { name: /workmate ai message/i })).toBeInTheDocument();
    expect(screen.getByText('AI')).toBeInTheDocument();
  });

  it('renders user messages with a user-icon avatar instead of the "AI" label', () => {
    const { container } = render(<ChatMessage sender="user">My question</ChatMessage>);

    expect(screen.getByRole('group', { name: /your message/i })).toBeInTheDocument();
    expect(screen.queryByText('AI')).not.toBeInTheDocument();
    expect(container.querySelector('.avatar--user svg')).toBeInTheDocument();
  });

  it('can wrap a structured child component, not just text', () => {
    render(
      <ChatMessage sender="ai">
        <div data-testid="structured-child">structured content</div>
      </ChatMessage>
    );

    expect(screen.getByTestId('structured-child')).toBeInTheDocument();
  });
});
