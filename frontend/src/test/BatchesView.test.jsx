import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from './test-utils';
import BatchesView from '../components/views/BatchesView';

describe('BatchesView Component', () => {
  const mockPrograms = [
    { id: 1, name: 'Degree (3-Year Program)', code: 'DEGREE' },
    { id: 2, name: 'Open School Inter', code: 'INTER' },
  ];

  const mockBatches = [
    {
      id: 101,
      batch_name: '26A DEG',
      program: 1,
      program_name: 'Degree (3-Year Program)',
      program_code: 'DEGREE',
      academic_year: '2026-2027',
      duration_years: 3,
      student_count: 76,
      total_expected: '1711000.00',
      total_collected: '479000.00',
      total_due: '1232000.00',
      candidate_types: ['WITH', 'WITHOUT'],
    },
    {
      id: 102,
      batch_name: 'Inter 2026-2027',
      program: 2,
      program_name: 'Open School Inter',
      program_code: 'INTER',
      academic_year: '2026-2027',
      duration_years: 1,
      student_count: 24,
      total_expected: '419000.00',
      total_collected: '138000.00',
      total_due: '281000.00',
      candidate_types: ['WITHOUT'],
    },
  ];

  it('renders batch cards and ledger comparison table properly', () => {
    renderWithProviders(
      <BatchesView
        batches={mockBatches}
        programs={mockPrograms}
        loading={false}
        onSelectBatch={vi.fn()}
        onAddNewBatch={vi.fn()}
        onExportExcel={vi.fn()}
        onBatchUpdated={vi.fn()}
      />
    );

    // Both batches should be visible in headings and table
    expect(screen.getAllByText('26A DEG').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Inter 2026-2027').length).toBeGreaterThan(0);

    // Pill count matches
    expect(screen.getByText('All Programs (2 Batches)')).toBeInTheDocument();
  });

  it('filters batches when clicking a program filter pill', () => {
    renderWithProviders(
      <BatchesView
        batches={mockBatches}
        programs={mockPrograms}
        loading={false}
        onSelectBatch={vi.fn()}
        onAddNewBatch={vi.fn()}
        onExportExcel={vi.fn()}
        onBatchUpdated={vi.fn()}
      />
    );

    // Click 'Open School Inter' filter pill
    const interPill = screen.getByRole('button', { name: /Open School Inter/i });
    fireEvent.click(interPill);

    // Degree batch should no longer be in the grid or table
    expect(screen.queryByText('26A DEG')).not.toBeInTheDocument();
    // Inter batch should remain
    expect(screen.getAllByText('Inter 2026-2027').length).toBeGreaterThan(0);
  });

  it('renders empty state when no batches are configured', () => {
    const onAddNewBatch = vi.fn();
    renderWithProviders(
      <BatchesView
        batches={[]}
        programs={mockPrograms}
        loading={false}
        onSelectBatch={vi.fn()}
        onAddNewBatch={onAddNewBatch}
        onExportExcel={vi.fn()}
        onBatchUpdated={vi.fn()}
      />
    );

    expect(screen.getByText(/No Academic Batches Found/i)).toBeInTheDocument();
    const createBtn = screen.getByRole('button', { name: /\+ Create First Batch/i });
    expect(createBtn).toBeInTheDocument();

    fireEvent.click(createBtn);
    expect(onAddNewBatch).toHaveBeenCalled();
  });

  it('renders loading state when data is being fetched', () => {
    renderWithProviders(
      <BatchesView
        batches={[]}
        programs={mockPrograms}
        loading={true}
        onSelectBatch={vi.fn()}
        onAddNewBatch={vi.fn()}
        onExportExcel={vi.fn()}
        onBatchUpdated={vi.fn()}
      />
    );

    expect(screen.getByText(/Loading batches & cohorts.../i)).toBeInTheDocument();
  });
});
