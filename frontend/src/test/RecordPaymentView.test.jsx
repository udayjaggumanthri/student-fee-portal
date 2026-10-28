import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from './test-utils';
import RecordPaymentView from '../components/views/RecordPaymentView';

describe('RecordPaymentView Component', () => {
  const mockStudent = {
    id: 101,
    student_id: '26A106BA058',
    name: 'Bathina Sivaprasad',
    group: 'B.A',
    batch_name: '26A',
    total_fee_amount: '27400.00',
    total_paid_amount: '10000.00',
    total_balance_due: '17400.00',
    year_fees: [
      {
        id: 1,
        year_index: 1,
        base_annual_fee: '25000.00',
        total_billed: '27400.00',
        total_paid: '10000.00',
        balance_due: '17400.00',
        line_items: [],
        payments: [],
      },
    ],
  };

  it('renders student header details and balance banner', () => {
    renderWithProviders(
      <RecordPaymentView
        student={mockStudent}
        onBack={vi.fn()}
        onViewProfile={vi.fn()}
        onOpenWhatsApp={vi.fn()}
        onViewReceipt={vi.fn()}
        onSavePayment={vi.fn()}
      />
    );

    expect(screen.getAllByText(/Bathina Sivaprasad/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/26A106BA058/i)[0]).toBeInTheDocument();
  });

  it('submits payment form data when amount is valid', async () => {
    const onSavePayment = vi.fn().mockResolvedValue({ success: true });
    renderWithProviders(
      <RecordPaymentView
        student={mockStudent}
        onBack={vi.fn()}
        onViewProfile={vi.fn()}
        onOpenWhatsApp={vi.fn()}
        onViewReceipt={vi.fn()}
        onSavePayment={onSavePayment}
      />
    );

    const amountInput = screen.getByPlaceholderText(/enter amount/i);
    fireEvent.change(amountInput, { target: { value: '5000' } });

    const submitBtn = screen.getByRole('button', { name: /save & generate receipt/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(onSavePayment).toHaveBeenCalledTimes(1);
    });

    const [calledId, formData] = onSavePayment.mock.calls[0];
    expect(calledId).toBe(101);
    expect(formData.get('amount')).toBe('5000');
    expect(formData.get('payment_mode')).toBe('PHONEPE');
  });

  it('allows clicking quick full balance button to populate amount', () => {
    renderWithProviders(
      <RecordPaymentView
        student={mockStudent}
        onBack={vi.fn()}
        onViewProfile={vi.fn()}
        onOpenWhatsApp={vi.fn()}
        onViewReceipt={vi.fn()}
        onSavePayment={vi.fn()}
      />
    );

    const fullBalanceBtn = screen.getByText(/set full balance/i);
    fireEvent.click(fullBalanceBtn);

    const amountInput = screen.getByPlaceholderText(/enter amount/i);
    expect(amountInput.value).toBe('17400');
  });
});
