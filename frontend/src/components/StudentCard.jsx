import React, { useState } from 'react';
import { 
  Phone, MessageSquare, CreditCard, Receipt, ChevronDown, 
  ChevronUp, User, MapPin, UserCheck, Calendar, Check, AlertTriangle 
} from 'lucide-react';

export default function StudentCard({ 
  student, 
  roleView, 
  onRecordPayment, 
  onOpenWhatsApp, 
  onViewReceipt,
  onAddLineItem 
}) {
  const [expanded, setExpanded] = useState(false);
  const isCaller = roleView === 'TEACHER_CALLER';

  const formatCurrency = (val) => {
    if (val === null || val === undefined) return '••••••';
    const num = Number(val || 0);
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(num);
  };

  const getStatusBadge = () => {
    if (student.fee_status === 'PAID') {
      return <span className="badge badge-paid">Fully Paid</span>;
    } else if (student.fee_status === 'PARTIAL') {
      return <span className="badge badge-partial">Partial Paid</span>;
    }
    return <span className="badge badge-unpaid">Pending Dues</span>;
  };

  return (
    <div style={{
      backgroundColor: 'var(--bg-surface)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border-light)',
      boxShadow: 'var(--shadow-xs)',
      overflow: 'hidden',
      transition: 'var(--transition)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Top Banner / Student Info */}
      <div style={{ padding: '1.15rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {student.name}
              </h3>
              {student.registration_no && (
                <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                  {student.registration_no}
                </span>
              )}
              {student.student_id && (
                <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
                  {student.student_id}
                </span>
              )}
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginTop: '0.35rem',
              flexWrap: 'wrap',
              fontSize: '0.78rem',
              color: 'var(--text-secondary)'
            }}>
              <span style={{ fontWeight: 600, color: 'var(--primary-700)' }}>
                {student.group || student.program_name}
              </span>
              <span>•</span>
              <span>{student.batch_name}</span>
              {student.center_code && (
                <>
                  <span>•</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                    <MapPin size={12} /> {student.center_code}
                  </span>
                </>
              )}
              {student.candidate_type && (
                <span className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>
                  {student.candidate_type}
                </span>
              )}
            </div>
          </div>

          <div>{getStatusBadge()}</div>
        </div>

        {/* Reference Person Tag if referred */}
        {student.reference_name && (
          <div style={{
            marginTop: '0.65rem',
            padding: '0.3rem 0.65rem',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--bg-subtle)',
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}>
            <UserCheck size={13} style={{ color: 'var(--primary-600)' }} />
            <span>Ref: <strong>{student.reference_name}</strong></span>
            {student.reference_phone && (
              <a
                href={`tel:${student.reference_phone}`}
                style={{ color: 'var(--primary-600)', textDecoration: 'none', marginLeft: '0.25rem' }}
              >
                ({student.reference_phone})
              </a>
            )}
          </div>
        )}

        {/* Contact Numbers Display */}
        <div style={{
          marginTop: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          flexWrap: 'wrap',
          fontSize: '0.85rem'
        }}>
          {student.primary_contact ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Phone size={14} style={{ color: 'var(--emerald-600)' }} />
              <strong style={{ color: 'var(--text-primary)' }}>{student.primary_contact}</strong>
            </div>
          ) : (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No primary contact</span>
          )}

          {student.secondary_contact && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)' }}>
              <span>Alt: {student.secondary_contact}</span>
            </div>
          )}
        </div>

        {/* Financial Progress Bar vs Total Dues */}
        <div style={{
          marginTop: '1rem',
          padding: '0.75rem',
          backgroundColor: 'var(--bg-subtle)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-light)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Paid: <strong>{formatCurrency(student.total_paid_amount)}</strong>
              {!isCaller && (
                <span> / {formatCurrency(student.total_fee_amount)}</span>
              )}
            </span>
            <span style={{
              fontSize: '0.82rem',
              fontWeight: 800,
              color: Number(student.total_balance_due) > 0 ? 'var(--rose-600)' : 'var(--emerald-600)'
            }}>
              Due: {formatCurrency(student.total_balance_due)}
            </span>
          </div>

          <div style={{
            height: 7,
            backgroundColor: 'var(--border-light)',
            borderRadius: 'var(--radius-full)',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${Math.min(100, student.payment_percentage || 0)}%`,
              height: '100%',
              backgroundColor: student.payment_percentage >= 100 ? 'var(--emerald-500)' : 'var(--amber-500)',
              borderRadius: 'var(--radius-full)',
              transition: 'width 0.4s ease'
            }} />
          </div>
        </div>
      </div>

      {/* Expanded Year-by-Year & Ledger Section */}
      {expanded && (
        <div style={{
          padding: '1rem 1.15rem',
          borderTop: '1px dashed var(--border-light)',
          backgroundColor: '#FCFDFF'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
              Academic Fee Structure & Payments:
            </span>
            {roleView !== 'TEACHER_CALLER' && (
              <button
                onClick={() => onAddLineItem(student)}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
              >
                + Add Special Fee
              </button>
            )}
          </div>

          {student.year_fees && student.year_fees.map((yf) => (
            <div key={yf.id} style={{
              marginBottom: '0.75rem',
              padding: '0.65rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-light)',
              backgroundColor: '#FFFFFF'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600 }}>
                <span>Year {yf.year_index} ({yf.remarks || 'Annual Fee'})</span>
                <span style={{ color: Number(yf.balance_due) > 0 ? 'var(--rose-600)' : 'var(--emerald-600)' }}>
                  Due: {formatCurrency(yf.balance_due)}
                </span>
              </div>

              {!isCaller && (
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Base: {formatCurrency(yf.base_annual_fee)} • Paid: {formatCurrency(yf.total_paid)}
                </div>
              )}

              {/* Line Items if any */}
              {yf.line_items && yf.line_items.length > 0 && (
                <div style={{ marginTop: '0.4rem', borderTop: '1px solid var(--bg-subtle)', paddingTop: '0.35rem' }}>
                  {yf.line_items.map((item) => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                      <span>• {item.title}</span>
                      <span>{formatCurrency(item.amount)}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Payment transactions history */}
              {yf.payments && yf.payments.length > 0 && (
                <div style={{ marginTop: '0.4rem', borderTop: '1px solid var(--bg-subtle)', paddingTop: '0.35rem' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)' }}>Payments Recorded:</span>
                  {yf.payments.map((p) => (
                    <div key={p.id} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.73rem',
                      color: 'var(--emerald-700)',
                      marginTop: '0.2rem'
                    }}>
                      <span>✓ {formatCurrency(p.amount)} ({p.payment_mode}) - {p.payment_date || 'Today'}</span>
                      {p.screenshot_url && (
                        <a
                          href={p.screenshot_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ fontSize: '0.68rem', color: 'var(--primary-600)', textDecoration: 'underline' }}
                        >
                          View Proof
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Custom Fields (e.g. DEB, Provisional No, SSC) */}
          {student.custom_fields && Object.keys(student.custom_fields).length > 0 && (
            <div style={{
              marginTop: '0.65rem',
              padding: '0.55rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-subtle)',
              fontSize: '0.74rem'
            }}>
              <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>Student Attributes:</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.25rem' }}>
                {Object.entries(student.custom_fields).map(([k, v]) => (
                  v ? (
                    <span key={k} style={{ color: 'var(--text-secondary)' }}>
                      <strong>{k.toUpperCase()}:</strong> {String(v)}
                    </span>
                  ) : null
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons Footer (Thumb-friendly on mobile) */}
      <div style={{
        padding: '0.75rem 1.15rem',
        borderTop: '1px solid var(--border-light)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'var(--bg-surface)',
        gap: '0.5rem',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          {/* Direct Phone Call */}
          {student.primary_contact && (
            <a
              href={`tel:${student.primary_contact}`}
              className="btn btn-call btn-sm"
              title="Call student or parent directly"
            >
              <Phone size={14} />
              <span>Call</span>
            </a>
          )}

          {/* 1-Tap WhatsApp Reminder Launcher */}
          <button
            onClick={() => onOpenWhatsApp(student)}
            className="btn btn-whatsapp btn-sm"
            title="Open WhatsApp with pre-filled fee dues reminder"
          >
            <MessageSquare size={14} />
            <span>WhatsApp</span>
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          {/* Record Partial / Irregular Payment */}
          <button
            onClick={() => onRecordPayment(student)}
            className="btn btn-primary btn-sm"
            title="Record full or partial installment payment"
          >
            <CreditCard size={14} />
            <span>+ Pay</span>
          </button>

          {/* View Digital Receipt */}
          <button
            onClick={() => onViewReceipt(student)}
            className="btn btn-secondary btn-sm btn-icon"
            title="View & Print Digital Receipt"
          >
            <Receipt size={15} />
          </button>

          {/* Expand Details */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="btn btn-secondary btn-sm btn-icon"
            title={expanded ? 'Collapse' : 'View Year Breakdown'}
          >
            {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        </div>
      </div>
    </div>
  );
}
