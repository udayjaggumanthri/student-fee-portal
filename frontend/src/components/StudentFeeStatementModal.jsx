import React from 'react';
import {
  X, Printer, Download, CheckCircle, ShieldCheck,
  GraduationCap, Calendar, Phone, Award, Building, FileText
} from 'lucide-react';
import { useBranding } from '../context/BrandingContext';

export default function StudentFeeStatementModal({ student, onClose }) {
  const { branding } = useBranding();
  if (!student) return null;

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (val) => {
    const num = Number(val || 0);
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(num);
  };

  const statementNo = `STMT-2026-${String(student.id).padStart(5, '0')}`;
  const today = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const totalFee = Number(student.total_fee_amount || 0);
  const totalPaid = Number(student.total_paid_amount || 0);
  const totalDue = Number(student.total_balance_due || 0);
  const collectionPct = totalFee > 0 ? Math.round((totalPaid / totalFee) * 100) : (totalPaid > 0 ? 100 : 0);

  // Collect all year fees (Year 1, Year 2, Year 3)
  const yearFees = (student.year_fees && student.year_fees.length > 0)
    ? [...student.year_fees].sort((a, b) => a.year_index - b.year_index)
    : [
        {
          id: 1,
          year_index: 1,
          base_annual_fee: student.total_fee_amount || 0,
          total_billed: student.total_fee_amount || 0,
          total_paid: student.total_paid_amount || 0,
          balance_due: student.total_balance_due || 0,
          line_items: [],
          payments: []
        }
      ];

  // Flatten all payment receipts across all years
  const allPayments = [];
  yearFees.forEach((yf) => {
    if (yf.payments && Array.isArray(yf.payments)) {
      yf.payments.forEach((p) => {
        allPayments.push({ ...p, year_index: yf.year_index });
      });
    }
  });

  return (
    <div className="modal-overlay statement-modal-active" onClick={onClose} style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.7)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '0.75rem',
      overflowY: 'auto'
    }}>
      <div
        className="modal-card statement-paper"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 880,
          maxHeight: '94vh',
          backgroundColor: '#FFFFFF',
          color: '#0F172A',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-xl)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Modal Top Control Toolbar (Hidden during print) */}
        <div className="no-print" style={{
          padding: '0.75rem 1.25rem',
          backgroundColor: 'var(--bg-subtle)',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={18} style={{ color: 'var(--primary-600)' }} />
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Official Student Fee Statement (1-Page PDF)
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Single-page formatted breakdown of student particulars and multi-year fee columns
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={handlePrint}
              className="btn btn-primary btn-sm"
              style={{ gap: '0.4rem', fontWeight: 700 }}
            >
              <Printer size={15} />
              <span>Print / Save as PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                padding: '0.35rem',
                borderRadius: 'var(--radius-sm)'
              }}
              title="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Official Statement Paper */}
        <div style={{
          padding: '1.75rem 2rem',
          overflowY: 'auto',
          flex: 1,
          fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
        }}>
          {/* Institution Header Banner */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            borderBottom: '2.5px solid #0F172A',
            paddingBottom: '1rem',
            marginBottom: '1.25rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: '8px',
                backgroundColor: branding?.primary_color || '#1E3A8A',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {branding?.logo_url ? (
                  <img src={branding.logo_url} alt="Logo" style={{ width: 34, height: 34, objectFit: 'contain' }} />
                ) : (
                  <GraduationCap size={28} />
                )}
              </div>
              <div>
                <h1 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.02em', margin: 0, textTransform: 'uppercase' }}>
                  {branding?.institution_name || 'NAVODAYA EDUCATIONAL ACADEMY'}
                </h1>
                <div style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 600, marginTop: '0.15rem' }}>
                  School, Intermediate & Higher Studies Degree Colleges • Registered Academic Center
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '0.1rem' }}>
                  Andhra Pradesh & Telangana • Official Student Fee & Multi-Year Ledger Record
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{
                display: 'inline-block',
                padding: '0.2rem 0.55rem',
                backgroundColor: '#EFF6FF',
                color: '#1D4ED8',
                border: '1px solid #BFDBFE',
                borderRadius: '4px',
                fontSize: '0.72rem',
                fontWeight: 800,
                letterSpacing: '0.04em'
              }}>
                FEE STATEMENT
              </span>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0F172A', marginTop: '0.35rem', fontFamily: 'monospace' }}>
                {statementNo}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                Date: <strong>{today}</strong>
              </div>
            </div>
          </div>

          {/* 2-COLUMN SECTION: Student Details (Left) + Multi-Year Fee Columns (Right) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.15fr 1.35fr',
            gap: '1.25rem',
            marginBottom: '1.25rem'
          }}>
            {/* Left Column: Student Core Particulars */}
            <div style={{
              backgroundColor: '#F8FAFC',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              padding: '1rem'
            }}>
              <div style={{
                fontSize: '0.78rem',
                fontWeight: 800,
                color: '#1E3A8A',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                marginBottom: '0.65rem',
                borderBottom: '1px solid #E2E8F0',
                paddingBottom: '0.35rem'
              }}>
                Student Particulars
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.65rem 0.85rem', fontSize: '0.8rem' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 600 }}>STUDENT FULL NAME</div>
                  <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0F172A' }}>{student.name}</div>
                </div>

                <div>
                  <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 600 }}>ROLL ID / STUDENT ID</div>
                  <div style={{ fontWeight: 800, color: '#1D4ED8', fontFamily: 'monospace', fontSize: '0.82rem' }}>
                    {student.student_id || student.registration_no || `STD#${student.id}`}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 600 }}>EXAM HALL TICKET</div>
                  <div style={{ fontWeight: 800, color: '#047857', fontFamily: 'monospace', fontSize: '0.82rem' }}>
                    {student.hall_ticket_no || student.registration_no || 'Assigned in Cohort'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 600 }}>ACADEMIC BATCH</div>
                  <div style={{ fontWeight: 700, color: '#0F172A' }}>
                    {student.batch_name} ({student.academic_year || '2026-2027'})
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 600 }}>PROGRAM & COURSE</div>
                  <div style={{ fontWeight: 700, color: '#0F172A' }}>
                    {student.program_name || student.program_code}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 600 }}>SPECIALIZATION / GROUP</div>
                  <div style={{ fontWeight: 700, color: '#1E293B' }}>
                    {student.group || 'General'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 600 }}>STUDY CENTER</div>
                  <div style={{ fontWeight: 700, color: '#1E293B' }}>
                    {student.center_code ? `${student.center_code} ${student.center_name ? `(${student.center_name})` : ''}` : 'Main Campus'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 600 }}>CANDIDATE TYPE</div>
                  <div style={{ fontWeight: 700, color: student.candidate_type === 'WITH' ? '#047857' : '#1E3A8A' }}>
                    {student.candidate_type === 'WITH' ? 'WITH (Classes & Material)' : 'WITHOUT (Direct/Exam)'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 600 }}>PRIMARY CONTACT</div>
                  <div style={{ fontWeight: 700, color: '#0F172A' }}>
                    {student.primary_contact || 'N/A'}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Multi-Year Fee Columns & Breakdown */}
            <div style={{
              backgroundColor: '#F8FAFC',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.65rem',
                  borderBottom: '1px solid #E2E8F0',
                  paddingBottom: '0.35rem'
                }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#1E3A8A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Multi-Year Fee Structure
                  </div>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    padding: '0.12rem 0.5rem',
                    borderRadius: '4px',
                    backgroundColor: totalDue <= 0 ? '#ECFDF5' : totalPaid > 0 ? '#FFFBEB' : '#FEF2F2',
                    color: totalDue <= 0 ? '#065F46' : totalPaid > 0 ? '#92400E' : '#991B1B',
                    border: `1px solid ${totalDue <= 0 ? '#A7F3D0' : totalPaid > 0 ? '#FDE68A' : '#FECACA'}`
                  }}>
                    {totalDue <= 0 ? 'FEE COMPLETED' : totalPaid > 0 ? 'PARTIAL PAYMENT' : 'PENDING'}
                  </span>
                </div>

                {/* Multi-Year Fee Columns Table */}
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', marginBottom: '0.85rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#E2E8F0', color: '#334155', borderBottom: '1px solid #CBD5E1' }}>
                      <th style={{ padding: '0.45rem 0.55rem', textAlign: 'left', fontWeight: 700 }}>Academic Year</th>
                      <th style={{ padding: '0.45rem 0.55rem', textAlign: 'right', fontWeight: 700 }}>Billed (₹)</th>
                      <th style={{ padding: '0.45rem 0.55rem', textAlign: 'right', fontWeight: 700 }}>Paid (₹)</th>
                      <th style={{ padding: '0.45rem 0.55rem', textAlign: 'right', fontWeight: 700 }}>Balance (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {yearFees.map((yf) => (
                      <tr key={yf.id || yf.year_index} style={{ borderBottom: '1px solid #E2E8F0', backgroundColor: '#FFFFFF' }}>
                        <td style={{ padding: '0.45rem 0.55rem', fontWeight: 700, color: '#0F172A' }}>
                          Year {yf.year_index} {yf.year_index === 1 ? '(First Year)' : yf.year_index === 2 ? '(Second Year)' : '(Third Year)'}
                        </td>
                        <td style={{ padding: '0.45rem 0.55rem', textAlign: 'right', fontWeight: 600, color: '#334155' }}>
                          {formatCurrency(yf.total_billed)}
                        </td>
                        <td style={{ padding: '0.45rem 0.55rem', textAlign: 'right', fontWeight: 700, color: '#047857' }}>
                          {formatCurrency(yf.total_paid)}
                        </td>
                        <td style={{
                          padding: '0.45rem 0.55rem',
                          textAlign: 'right',
                          fontWeight: 800,
                          color: Number(yf.balance_due) > 0 ? '#E11D48' : '#047857'
                        }}>
                          {formatCurrency(yf.balance_due)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Cumulative Financial Summary Box */}
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '6px',
                border: '1.5px solid #CBD5E1',
                padding: '0.65rem 0.85rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#64748B', marginBottom: '0.2rem' }}>
                  <span>Total Assessed Course Fee:</span>
                  <span style={{ fontWeight: 700, color: '#0F172A' }}>{formatCurrency(totalFee)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#047857', marginBottom: '0.25rem' }}>
                  <span>Total Collected Amount:</span>
                  <span style={{ fontWeight: 800 }}>{formatCurrency(totalPaid)}</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.92rem',
                  fontWeight: 900,
                  borderTop: '1.5px solid #E2E8F0',
                  paddingTop: '0.35rem',
                  color: totalDue > 0 ? '#E11D48' : '#047857'
                }}>
                  <span>NET BALANCE DUE:</span>
                  <span>{formatCurrency(totalDue)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Receipts History Table */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{
              fontSize: '0.78rem',
              fontWeight: 800,
              color: '#1E3A8A',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: '0.45rem'
            }}>
              Payment Transactions & Receipts Recorded:
            </div>

            {allPayments.length === 0 ? (
              <div style={{
                padding: '0.75rem',
                textAlign: 'center',
                backgroundColor: '#F8FAFC',
                borderRadius: '6px',
                border: '1px dashed #CBD5E1',
                fontSize: '0.76rem',
                color: '#64748B'
              }}>
                No payments have been recorded for this student yet. Outstanding balance is {formatCurrency(totalDue)}.
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.76rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F1F5F9', borderBottom: '1.5px solid #CBD5E1', color: '#334155' }}>
                    <th style={{ padding: '0.4rem 0.5rem', textAlign: 'left', fontWeight: 700 }}>Receipt #</th>
                    <th style={{ padding: '0.4rem 0.5rem', textAlign: 'left', fontWeight: 700 }}>Payment Date</th>
                    <th style={{ padding: '0.4rem 0.5rem', textAlign: 'left', fontWeight: 700 }}>Target Year</th>
                    <th style={{ padding: '0.4rem 0.5rem', textAlign: 'left', fontWeight: 700 }}>Payment Mode</th>
                    <th style={{ padding: '0.4rem 0.5rem', textAlign: 'left', fontWeight: 700 }}>Transaction Ref / Notes</th>
                    <th style={{ padding: '0.4rem 0.5rem', textAlign: 'right', fontWeight: 700 }}>Amount Paid (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {allPayments.map((p) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                      <td style={{ padding: '0.4rem 0.5rem', fontFamily: 'monospace', fontWeight: 700, color: '#1D4ED8' }}>
                        REC#{String(p.id).padStart(4, '0')}
                      </td>
                      <td style={{ padding: '0.4rem 0.5rem', color: '#334155' }}>
                        {p.payment_date || today}
                      </td>
                      <td style={{ padding: '0.4rem 0.5rem', fontWeight: 600 }}>
                        Year {p.year_index || 1}
                      </td>
                      <td style={{ padding: '0.4rem 0.5rem' }}>
                        <span style={{
                          padding: '0.1rem 0.4rem',
                          borderRadius: '3px',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          backgroundColor: '#EFF6FF',
                          color: '#1D4ED8',
                          border: '1px solid #BFDBFE'
                        }}>
                          {p.payment_mode || 'Cash/UPI'}
                        </span>
                      </td>
                      <td style={{ padding: '0.4rem 0.5rem', color: '#64748B', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.transaction_reference || p.remarks || 'Standard installment payment'}
                      </td>
                      <td style={{ padding: '0.4rem 0.5rem', textAlign: 'right', fontWeight: 800, color: '#047857' }}>
                        {formatCurrency(p.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Official Verification & Authorized Signature Seal */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            borderTop: '1px dashed #94A3B8',
            paddingTop: '1rem',
            marginTop: '0.5rem',
            fontSize: '0.74rem',
            color: '#64748B'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', maxWidth: '60%' }}>
              <ShieldCheck size={20} style={{ color: '#059669', flexShrink: 0 }} />
              <span>
                Computer-generated official statement from <strong>Navodaya Educational Academy</strong>. Verified academic record valid for admission, exam hall tickets, and fee clearance.
              </span>
            </div>

            <div style={{ textAlign: 'center', minWidth: 160 }}>
              <div style={{ height: 28 }} />
              <div style={{ borderTop: '1.5px solid #0F172A', paddingTop: '0.2rem', fontWeight: 800, color: '#0F172A', fontSize: '0.76rem' }}>
                Accounts Officer / Principal
              </div>
              <div style={{ fontSize: '0.68rem', color: '#64748B' }}>
                Navodaya Educational Academy
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
