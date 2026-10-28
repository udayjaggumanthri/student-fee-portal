import React, { useState } from 'react';
import {
  CreditCard, Search, Filter, MessageSquare, Phone,
  CheckCircle2, AlertCircle, ArrowRight, UserCheck, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function FeeCollectionHub({
  students,
  batches,
  programs,
  onCollectPaymentForStudent,
  onOpenWhatsApp,
  onViewProfile
}) {
  const { isCaller } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('all');
  const [onlyPendingDues, setOnlyPendingDues] = useState(true);

  const formatCurrency = (val) => {
    if (val === null || val === undefined) return '••••••';
    const num = Number(val || 0);
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(num);
  };

  // Filter students
  const filteredStudents = students.filter((s) => {
    if (onlyPendingDues && Number(s.total_balance_due || 0) <= 0) return false;
    if (selectedBatch !== 'all' && String(s.batch) !== String(selectedBatch)) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      const matchName = s.name.toLowerCase().includes(q);
      const matchId = (s.student_id || '').toLowerCase().includes(q);
      const matchReg = (s.registration_no || '').toLowerCase().includes(q);
      const matchPhone = (s.primary_contact || '').includes(q);
      if (!matchName && !matchId && !matchReg && !matchPhone) return false;
    }
    return true;
  });

  const totalDues = filteredStudents.reduce((acc, s) => acc + Number(s.total_balance_due || 0), 0);
  const totalStudentsWithDues = filteredStudents.filter((s) => Number(s.total_balance_due || 0) > 0).length;

  return (
    <div>
      {/* Top Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Fee Collection Counter
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Find a student by Roll Number (26A...), Name, or Phone to record fee installments.
          </p>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem',
          backgroundColor: 'var(--bg-surface)',
          padding: '0.55rem 1.15rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-light)'
        }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Students with Balance
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {totalStudentsWithDues}
            </div>
          </div>
          <div style={{ width: 1, height: 28, backgroundColor: 'var(--border-light)' }} />
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--rose-text)', textTransform: 'uppercase', fontWeight: 700 }}>
              Total Outstanding Due
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--rose-text)' }}>
              {formatCurrency(totalDues)}
            </div>
          </div>
        </div>
      </div>

      {/* Instant Search and Cohort Filter Bar */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-light)',
        padding: '1rem 1.25rem',
        marginBottom: '1.5rem',
        boxShadow: 'var(--shadow-xs)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {/* Main Search Input */}
          <div style={{ position: 'relative', flex: '1 1 300px' }}>
            <Search size={16} style={{
              position: 'absolute',
              left: '0.85rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)'
            }} />
            <input
              type="text"
              placeholder="Search by student name, Roll ID (e.g. 26A106...), SDE, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem 0.65rem 2.35rem',
                borderRadius: 'var(--radius-sm)',
                border: '1.5px solid var(--primary-600)',
                backgroundColor: 'var(--bg-surface)',
                fontSize: '0.9rem',
                color: 'var(--text-primary)',
                outline: 'none'
              }}
            />
          </div>

          {/* Batch Selector */}
          <div style={{ minWidth: 180 }}>
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-light)',
                backgroundColor: 'var(--bg-subtle)',
                fontSize: '0.85rem',
                color: 'var(--text-primary)',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="all">All Batches</option>
              {batches.map((b) => (
                <option key={b.id} value={String(b.id)}>{b.batch_name} ({b.academic_year})</option>
              ))}
            </select>
          </div>

          {/* Only Pending Dues Toggle */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            <input
              type="checkbox"
              checked={onlyPendingDues}
              onChange={(e) => setOnlyPendingDues(e.target.checked)}
              style={{ cursor: 'pointer', accentColor: 'var(--primary-600)' }}
            />
            <span>Show Only Students with Balance Due</span>
          </label>
        </div>
      </div>

      {/* Desktop & Tablet Table View */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-light)',
        boxShadow: 'var(--shadow-xs)',
        overflow: 'hidden',
        marginBottom: '1rem'
      }} className="hide-mobile">
        {filteredStudents.length === 0 ? (
          <div style={{ padding: '3.5rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <AlertCircle size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              No students found
            </h4>
            <p style={{ fontSize: '0.82rem' }}>
              Try adjusting your search query or uncheck "Show Only Students with Balance Due".
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table style={{ width: '100%', minWidth: 760, borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{
                  backgroundColor: 'var(--bg-subtle)',
                  borderBottom: '1px solid var(--border-light)',
                  color: 'var(--text-secondary)',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  textTransform: 'uppercase'
                }}>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Roll / Student ID</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Student Name</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Cohort & Course</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Total Fee (₹)</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Paid (₹)</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Balance Due (₹)</th>
                  <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((s) => {
                  const due = Number(s.total_balance_due || 0);

                  return (
                    <tr
                      key={s.id}
                      style={{ borderBottom: '1px solid var(--border-light)', transition: 'var(--transition)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-subtle)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      <td style={{ padding: '0.85rem 1.25rem', fontWeight: 700, color: '#1E3A8A' }}>
                        {s.student_id || s.registration_no || `STD#${s.id}`}
                      </td>

                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div
                          onClick={() => onViewProfile(s)}
                          style={{ fontWeight: 700, color: 'var(--text-primary)', cursor: 'pointer' }}
                        >
                          {s.name}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          Phone: {s.primary_contact || 'None'} {s.center_code ? `• Center: ${s.center_code}` : ''}
                        </div>
                      </td>

                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {s.group || s.program_name}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          Batch: <strong>{s.batch_name}</strong>
                        </div>
                      </td>

                      <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        {isCaller ? '••••••' : formatCurrency(s.total_fee_amount)}
                      </td>

                      <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: 'var(--emerald-text)' }}>
                        {formatCurrency(s.total_paid_amount)}
                      </td>

                      <td style={{ padding: '0.85rem 1rem', fontWeight: 800, color: due > 0 ? 'var(--rose-text)' : 'var(--emerald-text)', fontSize: '0.95rem' }}>
                        {formatCurrency(due)}
                      </td>

                      <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.45rem' }}>
                          <button
                            onClick={() => onCollectPaymentForStudent(s)}
                            className="btn btn-primary btn-sm"
                            style={{ gap: '0.35rem', padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                          >
                            <CreditCard size={14} />
                            <span>Collect</span>
                          </button>

                          <button
                            onClick={() => onOpenWhatsApp(s)}
                            title="WhatsApp Reminder"
                            className="btn btn-whatsapp btn-sm"
                            style={{ padding: '0.35rem 0.55rem' }}
                          >
                            <MessageSquare size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Enterprise Mobile Student Cards for Fee Counter */}
      <div style={{ flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }} className="show-mobile-flex">
        {filteredStudents.length === 0 ? (
          <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
            No students found matching your search.
          </div>
        ) : (
          filteredStudents.map((s) => {
            const due = Number(s.total_balance_due || 0);

            return (
              <div
                key={s.id}
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-light)',
                  padding: '1rem',
                  boxShadow: 'var(--shadow-xs)'
                }}
              >
                {/* Top Row: Roll ID, Name, Center */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                      <span style={{
                        fontWeight: 800,
                        fontSize: '0.78rem',
                        color: '#1E3A8A',
                        backgroundColor: '#EFF6FF',
                        padding: '0.15rem 0.45rem',
                        borderRadius: 'var(--radius-xs)',
                        border: '1px solid #BFDBFE'
                      }}>
                        {s.student_id || s.registration_no || `STD#${s.id}`}
                      </span>
                      {s.center_code && (
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          • Center {s.center_code}
                        </span>
                      )}
                    </div>
                    <div
                      onClick={() => onViewProfile(s)}
                      style={{ fontWeight: 800, fontSize: '0.94rem', color: 'var(--text-primary)', cursor: 'pointer' }}
                    >
                      {s.name}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.66rem', color: 'var(--rose-text)', textTransform: 'uppercase', fontWeight: 700 }}>
                      Balance Due
                    </div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: due > 0 ? 'var(--rose-text)' : 'var(--emerald-text)' }}>
                      {formatCurrency(due)}
                    </div>
                  </div>
                </div>

                {/* Subrow: Course & Cohort */}
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                  {s.group || s.program_name} • Batch: <strong>{s.batch_name}</strong>
                  {s.primary_contact && <span> • 📞 {s.primary_contact}</span>}
                </div>

                {/* Financial 2-column breakdown bar */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '0.5rem',
                  backgroundColor: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.5rem 0.65rem',
                  marginBottom: '0.75rem',
                  textAlign: 'center',
                  fontSize: '0.75rem'
                }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem', display: 'block' }}>Total Fee</span>
                    <strong style={{ color: 'var(--text-secondary)' }}>{isCaller ? '••••••' : formatCurrency(s.total_fee_amount)}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--emerald-text)', fontSize: '0.68rem', display: 'block' }}>Paid Amount</span>
                    <strong style={{ color: 'var(--emerald-text)' }}>{formatCurrency(s.total_paid_amount)}</strong>
                  </div>
                </div>

                {/* Action buttons */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.5rem',
                  borderTop: '1px solid var(--border-light)',
                  paddingTop: '0.65rem'
                }}>
                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    <button
                      onClick={() => onViewProfile(s)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '0.35rem 0.6rem', fontSize: '0.74rem' }}
                    >
                      View
                    </button>
                    <button
                      onClick={() => onOpenWhatsApp(s)}
                      className="btn btn-whatsapp btn-sm"
                      style={{ padding: '0.35rem 0.6rem', fontSize: '0.74rem', gap: '0.25rem' }}
                    >
                      <MessageSquare size={13} />
                      <span>WhatsApp</span>
                    </button>
                  </div>

                  <button
                    onClick={() => onCollectPaymentForStudent(s)}
                    className="btn btn-primary btn-sm"
                    style={{ padding: '0.35rem 0.85rem', fontSize: '0.76rem', gap: '0.3rem' }}
                  >
                    <CreditCard size={14} />
                    <span>Collect Fee</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
