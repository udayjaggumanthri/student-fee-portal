import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from './test-utils';
import StudentsView from '../components/views/StudentsView';

describe('StudentsView Component', () => {
  const mockStudents = [
    {
      id: 1,
      batch: 1,
      name: 'Ravi Teja',
      student_id: '26A106BA001',
      group: 'B.Sc (Comp)',
      batch_name: '26A',
      total_fee_amount: '25000.00',
      total_paid_amount: '15000.00',
      total_balance_due: '10000.00',
      fee_status: 'PARTIAL',
      payment_percentage: 60.0,
      primary_contact: '9848022338',
      year_fees: [
        { year_index: 1, total_billed: 25000, total_paid: 15000, balance_due: 10000 },
      ],
    },
    {
      id: 2,
      batch: 1,
      name: 'Sunitha Kumari',
      student_id: '26A106BA002',
      group: 'B.Com',
      batch_name: '26A',
      total_fee_amount: '20000.00',
      total_paid_amount: '20000.00',
      total_balance_due: '0.00',
      fee_status: 'PAID',
      payment_percentage: 100.0,
      primary_contact: '9848022339',
      year_fees: [
        { year_index: 1, total_billed: 20000, total_paid: 20000, balance_due: 0 },
      ],
    },
  ];

  const mockBatches = [
    { id: 1, batch_name: '26A', program_code: 'DEGREE', academic_year: '2026-2027', student_count: 2 }
  ];
  const mockPrograms = [{ id: 1, name: 'Degree (3 Years)', code: 'DEGREE' }];
  const mockCenters = [{ id: 1, name: 'Tuni Campus', code: 'TUNI' }];

  it('renders batch directory cards by default and triggers batch selection', () => {
    const setSelectedBatch = vi.fn();
    renderWithProviders(
      <StudentsView
        students={mockStudents}
        batches={mockBatches}
        programs={mockPrograms}
        centers={mockCenters}
        selectedBatch="all"
        setSelectedBatch={setSelectedBatch}
        defaultViewMode="batches"
      />
    );

    // Batch directory shows batch cards
    expect(screen.getAllByText('26A')[0]).toBeInTheDocument();
    expect(screen.getByText(/Browse by Batches/i)).toBeInTheDocument();

    // Click on batch card to drill down
    fireEvent.click(screen.getAllByText('26A')[0]);
    expect(setSelectedBatch).toHaveBeenCalledWith('1');
  });

  it('renders student rows and their financial details in master/drilldown table mode', () => {
    renderWithProviders(
      <StudentsView
        students={mockStudents}
        batches={mockBatches}
        programs={mockPrograms}
        centers={mockCenters}
        selectedBatch="1"
        setSelectedBatch={vi.fn()}
        defaultViewMode="drilldown"
      />
    );

    expect(screen.getAllByText('Ravi Teja')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Sunitha Kumari')[0]).toBeInTheDocument();
    expect(screen.getAllByText('26A106BA001')[0]).toBeInTheDocument();
    expect(screen.getByText(/Back to All Batches/i)).toBeInTheDocument();
    expect(screen.getByText(/Showing all 2 students/i)).toBeInTheDocument();
  });

  it('triggers search handler when typing in search input', () => {
    const setSearch = vi.fn();
    renderWithProviders(
      <StudentsView
        students={mockStudents}
        batches={mockBatches}
        programs={mockPrograms}
        centers={mockCenters}
        selectedBatch="1"
        setSelectedBatch={vi.fn()}
        search=""
        setSearch={setSearch}
        defaultViewMode="drilldown"
      />
    );

    const searchInput = screen.getByPlaceholderText(/search/i);
    fireEvent.change(searchInput, { target: { value: 'Ravi' } });
    expect(setSearch).toHaveBeenCalledWith('Ravi');
  });

  it('triggers onViewProfile when clicking student name', () => {
    const onViewProfile = vi.fn();
    renderWithProviders(
      <StudentsView
        students={mockStudents}
        batches={mockBatches}
        programs={mockPrograms}
        centers={mockCenters}
        selectedBatch="1"
        setSelectedBatch={vi.fn()}
        onViewProfile={onViewProfile}
        defaultViewMode="drilldown"
      />
    );

    // Click first student name
    const studentNames = screen.getAllByText('Ravi Teja');
    fireEvent.click(studentNames[0]);
    expect(onViewProfile).toHaveBeenCalledWith(mockStudents[0]);
  });

  it('navigates back to batches when clicking Back to All Batches', () => {
    const setSelectedBatch = vi.fn();
    renderWithProviders(
      <StudentsView
        students={mockStudents}
        batches={mockBatches}
        programs={mockPrograms}
        centers={mockCenters}
        selectedBatch="1"
        setSelectedBatch={setSelectedBatch}
        defaultViewMode="drilldown"
      />
    );

    const backBtn = screen.getByText(/Back to All Batches/i);
    fireEvent.click(backBtn);
    expect(setSelectedBatch).toHaveBeenCalledWith('all');
  });
});
