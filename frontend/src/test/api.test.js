import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { api } from '../services/api';

describe('Frontend API Service Client', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('getKPIs formats query params and returns data', async () => {
    const mockData = { total_students: 45, total_expected: '100000.00' };
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const result = await api.getKPIs({ program: '1', batch: '2' });
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/kpis/?program=1&batch=2'));
    expect(result).toEqual(mockData);
  });

  it('getBatches fetches batches endpoint', async () => {
    const mockBatches = [{ id: 1, batch_name: '26A' }];
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockBatches,
    });

    const result = await api.getBatches();
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/batches/'));
    expect(result).toEqual(mockBatches);
  });

  it('getStudents passes search and filter parameters', async () => {
    const mockStudents = [{ id: 1, name: 'Ravi Kumar' }];
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockStudents,
    });

    const result = await api.getStudents({ search: 'Ravi', fee_status: 'PARTIAL' });
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('search=Ravi'));
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('fee_status=PARTIAL'));
    expect(result).toEqual(mockStudents);
  });

  it('recordPayment sends POST request with FormData', async () => {
    const mockResponse = { success: true, payment: { id: 10, amount: '5000.00' } };
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const formData = new FormData();
    formData.append('amount', '5000');
    formData.append('year_index', '1');

    const result = await api.recordPayment(123, formData);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/students/123/record_payment/'),
      expect.objectContaining({
        method: 'POST',
        body: formData,
      })
    );
    expect(result).toEqual(mockResponse);
  });

  it('recordPayment throws descriptive error when backend responds with error', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Amount exceeds outstanding balance' }),
    });

    const formData = new FormData();
    await expect(api.recordPayment(123, formData)).rejects.toThrow('Amount exceeds outstanding balance');
  });

  it('updateLineItem sends PATCH request to /api/line-items/<id>/', async () => {
    const updatedItem = { id: 5, title: 'Updated Lab Fee', amount: '2500.00' };
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => updatedItem,
    });

    const result = await api.updateLineItem(5, { title: 'Updated Lab Fee', amount: '2500.00' });
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/line-items/5/'),
      expect.objectContaining({
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Updated Lab Fee', amount: '2500.00' }),
      })
    );
    expect(result).toEqual(updatedItem);
  });

  it('deleteLineItem sends DELETE request to /api/line-items/<id>/', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    const result = await api.deleteLineItem(5);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/line-items/5/'),
      expect.objectContaining({ method: 'DELETE' })
    );
    expect(result).toEqual({ success: true });
  });

  it('updateYearFee sends PATCH to update base fee or concessions', async () => {
    const updatedYear = { id: 186, discount_amount: '2000.00', remarks: 'Merit Concession' };
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => updatedYear,
    });

    const result = await api.updateYearFee(186, { discount_amount: '2000.00', remarks: 'Merit Concession' });
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/year-fees/186/'),
      expect.objectContaining({
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ discount_amount: '2000.00', remarks: 'Merit Concession' }),
      })
    );
    expect(result).toEqual(updatedYear);
  });

  it('getWhatsAppLink returns direct wa.me link', async () => {
    const mockData = { whatsapp_url: 'https://wa.me/919876543210?text=Hello' };
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const result = await api.getWhatsAppLink(42);
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/students/42/whatsapp_link/'));
    expect(result).toEqual(mockData);
  });
});
