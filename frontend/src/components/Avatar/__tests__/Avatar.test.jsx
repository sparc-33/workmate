import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import Avatar from '../Avatar.jsx';

describe('Avatar', () => {
  it('renders "AI" initials for kind="ai"', () => {
    const { getByText } = render(<Avatar kind="ai" />);
    expect(getByText('AI')).toBeInTheDocument();
  });

  it('renders a person icon for kind="user"', () => {
    const { container } = render(<Avatar kind="user" />);
    expect(container.querySelector('.avatar--user svg')).toBeInTheDocument();
  });
});
