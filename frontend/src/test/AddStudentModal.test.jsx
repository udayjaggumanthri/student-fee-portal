import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from './test-utils';
import AddStudentModal from '../components/AddStudentModal';
import { api } from '../services/api';

vi.mock('../services/api', () => ({
  api: {
    getCenters: vi.fn().mockResolvedValue([
      { id: 1, code: '106-JK', name: 'Jaggampeta Campus' }
    ]),
    getReferences: vi.fn().mockResolvedValue([]),
    createStudent: vi.fn().mockResolvedValue({ id: 99, student_id: '26A106BA001' })
  }
}));

describe('AddStudentModal Component', () => {
  const mockBatches = [
    {
      id: 6,
      batch_name: '26A DEG',
      program_code: 'DEGREE',
      program_name: 'Bachelor of Arts / Commerce',
      academic_year: '2026-2027',
      default_base_fee: 17900
    },
    {
      id: 7,
      batch_name: '26A INTER',
      program_code: 'INTER',
      program_name: 'Intermediate General',
      academic_year: '2026-2027',
      default_base_fee: 12000
    }
  ];

  const mockPrograms = [
    { id: 1, code: 'DEGREE', name: 'Degree' },
    { id: 2, code: 'INTER', name: 'Intermediate' }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders locked batch indicator when initialBatchId is passed', async () => {
    renderWithProviders(
      <AddStudentModal
        batches={mockBatches}
        programs={mockPrograms}
        initialBatchId="6"
        onClose={vi.fn()}
        onStudentCreated={vi.fn()}
      />
    );

    // Should display locked batch info for 26A DEG
    expect(await screen.findByText(/26A DEG — Bachelor of Arts \/ Commerce/i)).toBeInTheDocument();
    expect(screen.getByText('Change')).toBeInTheDocument();
  });

  it('provides quick course suggestions tailored to the active batch program', async () => {
    renderWithProviders(
      <AddStudentModal
        batches={mockBatches}
        programs={mockPrograms}
        initialBatchId="6"
        onClose={vi.fn()}
        onStudentCreated={vi.fn()}
      />
    );

    // Degree suggestions: B.A, B.Com, B.Sc (Comp), BBA
    const baChip = await screen.findByText('B.A');
    expect(baChip).toBeInTheDocument();
    expect(screen.getByText('B.Com')).toBeInTheDocument();

    // Click B.A suggestion
    fireEvent.click(baChip);

    // The group input should now be filled with 'B.A'
    const groupInput = screen.getByPlaceholderText(/e\.g\. B\.A, B\.Com/i);
    expect(groupInput.value).toBe('B.A');
  });

  it('allows unlocking batch to select another batch', async () => {
    renderWithProviders(
      <AddStudentModal
        batches={mockBatches}
        programs={mockPrograms}
        initialBatchId="6"
        onClose={vi.fn()}
        onStudentCreated={vi.fn()}
      />
    );

    const changeBtn = await screen.findByText('Change');
    fireEvent.click(changeBtn);

    // Dropdown should now appear with both batches
    expect(screen.getByText('Select Batch...')).toBeInTheDocument();
    expect(screen.getByText(/26A INTER — Intermediate General/i)).toBeInTheDocument();
  });
});
