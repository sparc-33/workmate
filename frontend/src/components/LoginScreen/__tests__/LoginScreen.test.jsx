import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginScreen from '../LoginScreen.jsx';

describe('LoginScreen', () => {
  it('renders logo, email field, password field, login button, and a hidden error placeholder', () => {
    render(<LoginScreen />);

    expect(screen.getByAltText('Company logo')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('you@company.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();

    const errorEl = screen.getByRole('alert', { hidden: true });
    expect(errorEl).not.toBeVisible();
  });

  it('shows the error placeholder when fields are left empty', async () => {
    render(<LoginScreen />);

    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    const errorEl = await screen.findByText(/email address is required/i);
    expect(errorEl).toBeVisible();
  });

  it('shows the error placeholder when the email is invalid', async () => {
    render(<LoginScreen />);

    fireEvent.change(screen.getByPlaceholderText('you@company.com'), {
      target: { value: 'not-an-email' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
      target: { value: 'somepassword' },
    });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    expect(await screen.findByText(/valid email address/i)).toBeVisible();
  });

  it('calls onLogin with trimmed credentials and shows the returned error on rejection', async () => {
    const onLogin = vi.fn().mockRejectedValue(new Error('Invalid email or password.'));
    render(<LoginScreen onLogin={onLogin} />);

    fireEvent.change(screen.getByPlaceholderText('you@company.com'), {
      target: { value: ' user@example.com ' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
      target: { value: 'secret123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() =>
      expect(onLogin).toHaveBeenCalledWith({ email: 'user@example.com', password: 'secret123' })
    );
    expect(await screen.findByText('Invalid email or password.')).toBeVisible();
  });

  it('does not show the error placeholder on a successful login', async () => {
    const onLogin = vi.fn().mockResolvedValue(undefined);
    render(<LoginScreen onLogin={onLogin} />);

    fireEvent.change(screen.getByPlaceholderText('you@company.com'), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
      target: { value: 'secret123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => expect(onLogin).toHaveBeenCalled());
    expect(screen.getByRole('alert', { hidden: true })).not.toBeVisible();
  });
});
