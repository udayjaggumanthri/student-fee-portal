import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from './test-utils';
import DesktopHeader from '../components/layout/DesktopHeader';
import DesktopSidebar from '../components/layout/DesktopSidebar';
import MobileHeader from '../components/layout/MobileHeader';

describe('Navigation and Layout Components', () => {
  it('renders MobileHeader with hamburger menu, institution branding, and action controls', () => {
    const onOpenDrawer = vi.fn();
    renderWithProviders(<MobileHeader onOpenDrawer={onOpenDrawer} />);

    // Brand name and subtitle
    expect(screen.getByText(/Navodaya/i)).toBeInTheDocument();
    expect(screen.getByText(/Fee Management/i)).toBeInTheDocument();

    // Hamburger button triggers drawer
    const hamburgerBtn = screen.getByLabelText(/Open Navigation Drawer/i);
    expect(hamburgerBtn).toBeInTheDocument();
    fireEvent.click(hamburgerBtn);
    expect(onOpenDrawer).toHaveBeenCalled();

    // Theme toggle & notifications
    const themeBtn = screen.getByTitle(/Switch to.*Mode/i);
    expect(themeBtn).toBeInTheDocument();

    const notifBadge = screen.getByText('3');
    expect(notifBadge).toBeInTheDocument();

    // Account menu avatar
    const accountBtn = screen.getByTitle(/Account Menu/i);
    expect(accountBtn).toBeInTheDocument();
  });
  it('renders DesktopHeader with search and theme toggle', () => {
    const setSearch = vi.fn();
    renderWithProviders(
      <DesktopHeader
        search=""
        setSearch={setSearch}
        academicWorkspace="all"
        setAcademicWorkspace={vi.fn()}
        programs={[]}
      />
    );

    const searchInput = screen.getByPlaceholderText(/search student/i);
    expect(searchInput).toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: 'Srinivas' } });
    expect(setSearch).toHaveBeenCalledWith('Srinivas');

    // Theme toggle button should exist
    const themeBtn = screen.getByTitle(/switch to.*mode/i);
    expect(themeBtn).toBeInTheDocument();
    fireEvent.click(themeBtn);
  });

  it('renders DesktopHeader notification popover on click', () => {
    renderWithProviders(
      <DesktopHeader
        search=""
        setSearch={vi.fn()}
        academicWorkspace="all"
        setAcademicWorkspace={vi.fn()}
        programs={[]}
      />
    );

    const bellBtn = screen.getByTitle(/notifications & activity/i);
    fireEvent.click(bellBtn);

    expect(screen.getByText(/Payment Received/i)).toBeInTheDocument();
    expect(screen.getByText(/Batch 26A Milestones/i)).toBeInTheDocument();
  });

  it('renders DesktopSidebar navigation links', () => {
    renderWithProviders(<DesktopSidebar />);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Students')).toBeInTheDocument();
    expect(screen.getByText('Fee Collection')).toBeInTheDocument();
    expect(screen.getByText('Payments Ledger')).toBeInTheDocument();
    expect(screen.getByText('Reports & Audit')).toBeInTheDocument();
  });
});
