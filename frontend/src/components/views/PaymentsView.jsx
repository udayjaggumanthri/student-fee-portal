import React, { useState, useEffect } from 'react';
import {
  Receipt, Search, Filter, Download, Plus, Eye, Edit, Trash2,
  CreditCard, Smartphone, Banknote, Calendar, CheckCircle2,
  ExternalLink, FileText, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import EditPaymentModal from '../EditPaymentModal';

export default function PaymentsView({
  batches,
  programs,
  onRecordPayment,
  onViewReceipt,
  onViewProfile,
  onExportExcel
}) {
  const { isCaller, isAdmin, isPrincipal } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('all');
  const [selectedMode, setSelectedMode] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingPayment, setEditingPayment] = useState(null);
  const pageSize = 10;

  const loadPayments = async () => {
    setLoading(true);
    try {
      const data = await api.getPayments({
        batch: selectedBatch,
        mode: selectedMode,
        search: search.trim()
      });
      setPayments(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => {
      loadPayments();
    }, 200);
    return () => clearTimeout(t);
  }, [selectedBatch, selectedMode, search]);

  const handleDeletePayment = async (p) => {
    const msg = `Are you sure you want to delete payment #${p.id} for ₹${Number(p.amount).toLocaleString('en-IN')} (Student: ${p.student_name})?\n\nThis will instantly restore the outstanding balance due for this student.`;
    if (!window.confirm(msg)) return;

    try {
      await api.deletePayment(p.id);
      await loadPayments();
    } catch (err) {
      alert(err.message || 'Error deleting payment.');
    }
  };

  const formatCurrency = (val) => {
    const num = Number(val || 0);
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(num);
  };

  const getModeBadge = (mode) => {
    switch (mode) {
      case 'PHONEPE':
        return (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
            padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)',
            fontSize: '0.72rem', fontWeight: 700,
            backgroundColor: '#EDE9FE', color: '#6D28D9', border: '1px solid #DDD6FE'
          }}>
            <Smartphone size={12} />
            <span>PhonePe</span>
          </span>
        );
      case 'GPAY':
        return (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
            padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)',
            fontSize: '0.72rem', fontWeight: 700,
            backgroundColor: '#E0F2FE', color: '#0369A1', border: '1px solid #BAE6FD'
          }}>
            <Smartphone size={12} />
            <span>Google Pay</span>
          </span>
        );
      case 'CASH':
        return (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
            padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)',
            fontSize: '0.72rem', fontWeight: 700,
            backgroundColor: '#DCFCE7', color: '#15803D', border: '1px solid #BBF7D0'
          }}>
            <Banknote size={12} />
            <span>Cash</span>
          </span>
        );
      default:
        return (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
            padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)',
            fontSize: '0.72rem', fontWeight: 700,
            backgroundColor: 'var(--bg-subtle)', color: 'var(--text-secondary)', border: '1px solid var(--border-light)'
          }}>
            <CreditCard size={12} />
            <span>{mode}</span>
          </span>
        );
    }
  };

  // Metrics calculation
  const totalAmount = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const upiAmount = payments.filter((p) => p.payment_mode !== 'CASH').reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const cashAmount = payments.filter((p) => p.payment_mode === 'CASH').reduce((sum, p) => sum + Number(p.amount || 0), 0);

  // Pagination
  const totalItems = payments.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedPayments = payments.slice(startIndex, startIndex + pageSize);

  return (
    <div>
      {/* Top Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        marginBottom: '1rem'
      }}>
        <div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Payments & Collections Ledger
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Real-time transaction history, receipts, payment modes, and audit records.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <button
            onClick={onExportExcel}
            className="btn btn-secondary btn-sm"
            style={{ gap: '0.4rem' }}
          >
            <Download size={14} />
            <span>Export Excel</span>
          </button>
          <button
            onClick={() => onRecordPayment()}
            className="btn btn-primary btn-sm"
            style={{ gap: '0.4rem' }}
          >
            <Plus size={15} />
            <span>+ Record Payment</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '0.75rem',
        marginBottom: '1rem'
      }}>
        <div className="card-compact" style={{
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-light)',
          padding: '0.75rem 0.95rem',
          boxShadow: 'var(--shadow-xs)'
        }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            Total Collections (Filtered)
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
            {formatCurrency(totalAmount)}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--emerald-text)', marginTop: '0.15rem', fontWeight: 600 }}>
            {payments.length} verified transactions
          </div>
        </div>

        <div className="card-compact" style={{
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-light)',
          padding: '0.75rem 0.95rem',
          boxShadow: 'var(--shadow-xs)'
        }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            Digital / UPI Collections
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#6D28D9', marginTop: '0.2rem' }}>
            {formatCurrency(upiAmount)}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
            PhonePe, GPay & Net Banking
          </div>
        </div>

        <div className="card-compact" style={{
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-light)',
          padding: '0.75rem 0.95rem',
          boxShadow: 'var(--shadow-xs)'
        }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            Counter Cash Collections
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#15803D', marginTop: '0.2rem' }}>
            {formatCurrency(cashAmount)}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
            Office counter receipts
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card-compact" style={{
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-light)',
        padding: '0.65rem 0.85rem',
        marginBottom: '0.85rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.6rem',
        boxShadow: 'var(--shadow-xs)'
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: 360 }}>
          <Search size={15} style={{
            position: 'absolute',
            left: '0.75rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)'
          }} />
          <input
            type="text"
            placeholder="Search by student name, roll, or transaction ID..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            style={{
              width: '100%',
              padding: '0.45rem 0.75rem 0.45rem 2.15rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-light)',
              backgroundColor: 'var(--bg-subtle)',
              fontSize: '0.82rem',
              color: 'var(--text-primary)',
              outline: 'none'
            }}
          />
        </div>

        {/* Dropdowns */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <select
            value={selectedBatch}
            onChange={(e) => { setSelectedBatch(e.target.value); setCurrentPage(1); }}
            style={{
              padding: '0.45rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-light)',
              backgroundColor: 'var(--bg-subtle)',
              fontSize: '0.82rem',
              color: 'var(--text-primary)',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="all">All Batches</option>
            {batches.map((b) => (
              <option key={b.id} value={String(b.id)}>{b.batch_name}</option>
            ))}
          </select>

          <select
            value={selectedMode}
            onChange={(e) => { setSelectedMode(e.target.value); setCurrentPage(1); }}
            style={{
              padding: '0.45rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-light)',
              backgroundColor: 'var(--bg-subtle)',
              fontSize: '0.82rem',
              color: 'var(--text-primary)',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="all">All Modes</option>
            <option value="CASH">Cash</option>
            <option value="PHONEPE">PhonePe</option>
            <option value="GPAY">Google Pay</option>
            <option value="UPI">Other UPI</option>
            <option value="NETBANKING">Net Banking</option>
          </select>
        </div>
      </div>

      {/* Desktop & Tablet Table View */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-light)',
        boxShadow: 'var(--shadow-xs)',
        overflow: 'hidden',
        marginBottom: '0.85rem'
      }} className="hide-mobile">
        {loading ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading payments ledger...
          </div>
        ) : paginatedPayments.length === 0 ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No payments found matching the selected filters.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table-compact" style={{ width: '100%', minWidth: 780, borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{
                  backgroundColor: 'var(--bg-subtle)',
                  borderBottom: '1px solid var(--border-light)',
                  color: 'var(--text-secondary)',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'uppercase'
                }}>
                  <th style={{ padding: '0.55rem 0.85rem', width: 100 }}>Date</th>
                  <th style={{ padding: '0.55rem 0.85rem' }}>Student Details</th>
                  <th style={{ padding: '0.55rem 0.85rem' }}>Program & Batch</th>
                  <th style={{ padding: '0.55rem 0.85rem' }}>Mode</th>
                  <th style={{ padding: '0.55rem 0.85rem' }}>Amount (₹)</th>
                  <th style={{ padding: '0.55rem 0.85rem' }}>Reference / Remarks</th>
                  <th style={{ padding: '0.55rem 0.85rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPayments.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '0.55rem 0.85rem', color: 'var(--text-muted)', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Calendar size={12} />
                        <span>{p.payment_date || 'N/A'}</span>
                      </div>
                    </td>

                    <td style={{ padding: '0.55rem 0.85rem' }}>
                      <div
                        onClick={() => onViewProfile({ id: p.student_id, student_id: p.student_code, name: p.student_name })}
                        className="truncate-text"
                        style={{ fontWeight: 700, color: 'var(--primary-600)', cursor: 'pointer', maxWidth: 170 }}
                        title={p.student_name}
                      >
                        {p.student_name}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {p.student_code || p.registration_no || `ID #${p.student_id}`}
                      </div>
                    </td>

                    <td style={{ padding: '0.55rem 0.85rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.8rem' }}>
                        {p.program_name}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {p.batch_name} • Y{p.year_index}
                      </div>
                    </td>

                    <td style={{ padding: '0.55rem 0.85rem' }}>
                      {getModeBadge(p.payment_mode)}
                    </td>

                    <td style={{ padding: '0.55rem 0.85rem', fontWeight: 800, color: 'var(--emerald-text)', fontSize: '0.9rem' }}>
                      {formatCurrency(p.amount)}
                    </td>

                    <td style={{ padding: '0.55rem 0.85rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {p.transaction_ref ? <strong>Ref: {p.transaction_ref}</strong> : p.notes || '—'}
                    </td>

                    <td style={{ padding: '0.55rem 0.85rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.25rem' }}>
                        <button
                          onClick={() => onViewReceipt({
                            id: p.student_id,
                            name: p.student_name,
                            batch_name: p.batch_name,
                            program_name: p.program_name,
                            total_fee_amount: p.amount,
                            total_paid_amount: p.amount,
                            total_balance_due: 0
                          })}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.25rem 0.45rem', fontSize: '0.72rem', gap: '0.2rem' }}
                          title="Print / View Receipt"
                        >
                          <FileText size={11} />
                          <span>Receipt</span>
                        </button>

                        <button
                          onClick={() => setEditingPayment(p)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.25rem 0.45rem', fontSize: '0.72rem', gap: '0.2rem', color: 'var(--primary-600)' }}
                          title="Edit Payment Details"
                        >
                          <Edit size={11} />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => handleDeletePayment(p)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.25rem 0.45rem', fontSize: '0.72rem', gap: '0.2rem', color: 'var(--rose-600)' }}
                          title="Delete Payment Record"
                        >
                          <Trash2 size={11} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Enterprise Mobile Transaction Cards View */}
      <div style={{ flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }} className="show-mobile-flex">
        {loading ? (
          <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
            Loading payments ledger...
          </div>
        ) : paginatedPayments.length === 0 ? (
          <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
            No payments found matching the selected filters.
          </div>
        ) : (
          paginatedPayments.map((p) => (
            <div
              key={p.id}
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-light)',
                padding: '0.95rem 1rem',
                boxShadow: 'var(--shadow-xs)'
              }}
            >
              {/* Header: Date, Mode Badge & Amount */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.55rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Calendar size={12} />
                    {p.payment_date || 'N/A'}
                  </span>
                  {getModeBadge(p.payment_mode)}
                </div>

                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--emerald-text)' }}>
                  {formatCurrency(p.amount)}
                </div>
              </div>

              {/* Student details */}
              <div style={{ marginBottom: '0.55rem' }}>
                <div
                  onClick={() => onViewProfile({ id: p.student_id, student_id: p.student_code, name: p.student_name })}
                  style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-primary)', cursor: 'pointer' }}
                >
                  {p.student_name}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                  {p.student_code || p.registration_no || `ID #${p.student_id}`} • {p.program_name} ({p.batch_name}) • Year {p.year_index}
                </div>
              </div>

              {/* Transaction Ref or Notes */}
              {(p.transaction_ref || p.notes) && (
                <div style={{
                  fontSize: '0.73rem',
                  backgroundColor: 'var(--bg-subtle)',
                  padding: '0.4rem 0.6rem',
                  borderRadius: 'var(--radius-xs)',
                  color: 'var(--text-secondary)',
                  marginBottom: '0.65rem'
                }}>
                  {p.transaction_ref && <span><strong>Ref:</strong> {p.transaction_ref} </span>}
                  {p.notes && <span>• {p.notes}</span>}
                </div>
              )}

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '0.4rem',
                borderTop: '1px solid var(--border-light)',
                paddingTop: '0.55rem'
              }}>
                <button
                  onClick={() => onViewReceipt({
                    id: p.student_id,
                    name: p.student_name,
                    batch_name: p.batch_name,
                    program_name: p.program_name,
                    total_fee_amount: p.amount,
                    total_paid_amount: p.amount,
                    total_balance_due: 0
                  })}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '0.3rem 0.65rem', fontSize: '0.74rem', gap: '0.3rem' }}
                >
                  <FileText size={12} />
                  <span>Receipt</span>
                </button>

                <button
                  onClick={() => setEditingPayment(p)}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '0.3rem 0.65rem', fontSize: '0.74rem', gap: '0.3rem', color: 'var(--primary-600)' }}
                >
                  <Edit size={12} />
                  <span>Edit</span>
                </button>

                <button
                  onClick={() => handleDeletePayment(p)}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '0.3rem 0.65rem', fontSize: '0.74rem', gap: '0.3rem', color: 'var(--rose-600)' }}
                >
                  <Trash2 size={12} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Common Pagination Card */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-light)',
        boxShadow: 'var(--shadow-xs)',
        padding: '0.85rem 1.25rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.65rem',
        fontSize: '0.82rem',
        color: 'var(--text-muted)'
      }}>
        <div>
          Showing {payments.length > 0 ? startIndex + 1 : 0} to {Math.min(startIndex + pageSize, totalItems)} of {totalItems} transactions
        </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{
                padding: '0.35rem 0.6rem',
                borderRadius: 'var(--radius-xs)',
                border: '1px solid var(--border-light)',
                backgroundColor: 'var(--bg-subtle)',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                opacity: currentPage === 1 ? 0.5 : 1
              }}
            >
              <ChevronLeft size={14} />
            </button>

            <span style={{ padding: '0 0.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              style={{
                padding: '0.35rem 0.6rem',
                borderRadius: 'var(--radius-xs)',
                border: '1px solid var(--border-light)',
                backgroundColor: 'var(--bg-subtle)',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                opacity: currentPage === totalPages ? 0.5 : 1
              }}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

      {/* Edit Payment Modal */}
      {editingPayment && (
        <EditPaymentModal
          payment={editingPayment}
          studentId={editingPayment.student_id}
          onClose={() => setEditingPayment(null)}
          onPaymentUpdated={loadPayments}
        />
      )}
    </div>
  );
}
