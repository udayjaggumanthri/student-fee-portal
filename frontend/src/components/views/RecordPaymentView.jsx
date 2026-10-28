import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Upload, CheckCircle2, AlertCircle, Calendar,
  CreditCard, DollarSign, Image, X, History, MessageSquare,
  Phone, FileText, ChevronDown, ChevronUp, ExternalLink, User
} from 'lucide-react';
import { api } from '../../services/api';
import Breadcrumbs from '../common/Breadcrumbs';

export default function RecordPaymentView({
  student,
  onBack,
  onViewProfile,
  onOpenWhatsApp,
  onViewReceipt,
  onSavePayment
}) {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [localStudent, setLocalStudent] = useState(student);
  const [loadingStudent, setLoadingStudent] = useState(!student && !!studentId);

  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('UPI / PhonePe');
  const [selectedYearIndex, setSelectedYearIndex] = useState(1);
  const [transactionRef, setTransactionRef] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Previous Payment History State
  const [previousPayments, setPreviousPayments] = useState([]);
  const [showHistory, setShowHistory] = useState(true);

  useEffect(() => {
    if (student) {
      setLocalStudent(student);
    } else if (studentId) {
      setLoadingStudent(true);
      api.getStudent(studentId)
        .then((data) => {
          if (data && !data.detail) {
            setLocalStudent(data);
          }
        })
        .catch((err) => console.error(err))
        .finally(() => setLoadingStudent(false));
    }
  }, [student, studentId]);

  // Extract all previous payments from year_fees
  useEffect(() => {
    if (localStudent) {
      const payments = [];
      (localStudent.year_fees || []).forEach(yf => {
        (yf.payments || []).forEach(p => {
          payments.push({ ...p, year_index: yf.year_index });
        });
      });
      payments.sort((a, b) => new Date(b.payment_date || 0) - new Date(a.payment_date || 0));
      setPreviousPayments(payments);
    }
  }, [localStudent]);

  const handleBackAction = onBack || (() => {
    if (localStudent) {
      navigate(`/students/${localStudent.student_id || localStudent.id}`);
    } else {
      navigate('/students');
    }
  });

  const handleViewProfileAction = onViewProfile || ((s) => {
    navigate(`/students/${s.student_id || s.id}`);
  });

  if (loadingStudent) {
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          Loading Student Record...
        </div>
        <p style={{ fontSize: '0.85rem' }}>Preparing fee collection counter for {studentId}...</p>
      </div>
    );
  }

  if (!localStudent) {
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          Student Record Not Found
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Cannot record payment for student "{studentId}".
        </p>
        <button onClick={() => navigate('/students')} className="btn btn-primary">
          Return to Student Directory
        </button>
      </div>
    );
  }

  const activeStudent = localStudent;
  const totalFee = Number(activeStudent.total_fee_amount || 0);
  const paidAmount = Number(activeStudent.total_paid_amount || 0);
  const balanceDue = Number(activeStudent.total_balance_due || 0);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(Number(val || 0));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setScreenshot(file);
      setScreenshotPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      setError('Please provide a valid payment amount greater than zero.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('amount', amount);
      formData.append('year_index', selectedYearIndex);

      let mode = 'CASH';
      if (paymentMethod.includes('PhonePe')) mode = 'PHONEPE';
      else if (paymentMethod.includes('Google') || paymentMethod.includes('GPay')) mode = 'GPAY';
      else if (paymentMethod.includes('UPI')) mode = 'UPI';
      else if (paymentMethod.includes('Bank') || paymentMethod.includes('Transfer')) mode = 'NETBANKING';
      else if (paymentMethod.includes('Cheque')) mode = 'CHEQUE';

      formData.append('payment_mode', mode);
      formData.append('payment_date', paymentDate);
      if (transactionRef) formData.append('transaction_ref', transactionRef);
      if (remarks) formData.append('notes', remarks);
      if (screenshot) formData.append('screenshot', screenshot);

      if (onSavePayment) {
        await onSavePayment(activeStudent.id, formData);
      } else {
        await api.recordPayment(activeStudent.id, formData);
      }
      navigate(`/students/${activeStudent.student_id || activeStudent.id}`);
    } catch (err) {
      setError(err.message || 'Error saving payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 860, margin: '0 auto' }}>
      {/* Breadcrumbs */}
      <Breadcrumbs items={[
        { label: 'Students', path: '/students' },
        { label: `${activeStudent.name} (${activeStudent.student_id || activeStudent.id})`, path: `/students/${activeStudent.student_id || activeStudent.id}` },
        { label: 'Collect Fee' }
      ]} />

      {/* Header with Back Arrow */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <button
          onClick={handleBackAction}
          style={{
            border: 'none',
            background: 'var(--bg-surface)',
            cursor: 'pointer',
            padding: '0.5rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary)'
          }}
          title="Go Back"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Fee Collection Counter
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
            Record fee installment, inspect prior payment history, and generate instant receipt.
          </p>
        </div>
      </div>

      {/* Student Profile Banner & Quick Navigation Action Buttons */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-light)',
        padding: '1.15rem 1.35rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.85rem',
        boxShadow: 'var(--shadow-xs)',
        marginBottom: '1.25rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--primary-100)',
            color: 'var(--primary-700)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '1rem',
            flexShrink: 0
          }}>
            {activeStudent.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {activeStudent.name}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {activeStudent.student_id || activeStudent.registration_no || `STD${String(activeStudent.id).padStart(3, '0')}`} • {activeStudent.group || activeStudent.program_name} • Batch: <strong>{activeStudent.batch_name}</strong>
            </div>
          </div>
        </div>

        {/* Quick Action Navigation Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => handleViewProfileAction(activeStudent)}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.76rem', padding: '0.35rem 0.65rem', gap: '0.35rem' }}
            title="Open Student Profile"
          >
            <User size={13} />
            <span>Profile</span>
          </button>

          <button
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            className="btn btn-secondary btn-sm"
            style={{
              fontSize: '0.76rem',
              padding: '0.35rem 0.65rem',
              gap: '0.35rem',
              color: 'var(--primary-700)',
              backgroundColor: showHistory ? 'var(--primary-50)' : 'var(--bg-surface)'
            }}
            title="Toggle Previous Payment History"
          >
            <History size={13} />
            <span>History ({previousPayments.length})</span>
          </button>

          {onOpenWhatsApp && (
            <button
              type="button"
              onClick={() => onOpenWhatsApp(activeStudent)}
              className="btn btn-whatsapp btn-sm"
              style={{ fontSize: '0.76rem', padding: '0.35rem 0.65rem', gap: '0.35rem' }}
              title="Send WhatsApp Reminder / Receipt"
            >
              <MessageSquare size={13} />
              <span>WhatsApp</span>
            </button>
          )}

          {activeStudent.primary_contact && (
            <a
              href={`tel:${activeStudent.primary_contact}`}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.76rem', padding: '0.35rem 0.65rem', gap: '0.35rem', textDecoration: 'none' }}
              title={`Call ${activeStudent.primary_contact}`}
            >
              <Phone size={13} />
              <span>Call</span>
            </a>
          )}
        </div>
      </div>

      {/* 3 Summary Financial Metric Pills (Responsive Mobile Grid) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: '0.75rem',
        marginBottom: '1.25rem'
      }}>
        <div style={{
          backgroundColor: '#EFF6FF',
          border: '1px solid #DBEAFE',
          borderRadius: 'var(--radius-md)',
          padding: '0.85rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#1E40AF', textTransform: 'uppercase' }}>
            Total Obligation
          </div>
          <div style={{ fontSize: 'clamp(1.1rem, 3.5vw, 1.35rem)', fontWeight: 800, color: '#1D4ED8', marginTop: '0.15rem' }}>
            {formatCurrency(totalFee)}
          </div>
        </div>

        <div style={{
          backgroundColor: '#ECFDF5',
          border: '1px solid #D1FAE5',
          borderRadius: 'var(--radius-md)',
          padding: '0.85rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#065F46', textTransform: 'uppercase' }}>
            Paid to Date
          </div>
          <div style={{ fontSize: 'clamp(1.1rem, 3.5vw, 1.35rem)', fontWeight: 800, color: '#059669', marginTop: '0.15rem' }}>
            {formatCurrency(paidAmount)}
          </div>
        </div>

        <div style={{
          backgroundColor: '#FEF2F2',
          border: '1px solid #FEE2E2',
          borderRadius: 'var(--radius-md)',
          padding: '0.85rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#991B1B', textTransform: 'uppercase' }}>
            Outstanding Balance
          </div>
          <div style={{ fontSize: 'clamp(1.1rem, 3.5vw, 1.35rem)', fontWeight: 800, color: '#DC2626', marginTop: '0.15rem' }}>
            {formatCurrency(balanceDue)}
          </div>
        </div>
      </div>

      {/* Dedicated Collapsible "Previous Payment History" Panel */}
      {showHistory && (
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-light)',
          padding: '1.15rem 1.25rem',
          boxShadow: 'var(--shadow-xs)',
          marginBottom: '1.25rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <History size={16} style={{ color: 'var(--primary-600)' }} />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Previous Payment History
              </h3>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '0.15rem 0.5rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--primary-50)',
                color: 'var(--primary-700)'
              }}>
                {previousPayments.length} Payments
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowHistory(false)}
              style={{
                border: 'none',
                background: 'transparent',
                color: 'var(--text-muted)',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
            >
              <span>Hide</span>
              <ChevronUp size={14} />
            </button>
          </div>

          {previousPayments.length === 0 ? (
            <div style={{
              padding: '1.5rem',
              textAlign: 'center',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.82rem',
              color: 'var(--text-muted)'
            }}>
              No previous payments recorded for this student yet. This transaction will be logged as installment #1.
            </div>
          ) : (
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{
                    backgroundColor: 'var(--bg-subtle)',
                    borderBottom: '1px solid var(--border-light)',
                    color: 'var(--text-secondary)',
                    fontSize: '0.72rem',
                    textTransform: 'uppercase'
                  }}>
                    <th style={{ padding: '0.55rem 0.75rem', textAlign: 'left' }}>Date</th>
                    <th style={{ padding: '0.55rem 0.75rem', textAlign: 'left' }}>Period</th>
                    <th style={{ padding: '0.55rem 0.75rem', textAlign: 'left' }}>Mode</th>
                    <th style={{ padding: '0.55rem 0.75rem', textAlign: 'left' }}>Ref / Remarks</th>
                    <th style={{ padding: '0.55rem 0.75rem', textAlign: 'right' }}>Amount (₹)</th>
                    <th style={{ padding: '0.55rem 0.75rem', textAlign: 'center' }}>Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {previousPayments.map((p) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '0.65rem 0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {p.payment_date || 'N/A'}
                      </td>
                      <td style={{ padding: '0.65rem 0.75rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
                        Year {p.year_index || 1}
                      </td>
                      <td style={{ padding: '0.65rem 0.75rem', whiteSpace: 'nowrap' }}>
                        <span style={{
                          padding: '0.15rem 0.5rem',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          backgroundColor: p.payment_mode === 'CASH' ? '#DCFCE7' : '#EDE9FE',
                          color: p.payment_mode === 'CASH' ? '#15803D' : '#6D28D9'
                        }}>
                          {p.payment_mode}
                        </span>
                      </td>
                      <td style={{ padding: '0.65rem 0.75rem', color: 'var(--text-secondary)' }}>
                        {p.transaction_ref ? <strong>Ref: {p.transaction_ref}</strong> : p.notes || '—'}
                      </td>
                      <td style={{ padding: '0.65rem 0.75rem', textAlign: 'right', fontWeight: 800, color: 'var(--emerald-text)', whiteSpace: 'nowrap' }}>
                        {formatCurrency(p.amount)}
                      </td>
                      <td style={{ padding: '0.65rem 0.75rem', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        {onViewReceipt && (
                          <button
                            type="button"
                            onClick={() => onViewReceipt(activeStudent)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.2rem 0.45rem', fontSize: '0.72rem' }}
                            title="View / Print Receipt"
                          >
                            <FileText size={12} />
                            <span>View</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Payment Entry Form */}
      <form onSubmit={handleSubmit} style={{
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-light)',
        padding: '1.5rem',
        boxShadow: 'var(--shadow-xs)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <CreditCard size={18} style={{ color: 'var(--primary-600)' }} />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Enter New Fee Payment Installment
          </h3>
        </div>

        {error && (
          <div style={{
            padding: '0.75rem 1rem',
            backgroundColor: 'var(--rose-50)',
            color: 'var(--rose-text)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Row 1: Amount, Date, Method, Year */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
              Payment Amount *
            </label>
            <input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              min={1}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                border: '1.5px solid var(--border-light)',
                backgroundColor: 'var(--bg-subtle)',
                fontSize: '1.05rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                outline: 'none'
              }}
            />
            {balanceDue > 0 && (
              <button
                type="button"
                onClick={() => setAmount(String(balanceDue))}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--primary-600)',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginTop: '0.35rem',
                  textAlign: 'left'
                }}
              >
                Set full balance ({formatCurrency(balanceDue)})
              </button>
            )}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
              Academic Period / Year
            </label>
            <select
              value={selectedYearIndex}
              onChange={(e) => setSelectedYearIndex(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-light)',
                backgroundColor: 'var(--bg-subtle)',
                fontSize: '0.88rem',
                color: 'var(--text-primary)',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value={1}>1st Year</option>
              {(activeStudent.duration_years || 1) >= 2 && <option value={2}>2nd Year</option>}
              {(activeStudent.duration_years || 1) >= 3 && <option value={3}>3rd Year</option>}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
              Payment Date
            </label>
            <input
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-light)',
                backgroundColor: 'var(--bg-subtle)',
                fontSize: '0.88rem',
                color: 'var(--text-primary)',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-light)',
                backgroundColor: 'var(--bg-subtle)',
                fontSize: '0.88rem',
                color: 'var(--text-primary)',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="UPI / PhonePe">UPI / PhonePe</option>
              <option value="Google Pay">Google Pay</option>
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
              <option value="Cheque">Cheque</option>
            </select>
          </div>
        </div>

        {/* Row 2: Reference / Transaction ID */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
            Reference / Transaction ID (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. UPI Ref / UTR / Cheque No"
            value={transactionRef}
            onChange={(e) => setTransactionRef(e.target.value)}
            style={{
              width: '100%',
              padding: '0.65rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-light)',
              backgroundColor: 'var(--bg-subtle)',
              fontSize: '0.88rem',
              color: 'var(--text-primary)',
              outline: 'none'
            }}
          />
        </div>

        {/* Row 3: Upload Proof */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
            Attach Payment Proof / Screenshot (Optional)
          </label>
          <label style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.25rem',
            borderRadius: 'var(--radius-md)',
            border: '2px dashed var(--border-light)',
            backgroundColor: 'var(--bg-subtle)',
            cursor: 'pointer',
            textAlign: 'center'
          }}>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            {screenshotPreview ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <img
                  src={screenshotPreview}
                  alt="Preview"
                  style={{ maxHeight: 70, borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-light)' }}
                />
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{screenshot.name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Click to replace file</div>
                </div>
              </div>
            ) : (
              <>
                <Upload size={26} style={{ color: 'var(--primary-600)', marginBottom: '0.4rem' }} />
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Click to upload or drag & drop payment slip
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  PNG, JPG, PDF (Max 5MB)
                </div>
              </>
            )}
          </label>
        </div>

        {/* Row 4: Remarks */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
            Remarks / Ledger Notes (Optional)
          </label>
          <textarea
            rows={2}
            placeholder="Add internal verification notes..."
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            style={{
              width: '100%',
              padding: '0.65rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-light)',
              backgroundColor: 'var(--bg-subtle)',
              fontSize: '0.85rem',
              color: 'var(--text-primary)',
              outline: 'none',
              resize: 'vertical'
            }}
          />
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={handleBackAction}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ padding: '0.65rem 1.35rem' }}
          >
            {loading ? 'Saving...' : 'Save & Generate Receipt'}
          </button>
        </div>
      </form>
    </div>
  );
}
