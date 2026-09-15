import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import OnboardingChecklist from '../OnboardingChecklist.jsx';

const sampleItems = [
  { id: 1, task: 'IT Setup', status: 'Pending', dueDate: '2026-09-15' },
  { id: 2, task: 'Complete HR paperwork', status: 'In Progress', dueDate: '2026-09-16' },
  { id: 3, task: 'Meet your manager', status: 'Completed', dueDate: '2026-09-14' },
];

describe('OnboardingChecklist', () => {
  it('renders a title and one row per checklist item', () => {
    render(<OnboardingChecklist items={sampleItems} />);

    expect(screen.getByRole('heading', { name: /onboarding checklist/i })).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });

  it('renders the task, status, and due date for each item', () => {
    render(<OnboardingChecklist items={sampleItems} />);

    expect(screen.getByText('IT Setup')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('Due 2026-09-15')).toBeInTheDocument();

    expect(screen.getByText('Complete HR paperwork')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();

    expect(screen.getByText('Meet your manager')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('formats non-ISO due dates as YYYY-MM-DD per the wireframe date format', () => {
    render(
      <OnboardingChecklist
        items={[{ task: 'Badge photo', status: 'pending', dueDate: 'September 20, 2026' }]}
      />
    );

    expect(screen.getByText('Due 2026-09-20')).toBeInTheDocument();
  });

  it('falls back to "Pending" and "No due date" for missing/unrecognized fields', () => {
    render(<OnboardingChecklist items={[{ task: 'Mystery task', status: 'weird-status' }]} />);

    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('Due No due date')).toBeInTheDocument();
  });

  it('shows an empty state when there are no checklist items', () => {
    render(<OnboardingChecklist items={[]} />);

    expect(screen.getByText(/no onboarding tasks yet/i)).toBeInTheDocument();
  });
});
