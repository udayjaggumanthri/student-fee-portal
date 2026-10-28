import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from './test-utils';
import DashboardView from '../components/views/DashboardView';

describe('DashboardView Component', () => {
  const mockKpiData = {
    total_students: 120,
    total_expected: '2400000.00',
    total_collected: '1800000.00',
    total_dues: '600000.00',
    collection_rate: 75.0,
    paid_count: 50,
    partial_count: 40,
    unpaid_count: 30,
    program_breakdown: [
      {
        id: 1,
        name: 'Degree (3 Years)',
        code: 'DEGREE',
        student_count: 60,
        total_expected: '1200000.00',
        total_collected: '900000.00',
        total_due: '300000.00',
      },
      {
        id: 2,
        name: 'Open School Inter',
        code: 'INTER',
        student_count: 30,
        total_expected: '600000.00',
        total_collected: '450000.00',
        total_due: '150000.00',
      },
    ],
  };

  const mockPrograms = [
    { id: 1, name: 'Degree (3 Years)', code: 'DEGREE' },
    { id: 2, name: 'Open School Inter', code: 'INTER' },
  ];

  const mockBatches = [
    { id: 1, batch_name: '26A', program: 1, student_count: 60 },
  ];

  it('renders summary statistics and KPI cards properly', () => {
    renderWithProviders(
      <DashboardView
        kpiData={mockKpiData}
        programs={mockPrograms}
        batches={mockBatches}
        academicWorkspace="all"
        setAcademicWorkspace={vi.fn()}
        onOpenCollectPayment={vi.fn()}
        onNavigateToStudents={vi.fn()}
      />
    );

    // Total students card should display 120
    expect(screen.getByText('120')).toBeInTheDocument();
    // Collection rate percentage
    expect(screen.getByText(/75% Target Realized/i)).toBeInTheDocument();
  });

  it('renders quick action buttons', () => {
    const onOpenCollectPayment = vi.fn();
    renderWithProviders(
      <DashboardView
        kpiData={mockKpiData}
        programs={mockPrograms}
        batches={mockBatches}
        academicWorkspace="all"
        setAcademicWorkspace={vi.fn()}
        onOpenCollectPayment={onOpenCollectPayment}
        onNavigateToStudents={vi.fn()}
      />
    );

    const recordPaymentBtn = screen.getByRole('button', { name: /collect fee/i });
    expect(recordPaymentBtn).toBeInTheDocument();
  });
});
