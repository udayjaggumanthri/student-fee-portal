import React, { useState } from 'react';
import { X, Plus, AlertCircle, Check } from 'lucide-react';

export default function AddLineItemModal({ student, onClose, onSuccess }) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [yearIndex, setYearIndex] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!student) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a title for the fee line item.');
      return;
    }
    if (!amount || Number(amount) <= 0) {
      setError('Please provide a valid fee amount.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onSuccess(student.id, {
        title: title.trim(),
        amount: amount,
        year_index: yearIndex
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to add line item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Add Special Fee Line Item</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {student.name} • {student.batch_name}
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

            {student.duration_years > 1 && (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Assign to Academic Year:
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {Array.from({ length: student.duration_years }, (_, i) => i + 1).map((yr) => (
                    <button
                      key={yr}
                      type="button"
                      onClick={() => setYearIndex(yr)}
                      style={{
                        flex: 1,
                        padding: '0.45rem',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.8rem',
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

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Fee Item Title:
              </label>
              <input
                type="text"
                placeholder="e.g. University Exam Fee, Late Fine, Center Fee"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.6rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-light)',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
              <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                {['University Exam Fee', 'Special Coaching', 'Assignment Charge', 'Late Fine'].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setTitle(preset)}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem' }}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Amount (₹):
              </label>
              <input
                type="number"
                placeholder="e.g. 1500"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.6rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-light)',
                  fontSize: '1rem',
                  fontWeight: 700,
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
              <Plus size={16} />
              <span>{loading ? 'Adding...' : 'Add Fee Item'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
