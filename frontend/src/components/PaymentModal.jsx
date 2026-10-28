import React, { useState } from 'react';
import { X, CreditCard, Calendar, Upload, AlertCircle, Check } from 'lucide-react';

export default function PaymentModal({ student, onClose, onSuccess }) {
  const [amount, setAmount] = useState('');
  const [yearIndex, setYearIndex] = useState(1);
  const [paymentMode, setPaymentMode] = useState('PHONEPE');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [transactionRef, setTransactionRef] = useState('');
  const [notes, setNotes] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!student) return null;

  const due = Number(student.total_balance_due || 0);

  const handleScreenshotChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setScreenshot(file);
      setScreenshotPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      setError('Please enter a valid payment amount.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('amount', amount);
      formData.append('year_index', yearIndex);
      formData.append('payment_mode', paymentMode);
      if (paymentDate) formData.append('payment_date', paymentDate);
      if (transactionRef) formData.append('transaction_ref', transactionRef);
      if (notes) formData.append('notes', notes);
      if (screenshot) formData.append('screenshot', screenshot);

      await onSuccess(student.id, formData);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Record Fee Payment</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {student.name} • {student.group || student.program_name} ({student.batch_name})
            </p>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-icon" style={{ border: 'none' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div style={{
                padding: '0.65rem 0.85rem',
                backgroundColor: 'var(--rose-50)',
                color: 'var(--rose-text)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.82rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem'
              }}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Current Balance Banner */}
            <div style={{
              padding: '0.85rem 1rem',
              backgroundColor: 'var(--primary-50)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--primary-100)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.25rem'
            }}>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--primary-700)', fontWeight: 600 }}>
                  Current Outstanding Due:
                </span>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary-700)' }}>
                  ₹{due.toLocaleString('en-IN')}
                </div>
              </div>
              {due > 0 && (
                <button
                  type="button"
                  onClick={() => setAmount(String(due))}
                  className="btn btn-primary btn-sm"
                  style={{ fontSize: '0.75rem' }}
                >
                  Pay Full Balance
                </button>
              )}
            </div>

            {/* Academic Year Selection (for 3-year or 2-year programs) */}
            {student.duration_years > 1 && (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Academic Year:
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {Array.from({ length: student.duration_years }, (_, i) => i + 1).map((yr) => (
                    <button
                      key={yr}
                      type="button"
                      onClick={() => setYearIndex(yr)}
                      style={{
                        flex: 1,
                        padding: '0.5rem',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        border: yearIndex === yr ? '1.5px solid var(--primary-600)' : '1px solid var(--border-light)',
                        backgroundColor: yearIndex === yr ? 'var(--primary-50)' : 'var(--bg-surface)',
                        color: yearIndex === yr ? 'var(--primary-700)' : 'var(--text-secondary)',
                        cursor: 'pointer'
                      }}
                    >
                      Year {yr}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Amount Input & Quick Chips */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Payment Amount (₹) *
              </label>
              <input
                type="number"
                placeholder="Enter amount paid"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--border-light)',
                  fontSize: '1.15rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  outline: 'none'
                }}
              />
              <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                {[2000, 5000, 10000, 15000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAmount(String(amt))}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.72rem', padding: '0.2rem 0.55rem' }}
                  >
                    + ₹{amt.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Mode */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Payment Mode:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                {[
                  { id: 'PHONEPE', label: 'PhonePe' },
                  { id: 'GPAY', label: 'Google Pay' },
                  { id: 'CASH', label: 'Cash' },
                  { id: 'UPI', label: 'Other UPI' },
                  { id: 'NETBANKING', label: 'Net Banking' },
                  { id: 'CHEQUE', label: 'Cheque' }
                ].map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setPaymentMode(mode.id)}
                    style={{
                      padding: '0.5rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      border: paymentMode === mode.id ? '1.5px solid var(--primary-600)' : '1px solid var(--border-light)',
                      backgroundColor: paymentMode === mode.id ? 'var(--primary-50)' : 'var(--bg-surface)',
                      color: paymentMode === mode.id ? 'var(--primary-700)' : 'var(--text-secondary)',
                      cursor: 'pointer'
                    }}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Date (Optional, defaults to today) */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Payment Date (Optional, defaults to today):
              </label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-light)',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              />
            </div>

            {/* Transaction Ref / UTR */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Transaction Ref / UPI UTR (Optional):
              </label>
              <input
                type="text"
                placeholder="e.g. 423189230192"
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-light)',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              />
            </div>

            {/* Payment Screenshot (Optional upload) */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Payment Screenshot / Receipt Proof (Optional):
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleScreenshotChange}
                style={{ fontSize: '0.82rem' }}
              />
              {screenshotPreview && (
                <div style={{ marginTop: '0.5rem' }}>
                  <img
                    src={screenshotPreview}
                    alt="Preview"
                    style={{ maxHeight: 100, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}
                  />
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Notes / Remarks (Optional):
              </label>
              <input
                type="text"
                placeholder="e.g. Paid by father via PhonePe"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-light)',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              <Check size={16} />
              <span>{loading ? 'Recording...' : 'Save & Update Balance'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
