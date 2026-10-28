import React from 'react';
import { X, Printer, Download, CheckCircle, ShieldCheck } from 'lucide-react';

export default function ReceiptModal({ student, onClose }) {
  if (!student) return null;

  const handlePrint = () => {
    window.print();
  };

  const receiptNo = `REC-2026-${String(student.id).padStart(5, '0')}`;
  const today = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card printable-receipt" style={{ maxWidth: 640 }} onClick={(e) => e.stopPropagation()}>
        {/* Modal Controls (Hidden in print) */}
        <div className="modal-header no-print">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Printer size={18} style={{ color: 'var(--primary-600)' }} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Fee Statement & Receipt</h3>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-icon" style={{ border: 'none' }}>
            <X size={18} />
          </button>
        </div>

        {/* Printable Receipt Paper */}
        <div style={{
          padding: '2rem',
          backgroundColor: '#FFFFFF',
          color: '#0F172A'
        }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            borderBottom: '2px solid #E2E8F0',
            paddingBottom: '1.25rem',
            marginBottom: '1.5rem'
          }}>
            <div>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#1E293B', letterSpacing: '-0.02em' }}>
                NAVODAYA EDUCATIONAL ACADEMY
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.2rem' }}>
                School, Intermediate & Higher Studies Degree Colleges • Recognized Center
              </p>
              <p style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                Andhra Pradesh / Telangana • Helpline: +91 98765 43210
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{
                display: 'inline-block',
                padding: '0.25rem 0.65rem',
                backgroundColor: '#ECFDF5',
                color: '#065F46',
                border: '1px solid #A7F3D0',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: 700
              }}>
                OFFICIAL RECEIPT
              </span>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1E293B', marginTop: '0.4rem' }}>
                {receiptNo}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                Date: {today}
              </div>
            </div>
          </div>

          {/* Student & Course Details Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '1rem',
            backgroundColor: '#F8FAFC',
            padding: '1rem',
            borderRadius: '8px',
            border: '1px solid #E2E8F0',
            marginBottom: '1.5rem'
          }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Student Name:</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A' }}>{student.name}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Course & Group:</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A' }}>
                {student.group || student.program_name} ({student.candidate_type})
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Roll / Student ID:</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1E3A8A' }}>
                {student.student_id || student.registration_no || `STD#${student.id}`}
              </div>
              {student.registration_no && (
                <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                  Univ / SDE: {student.registration_no}
                </div>
              )}
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Batch & Center:</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                {student.batch_name} • {student.center_code || 'Main Office'}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                Phone: {student.primary_contact || 'N/A'} {student.admission_no ? `• Adm: ${student.admission_no}` : ''}
              </div>
            </div>
          </div>

          {/* Fee & Payment Ledger Table */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: '#334155' }}>
              Payment Breakdown:
            </h4>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#F1F5F9', borderBottom: '2px solid #CBD5E1' }}>
                  <th style={{ textAlign: 'left', padding: '0.6rem 0.75rem' }}>Particulars / Year</th>
                  <th style={{ textAlign: 'center', padding: '0.6rem' }}>Mode</th>
                  <th style={{ textAlign: 'right', padding: '0.6rem' }}>Billed (₹)</th>
                  <th style={{ textAlign: 'right', padding: '0.6rem 0.75rem' }}>Paid (₹)</th>
                </tr>
              </thead>
              <tbody>
                {student.year_fees && student.year_fees.map((yf) => (
                  <tr key={yf.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                    <td style={{ padding: '0.6rem 0.75rem' }}>
                      Year {yf.year_index} Course Tuition & Examination
                    </td>
                    <td style={{ textAlign: 'center', padding: '0.6rem', color: '#64748B' }}>
                      {yf.payments && yf.payments.length > 0 ? yf.payments[0].payment_mode : 'Bank/Cash'}
                    </td>
                    <td style={{ textAlign: 'right', padding: '0.6rem' }}>
                      ₹{Number(yf.total_billed).toLocaleString('en-IN')}
                    </td>
                    <td style={{ textAlign: 'right', padding: '0.6rem 0.75rem', fontWeight: 600, color: '#047857' }}>
                      ₹{Number(yf.total_paid).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary Financial Totals */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginBottom: '2rem'
          }}>
            <div style={{ width: '280px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', fontSize: '0.85rem', color: '#64748B' }}>
                <span>Total Fee Billed:</span>
                <span style={{ fontWeight: 600, color: '#0F172A' }}>₹{Number(student.total_fee_amount).toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', fontSize: '0.9rem', color: '#047857', borderBottom: '1px solid #E2E8F0' }}>
                <span>Total Amount Paid:</span>
                <span style={{ fontWeight: 700 }}>₹{Number(student.total_paid_amount).toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', fontSize: '1.05rem', fontWeight: 800 }}>
                <span style={{ color: Number(student.total_balance_due) > 0 ? '#E11D48' : '#047857' }}>
                  Remaining Balance:
                </span>
                <span style={{ color: Number(student.total_balance_due) > 0 ? '#E11D48' : '#047857' }}>
                  ₹{Number(student.total_balance_due).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Authorized Seal */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            borderTop: '1px dashed #CBD5E1',
            paddingTop: '1.5rem',
            fontSize: '0.78rem',
            color: '#64748B'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldCheck size={20} style={{ color: '#059669' }} />
              <span>Computer-generated official statement. Valid without signature.</span>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ height: 35 }}></div>
              <div style={{ borderTop: '1px solid #94A3B8', paddingTop: '0.25rem', fontWeight: 700, color: '#1E293B' }}>
                Accounts Officer / Principal
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions (Hidden in print) */}
        <div className="modal-footer no-print">
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Close
          </button>
          <button type="button" onClick={handlePrint} className="btn btn-primary">
            <Printer size={16} />
            <span>Print Receipt</span>
          </button>
        </div>
      </div>
    </div>
  );
}
