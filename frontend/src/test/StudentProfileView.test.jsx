import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from './test-utils';
import StudentProfileView from '../components/views/StudentProfileView';

describe('StudentProfileView & PDF Fee Statement', () => {
  const mockStudent = {
    id: 42,
    name: 'K. Rajesh Kumar',
    student_id: '26A106BA058',
    hall_ticket_no: '26A106BA058',
    registration_no: '26A106BA058',
    batch_name: '26A DEG',
    program_name: 'Degree (3-Year Program)',
    program_code: 'DEGREE',
    group: 'B.Com',
    center_code: '106-JK',
    center_name: 'Jaggampeta Campus',
    candidate_type: 'WITHOUT',
    primary_contact: '9848011223',
    total_fee_amount: '36000.00',
    total_paid_amount: '15000.00',
    total_balance_due: '21000.00',
    fee_status: 'PARTIAL',
    created_at: '2026-08-10T10:00:00Z',
    year_fees: [
      {
        id: 101,
        year_index: 1,
        base_annual_fee: '12000.00',
        total_billed: '12000.00',
        total_paid: '12000.00',
        balance_due: '0.00',
        payments: [
          {
            id: 501,
            amount: '12000.00',
            payment_date: '2026-08-15',
            payment_mode: 'PhonePe',
            transaction_reference: 'UPI/987654'
          }
        ]
      },
      {
        id: 102,
        year_index: 2,
        base_annual_fee: '12000.00',
        total_billed: '12000.00',
        total_paid: '3000.00',
        balance_due: '9000.00',
        payments: [
          {
            id: 502,
            amount: '3000.00',
            payment_date: '2026-10-01',
            payment_mode: 'Cash',
            transaction_reference: 'Receipt#042'
          }
        ]
      },
      {
        id: 103,
        year_index: 3,
        base_annual_fee: '12000.00',
        total_billed: '12000.00',
        total_paid: '0.00',
        balance_due: '12000.00',
        payments: []
      }
    ]
  };

  it('renders student header details and Download PDF action button', () => {
    renderWithProviders(
      <StudentProfileView student={mockStudent} onBack={vi.fn()} />
    );

    expect(screen.getByRole('heading', { level: 2, name: 'K. Rajesh Kumar' })).toBeInTheDocument();
    expect(screen.getAllByText(/26A106BA058/i)[0]).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /download pdf/i })).toBeInTheDocument();
  });

  it('opens 1-page PDF fee statement modal when clicking Download PDF', () => {
    // Mock window.print
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});

    renderWithProviders(
      <StudentProfileView student={mockStudent} onBack={vi.fn()} />
    );

    const downloadBtn = screen.getByRole('button', { name: /download pdf/i });
    fireEvent.click(downloadBtn);

    // Modal title & Institution branding
    expect(screen.getByText(/Official Student Fee Statement \(1-Page PDF\)/i)).toBeInTheDocument();
    expect(screen.getAllByText(/NAVODAYA EDUCATIONAL ACADEMY/i)[0]).toBeInTheDocument();

    // Student Details (Left side)
    expect(screen.getByText('STUDENT FULL NAME')).toBeInTheDocument();
    expect(screen.getByText('EXAM HALL TICKET')).toBeInTheDocument();
    expect(screen.getByText('106-JK (Jaggampeta Campus)')).toBeInTheDocument();

    // Multi-Year Fee Matrix (Right side)
    expect(screen.getByText(/Multi-Year Fee Structure/i)).toBeInTheDocument();
    expect(screen.getByText(/Year 1 \(First Year\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Year 2 \(Second Year\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Year 3 \(Third Year\)/i)).toBeInTheDocument();
    expect(screen.getByText(/NET BALANCE DUE:/i)).toBeInTheDocument();

    // Payment receipts history
    expect(screen.getByText(/REC#0501/i)).toBeInTheDocument();
    expect(screen.getByText(/REC#0502/i)).toBeInTheDocument();

    // Print button triggers window.print
    const printBtn = screen.getByRole('button', { name: /print \/ save as pdf/i });
    fireEvent.click(printBtn);
    expect(printSpy).toHaveBeenCalled();

    printSpy.mockRestore();
  });
});
