import React from 'react';
import './OnboardingChecklist.css';

const STATUS_LABELS = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
};

function normalizeStatus(status) {
  const key = String(status ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_');
  return STATUS_LABELS[key] ? key : 'pending';
}

// Wireframe date format (PRD WorkMate AI v1.0, Wireframe Instructions): YYYY-MM-DD.
function formatDueDate(dueDate) {
  if (!dueDate) return 'No due date';

  const date = new Date(dueDate);
  if (Number.isNaN(date.getTime())) return String(dueDate);

  return date.toISOString().slice(0, 10);
}

/**
 * OnboardingChecklist (WMI-58)
 *
 * Renders a role-specific onboarding checklist — task, status, and due
 * date — as a structured chat response, per the wireframe (WMI-F02,
 * Screen 2 — Chat Interface) and the acceptance criteria on WMI-44
 * ("Checklist items reflect real tasks with status and due date").
 * Intended to be rendered as the content of an AI `ChatMessage` bubble;
 * the checklist data itself comes from the caller (the onboarding
 * checklist API, once WMI-F02's backend is wired up).
 *
 * @param {{ id?: string|number, task: string, status?: string, dueDate?: string }[]} items
 * @param {string} [title]
 */
export default function OnboardingChecklist({ items = [], title = 'Your onboarding checklist' }) {
  if (items.length === 0) {
    return (
      <div className="onboarding-checklist">
        <p className="onboarding-checklist-empty">
          No onboarding tasks yet — check back soon or contact HR.
        </p>
      </div>
    );
  }

  return (
    <div className="onboarding-checklist">
      <h2 className="onboarding-checklist-title">{title}</h2>
      <ul className="onboarding-checklist-list">
        {items.map((item, index) => {
          const statusKey = normalizeStatus(item.status);
          return (
            <li key={item.id ?? item.task ?? index} className="onboarding-checklist-item">
              <span className="onboarding-checklist-task">{item.task}</span>
              <span
                className={`onboarding-checklist-status onboarding-checklist-status--${statusKey}`}
              >
                {STATUS_LABELS[statusKey]}
              </span>
              <span className="onboarding-checklist-due">Due {formatDueDate(item.dueDate)}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
