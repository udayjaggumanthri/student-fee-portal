import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from './test-utils';
import LoginView from '../components/views/LoginView';

describe('LoginView Component', () => {
  it('renders login screen with institution details and role selection', () => {
    renderWithProviders(<LoginView />);

    expect(screen.getByText(/Secure Institutional Access/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in to.*portal/i })).toBeInTheDocument();
  });

  it('switches demo roles when clicking role buttons', () => {
    renderWithProviders(<LoginView />);

    // Click on Staff / Caller role
    const callerRoleBtn = screen.getByText(/Staff \/ Caller/i);
    fireEvent.click(callerRoleBtn);

    // Email input should update to anitha@navodaya.edu
    const emailInput = screen.getByDisplayValue('anitha@navodaya.edu');
    expect(emailInput).toBeInTheDocument();

    // Click on Principal role
    const principalRoleBtn = screen.getByText(/Oversight/i);
    fireEvent.click(principalRoleBtn);

    const principalEmailInput = screen.getByDisplayValue('principal@navodaya.edu');
    expect(principalEmailInput).toBeInTheDocument();
  });

  it('opens forgot password modal when clicked', () => {
    renderWithProviders(<LoginView />);

    const forgotBtn = screen.getByText(/forgot password\?/i);
    fireEvent.click(forgotBtn);

    expect(screen.getByText(/Reset Account Password/i)).toBeInTheDocument();
  });
});
