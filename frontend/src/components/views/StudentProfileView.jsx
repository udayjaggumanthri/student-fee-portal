import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, MessageSquare, Phone, Edit, CheckCircle,
  CreditCard, FileText, Plus, ExternalLink, Calendar, MapPin,
  Shield, UserCheck, Layers, Award, School, GraduationCap,
  AlertCircle, DollarSign, Trash2, Download
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import Breadcrumbs from '../common/Breadcrumbs';
import EditStudentModal from '../EditStudentModal';
import EditPaymentModal from '../EditPaymentModal';
import StudentFeeStatementModal from '../StudentFeeStatementModal';

export default function StudentProfileView({
  student,
  batches = [],
  onBack,
  onRecordPayment,
  onOpenWhatsApp,
  onViewReceipt,
  onAddNote,
  onStudentUpdated
}) {
  const { isCaller, isAdmin, isPrincipal } = useAuth();
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Edit Student & Payment Modals
  const [showEditStudentModal, setShowEditStudentModal] = useState(false);
  const [showStatementModal, setShowStatementModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [actionFeedback, setActionFeedback] = useState(null);

  // Add Custom Line Item state
  const [showAddLineItemModal, setShowAddLineItemModal] = useState(false);
  const [itemTitle, setItemTitle] = useState('');
  const [itemAmount, setItemAmount] = useState('');
  const [itemYearIndex, setItemYearIndex] = useState(1);
  const [lineItemLoading, setLineItemLoading] = useState(false);

  // Edit Line Item & Year Fee state
  const [editingLineItem, setEditingLineItem] = useState(null);
  const [editingYearFee, setEditingYearFee] = useState(null);
  const [editLineItemLoading, setEditLineItemLoading] = useState(false);
  const [editYearFeeLoading, setEditYearFeeLoading] = useState(false);

  const [localStudent, setLocalStudent] = useState(student);
  const [loadingStudent, setLoadingStudent] = useState(!student && !!studentId);

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

  // Notes state
  const [noteText, setNoteText] = useState('');
  const [notesList, setNotesList] = useState([
    { id: 1, text: 'Enrolled in 2026-2027 batch with valid certificates verified.', author: 'Admin', date: '2026-08-15' },
    { id: 2, text: 'Candidate contacted regarding Year 1 fee schedule.', author: 'Staff', date: '2026-09-10' }
  ]);

  const handleBack = onBack || (() => navigate('/students'));
  const handleCollect = onRecordPayment || (() => {
    if (localStudent) {
      navigate(`/students/${localStudent.student_id || localStudent.id}/collect`);
    }
  });

  const handleReloadStudent = async () => {
    if (!localStudent?.id) return;
    try {
      const fresh = await api.getStudent(localStudent.id);
      if (fresh && !fresh.detail) {
        setLocalStudent(fresh);
        if (onStudentUpdated) onStudentUpdated(fresh);
      }
    } catch (err) {
      console.error('Error reloading student data:', err);
    }
  };

  const handleDeletePayment = async (payment) => {
    const confirmMsg = `Are you sure you want to delete payment transaction #${payment.id} of ₹${Number(payment.amount).toLocaleString('en-IN')}?\n\nThis will restore the outstanding balance for Year ${payment.year_index || 1}.`;
    if (!window.confirm(confirmMsg)) return;

    try {
      await api.deletePayment(payment.id);
      setActionFeedback({
        type: 'success',
        message: `Payment #${payment.id} (₹${Number(payment.amount).toLocaleString('en-IN')}) was deleted. Balances recalculated.`
      });
      await handleReloadStudent();
      setTimeout(() => setActionFeedback(null), 4000);
    } catch (err) {
      alert(err.message || 'Error deleting payment.');
    }
  };

  if (loadingStudent) {
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          Loading Student Profile...
        </div>
        <p style={{ fontSize: '0.85rem' }}>Retrieving records for Roll / ID {studentId}...</p>
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
          No student matching identifier "{studentId}" was found in the Navodaya database.
        </p>
        <button onClick={() => navigate('/students')} className="btn btn-primary">
          Return to Student Directory
        </button>
      </div>
    );
  }

  const totalFee = Number(localStudent.total_fee_amount || 0);
  const paidAmount = Number(localStudent.total_paid_amount || 0);
  const balanceDue = Number(localStudent.total_balance_due || 0);
  const percentage = totalFee > 0 ? Math.min(100, Math.round((paidAmount / totalFee) * 100)) : (paidAmount > 0 ? 100 : 0);

  const formatCurrency = (val) => {
    if (val === null || val === undefined) return '••••••';
    const num = Number(val || 0);
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(num);
  };

  // SVG circular gauge math
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const handleAddLineItem = async (e) => {
    e.preventDefault();
    if (!itemTitle || !itemAmount || Number(itemAmount) <= 0) return;

    setLineItemLoading(true);
    try {
      const res = await api.addLineItem(localStudent.id, {
        title: itemTitle.trim(),
        amount: Number(itemAmount),
        year_index: itemYearIndex
      });
      if (res && res.student) {
        setLocalStudent(res.student);
        if (onStudentUpdated) onStudentUpdated(res.student);
      }
      setShowAddLineItemModal(false);
      setItemTitle('');
      setItemAmount('');
    } catch (err) {
      alert(err.message || 'Error adding line item');
    } finally {
      setLineItemLoading(false);
    }
  };

  const handleEditLineItemSubmit = async (e) => {
    e.preventDefault();
    if (!editingLineItem || !editingLineItem.title || Number(editingLineItem.amount) <= 0) return;
    setEditLineItemLoading(true);
    try {
      await api.updateLineItem(editingLineItem.id, {
        title: editingLineItem.title.trim(),
        amount: Number(editingLineItem.amount),
        is_optional: Boolean(editingLineItem.is_optional)
      });
      setEditingLineItem(null);
      await handleReloadStudent();
      setActionFeedback({
        type: 'success',
        message: 'Fee head updated successfully! Balances recalculated.'
      });
      setTimeout(() => setActionFeedback(null), 4000);
    } catch (err) {
      alert(err.message || 'Error updating fee item');
    } finally {
      setEditLineItemLoading(false);
    }
  };

  const handleDeleteLineItem = async (item) => {
    const confirmMsg = `Are you sure you want to delete fee head "${item.title}" (₹${Number(item.amount).toLocaleString('en-IN')})?\n\nThis will remove the charge and automatically recalculate total dues.`;
    if (!window.confirm(confirmMsg)) return;

    try {
      await api.deleteLineItem(item.id);
      await handleReloadStudent();
      setActionFeedback({
        type: 'success',
        message: `Fee item "${item.title}" deleted. Balances updated.`
      });
      setTimeout(() => setActionFeedback(null), 4000);
    } catch (err) {
      alert(err.message || 'Error deleting line item');
    }
  };

  const handleEditYearFeeSubmit = async (e) => {
    e.preventDefault();
    if (!editingYearFee) return;
    setEditYearFeeLoading(true);
    try {
      await api.updateYearFee(editingYearFee.id, {
        base_annual_fee: Number(editingYearFee.base_annual_fee || 0),
        discount_amount: Number(editingYearFee.discount_amount || 0),
        remarks: editingYearFee.remarks || ''
      });
      setEditingYearFee(null);
      await handleReloadStudent();
      setActionFeedback({
        type: 'success',
        message: `Year ${editingYearFee.year_index} fee structure updated successfully!`
      });
      setTimeout(() => setActionFeedback(null), 4000);
    } catch (err) {
      alert(err.message || 'Error updating year fee structure');
    } finally {
      setEditYearFeeLoading(false);
    }
  };

  const handleAddNoteSubmit = (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    setNotesList((prev) => [
      ...prev,
      {
        id: Date.now(),
        text: noteText.trim(),
        author: 'Staff',
        date: new Date().toISOString().split('T')[0]
      }
    ]);
    setNoteText('');
  };

  // Helper to extract custom field
  const cf = localStudent.custom_fields || {};

  return (
    <div>
      {/* Top Breadcrumb Navigation */}
      <Breadcrumbs items={[
        { label: 'Students', path: '/students' },
        { label: `${localStudent.name} (${localStudent.student_id || localStudent.registration_no || localStudent.id})` }
      ]} />

      {/* Top Banner with Back Arrow, Avatar, and Main Action Buttons */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.85rem',
        marginBottom: '1.25rem'
      }}>
        {/* Left: Student Identity & Prominent Batch Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', minWidth: 0, flex: '1 1 auto' }}>
          <button
            onClick={handleBack}
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
              color: 'var(--text-secondary)',
              flexShrink: 0
            }}
            title="Go Back"
          >
            <ArrowLeft size={18} />
          </button>

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
            fontSize: '1.05rem',
            flexShrink: 0
          }}>
            {localStudent.name.slice(0, 2).toUpperCase()}
          </div>

          <div style={{ minWidth: 0, flex: '1 1 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap', marginBottom: '0.2rem' }}>
              <h2 style={{ fontSize: 'clamp(1.15rem, 3vw, 1.4rem)', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                {localStudent.name}
              </h2>
              <span className={percentage >= 100 ? "status-pill status-paid" : percentage > 0 ? "status-pill status-partial" : "status-pill status-pending"} style={{ fontSize: '0.7rem' }}>
                {percentage >= 100 ? "Paid" : percentage > 0 ? "Partial" : "Pending"}
              </span>

              {/* Prominent Batch Name Badge */}
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                padding: '0.15rem 0.6rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--primary-50)',
                color: 'var(--primary-700)',
                border: '1px solid var(--primary-200)',
                fontSize: '0.74rem',
                fontWeight: 800,
                boxShadow: 'var(--shadow-xs)'
              }}>
                <School size={12} />
                <span>Batch: {localStudent.batch_name || 'Unassigned'}</span>
              </span>
            </div>

            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.25 }}>
              <strong style={{ color: 'var(--text-secondary)' }}>{localStudent.student_id || localStudent.registration_no || `STD${String(localStudent.id).padStart(3, '0')}`}</strong> • {localStudent.program_name} ({localStudent.group || 'General'})
            </div>
          </div>
        </div>

        {/* Action Buttons: Collect Payment, Download PDF, WhatsApp, Call, Edit */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.45rem',
          flexWrap: 'wrap',
          flexShrink: 0
        }}>
          <button
            onClick={() => handleCollect(localStudent)}
            className="btn btn-primary btn-sm"
            style={{ gap: '0.35rem', backgroundColor: '#2563EB', fontWeight: 700 }}
          >
            <CreditCard size={15} />
            <span>+ Collect Payment</span>
          </button>

          <button
            type="button"
            onClick={() => setShowStatementModal(true)}
            className="btn btn-secondary btn-sm"
            style={{ gap: '0.35rem', fontWeight: 700 }}
            title="Download Official 1-Page Student Fee Summary Statement (PDF)"
          >
            <Download size={14} />
            <span>Download PDF</span>
          </button>

          <button
            onClick={() => onOpenWhatsApp && onOpenWhatsApp(localStudent)}
            className="btn btn-whatsapp btn-sm"
            style={{ gap: '0.35rem' }}
            title="Send WhatsApp Message"
          >
            <MessageSquare size={15} />
            <span className="hide-mobile">WhatsApp</span>
          </button>

          {localStudent.primary_contact && (
            <a
              href={`tel:${localStudent.primary_contact}`}
              className="btn btn-primary btn-sm"
              style={{ gap: '0.35rem', textDecoration: 'none' }}
              title="Call Primary Contact"
            >
              <Phone size={15} />
              <span className="hide-mobile">Call</span>
            </a>
          )}

          <button
            onClick={() => setShowEditStudentModal(true)}
            className="btn btn-secondary btn-sm"
            style={{ gap: '0.35rem', fontWeight: 600 }}
            title="Edit student particulars, phone numbers, and reference"
          >
            <Edit size={14} />
            <span className="hide-mobile">Edit</span>
          </button>
        </div>
      </div>

      {/* Action feedback notification banner */}
      {actionFeedback && (
        <div style={{
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-md)',
          backgroundColor: actionFeedback.type === 'success' ? '#ECFDF5' : '#FEF2F2',
          border: `1px solid ${actionFeedback.type === 'success' ? '#A7F3D0' : '#FECACA'}`,
          color: actionFeedback.type === 'success' ? '#065F46' : '#991B1B',
          fontSize: '0.85rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '1rem',
          animation: 'fadeIn 0.2s ease'
        }}>
          <CheckCircle size={16} />
          <span>{actionFeedback.message}</span>
        </div>
      )}

      {/* Touch-Optimized Segmented Navigation Pills Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        overflowX: 'auto',
        paddingBottom: '0.65rem',
        marginBottom: '1.5rem',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }}>
        {[
          { id: 'overview', label: 'Overview', icon: Layers },
          { id: 'fee_structure', label: 'Fee Structure', icon: DollarSign },
          { id: 'payments', label: 'Payment Ledger', icon: CreditCard },
          { id: 'documents', label: 'Documents & IDs', icon: FileText },
          { id: 'contacts', label: 'Contacts & Ref', icon: Phone },
          { id: 'notes', label: 'Follow-up Notes', icon: MessageSquare }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.55rem 0.95rem',
                borderRadius: 'var(--radius-full)',
                border: isActive ? '1.5px solid var(--primary-600)' : '1px solid var(--border-light)',
                backgroundColor: isActive ? 'var(--primary-50)' : 'var(--bg-surface)',
                color: isActive ? 'var(--primary-700)' : 'var(--text-secondary)',
                fontSize: '0.82rem',
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                minHeight: 40,
                boxShadow: isActive ? '0 1px 3px rgba(37, 99, 235, 0.15)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <Icon size={15} style={{ color: isActive ? 'var(--primary-600)' : 'var(--text-muted)' }} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.25rem'
        }}>
          {/* Card 1: Personal Information */}
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-light)',
            padding: '1.25rem',
            boxShadow: 'var(--shadow-xs)'
          }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.65rem' }}>
              Student Information
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.84rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', paddingBottom: '0.45rem', borderBottom: '1px solid var(--border-light)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Full Name</span>
                <strong style={{ color: 'var(--text-primary)' }}>{localStudent.name}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', paddingBottom: '0.45rem', borderBottom: '1px solid var(--border-light)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Student / Roll ID</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
                  {localStudent.student_id || localStudent.registration_no || `STD${String(localStudent.id).padStart(3, '0')}`}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', paddingBottom: '0.45rem', borderBottom: '1px solid var(--border-light)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Hall Ticket No (Exam)</span>
                <span style={{ color: localStudent.hall_ticket_no ? 'var(--primary-700)' : 'var(--amber-text)', fontWeight: 700 }}>
                  {localStudent.hall_ticket_no || 'Pending Allocation'}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', paddingBottom: '0.45rem', borderBottom: '1px solid var(--border-light)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Program</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{localStudent.program_name}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', paddingBottom: '0.45rem', borderBottom: '1px solid var(--border-light)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Course Group</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{localStudent.group || 'N/A'}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', paddingBottom: '0.45rem', borderBottom: '1px solid var(--border-light)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Batch Cohort</span>
                <span style={{ color: 'var(--primary-700)', fontWeight: 800 }}>{localStudent.batch_name}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', paddingBottom: '0.45rem', borderBottom: '1px solid var(--border-light)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Study Center</span>
                <span style={{ color: 'var(--text-primary)' }}>{localStudent.center_code || 'Main Campus'}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', paddingBottom: '0.45rem', borderBottom: '1px solid var(--border-light)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Candidate Type</span>
                <span style={{ color: 'var(--text-primary)' }}>{localStudent.candidate_type || 'WITHOUT'}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', paddingBottom: '0.45rem', borderBottom: '1px solid var(--border-light)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Primary Contact</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{localStudent.primary_contact || 'N/A'}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ color: 'var(--text-muted)' }}>Reference Person</span>
                <span style={{ color: 'var(--text-primary)' }}>{localStudent.reference_name || 'Direct'}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Fee Status Circular Gauge */}
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-light)',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-xs)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, width: '100%', textAlign: 'left', color: 'var(--text-primary)' }}>
              Fee Payment Status
            </h3>

            {/* Circular Progress Gauge */}
            <div style={{ position: 'relative', width: 130, height: 130, margin: '1rem 0' }}>
              <svg width="130" height="130" viewBox="0 0 130 130">
                <circle
                  cx="65"
                  cy="65"
                  r={radius}
                  fill="none"
                  stroke="var(--border-light)"
                  strokeWidth="12"
                />
                <circle
                  cx="65"
                  cy="65"
                  r={radius}
                  fill="none"
                  stroke={percentage >= 100 ? '#10B981' : percentage > 0 ? '#F59E0B' : '#EF4444'}
                  strokeWidth="12"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  transform="rotate(-90 65 65)"
                  style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                />
              </svg>
              <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {percentage}%
                </span>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                  Paid
                </span>
              </div>
            </div>

            {/* Breakdown Numbers */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.82rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>• Total Assessed Fee</span>
                <strong style={{ color: 'var(--text-primary)' }}>
                  {isCaller ? '••••••' : formatCurrency(totalFee)}
                </strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>• Amount Paid</span>
                <strong style={{ color: 'var(--emerald-text)' }}>{formatCurrency(paidAmount)}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>• Outstanding Due</span>
                <strong style={{ color: balanceDue > 0 ? 'var(--rose-600)' : 'var(--emerald-text)' }}>
                  {formatCurrency(balanceDue)}
                </strong>
              </div>
            </div>

            <div style={{ marginTop: '0.75rem' }}>
              <span className={percentage >= 100 ? 'status-pill status-paid' : percentage > 0 ? 'status-pill status-partial' : 'status-pill status-pending'}>
                {percentage >= 100 ? 'Fully Paid' : percentage > 0 ? 'Partially Paid' : 'Pending Payment'}
              </span>
            </div>
          </div>

          {/* Card 3: Quick Actions */}
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-light)',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-xs)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.15rem', color: 'var(--text-primary)' }}>
              Quick Actions
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <button
                onClick={() => onRecordPayment(localStudent)}
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'flex-start' }}
              >
                <CreditCard size={16} />
                <span>Record Fee Payment</span>
              </button>

              <button
                onClick={() => onOpenWhatsApp(localStudent)}
                className="btn btn-whatsapp"
                style={{ width: '100%', justifyContent: 'flex-start' }}
              >
                <MessageSquare size={16} />
                <span>Send WhatsApp Due Reminder</span>
              </button>

              <button
                onClick={() => setShowAddLineItemModal(true)}
                className="btn btn-secondary"
                style={{ width: '100%', justifyContent: 'flex-start', color: 'var(--primary-600)' }}
              >
                <Plus size={16} />
                <span>+ Add Custom Fee Line Item</span>
              </button>

              <button
                onClick={() => onViewReceipt(localStudent)}
                className="btn"
                style={{
                  width: '100%',
                  justifyContent: 'flex-start',
                  backgroundColor: '#4F46E5',
                  color: '#FFFFFF'
                }}
              >
                <FileText size={16} />
                <span>Generate Official Receipt</span>
              </button>

              <button
                onClick={() => setActiveTab('fee_structure')}
                className="btn btn-secondary"
                style={{ width: '100%', justifyContent: 'flex-start' }}
              >
                <ExternalLink size={16} />
                <span>View Full Fee Breakdown</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PERSONALIZED FEE STRUCTURE */}
      {activeTab === 'fee_structure' && (
        <div className="card-compact" style={{
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-light)',
          padding: '1rem 1.25rem',
          boxShadow: 'var(--shadow-xs)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Personalized Fee Obligations for {localStudent.name}
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Individual fee structure tailored to this student's course tier, custom line items, and concessions.
              </p>
            </div>

            {!isCaller && (
              <button
                onClick={() => setShowAddLineItemModal(true)}
                className="btn btn-primary btn-sm"
                style={{ gap: '0.4rem' }}
              >
                <Plus size={15} />
                <span>+ Add Fee Head</span>
              </button>
            )}
          </div>

          {/* Academic Year Fee Blocks */}
          {(localStudent.year_fees || []).map((yf) => (
            <div
              key={yf.id}
              style={{
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                padding: '0.85rem 1rem',
                marginBottom: '1rem',
                backgroundColor: 'var(--bg-subtle)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Layers size={17} style={{ color: 'var(--primary-600)' }} />
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    Year {yf.year_index} Academic Obligation {yf.remarks ? `(${yf.remarks})` : ''}
                  </h4>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <div style={{ fontSize: '0.82rem' }}>
                    Total: <strong style={{ color: 'var(--text-primary)' }}>{isCaller ? '••••••' : formatCurrency(yf.total_billed)}</strong> |
                    Paid: <strong style={{ color: 'var(--emerald-text)' }}>{formatCurrency(yf.total_paid)}</strong> |
                    Due: <strong style={{ color: 'var(--rose-text)' }}>{formatCurrency(yf.balance_due)}</strong>
                  </div>
                  {!isCaller && (
                    <button
                      onClick={() => setEditingYearFee({
                        id: yf.id,
                        year_index: yf.year_index,
                        base_annual_fee: yf.base_annual_fee,
                        discount_amount: yf.discount_amount,
                        remarks: yf.remarks || ''
                      })}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem', gap: '0.3rem' }}
                      title="Adjust Base Tuition, Scholarship or Concession"
                    >
                      <Edit size={12} />
                      <span>Adjust Fee / Concession</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Table of Heads for this Year */}
              <div className="table-responsive">
                <table className="table-compact" style={{ width: '100%', minWidth: 480, borderCollapse: 'collapse', fontSize: '0.82rem', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-secondary)', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                      <th style={{ padding: '0.55rem 0.85rem', textAlign: 'left' }}>Fee Item</th>
                      <th style={{ padding: '0.55rem 0.85rem', textAlign: 'left' }}>Type</th>
                      <th style={{ padding: '0.55rem 0.85rem', textAlign: 'right' }}>Amount (₹)</th>
                      {!isCaller && <th style={{ padding: '0.55rem 0.85rem', textAlign: 'center', width: 80 }}>Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '0.6rem 0.85rem', fontWeight: 600 }}>Annual Base Tuition</td>
                      <td style={{ padding: '0.6rem 0.85rem', color: 'var(--text-muted)' }}>Mandatory Base</td>
                      <td style={{ padding: '0.6rem 0.85rem', textAlign: 'right', fontWeight: 700 }}>
                        {isCaller ? '••••••' : formatCurrency(yf.base_annual_fee)}
                      </td>
                      {!isCaller && (
                        <td style={{ padding: '0.6rem 0.85rem', textAlign: 'center' }}>
                          <button
                            onClick={() => setEditingYearFee({
                              id: yf.id,
                              year_index: yf.year_index,
                              base_annual_fee: yf.base_annual_fee,
                              discount_amount: yf.discount_amount,
                              remarks: yf.remarks || ''
                            })}
                            className="btn-icon"
                            style={{ padding: '0.2rem', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--primary-600)' }}
                            title="Edit Base Tuition"
                          >
                            <Edit size={13} />
                          </button>
                        </td>
                      )}
                    </tr>

                    {Number(yf.discount_amount) > 0 && (
                      <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--emerald-text)' }}>
                        <td style={{ padding: '0.6rem 0.85rem', fontWeight: 600 }}>Approved Discount / Scholarship</td>
                        <td style={{ padding: '0.6rem 0.85rem' }}>Concession</td>
                        <td style={{ padding: '0.6rem 0.85rem', textAlign: 'right', fontWeight: 700 }}>
                          - {formatCurrency(yf.discount_amount)}
                        </td>
                        {!isCaller && (
                          <td style={{ padding: '0.6rem 0.85rem', textAlign: 'center' }}>
                            <button
                              onClick={() => setEditingYearFee({
                                id: yf.id,
                                year_index: yf.year_index,
                                base_annual_fee: yf.base_annual_fee,
                                discount_amount: yf.discount_amount,
                                remarks: yf.remarks || ''
                              })}
                              className="btn-icon"
                              style={{ padding: '0.2rem', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--emerald-600)' }}
                              title="Modify Concession"
                            >
                              <Edit size={13} />
                            </button>
                          </td>
                        )}
                      </tr>
                    )}

                    {(yf.line_items || []).map((item) => (
                      <tr key={item.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td style={{ padding: '0.6rem 0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {item.title}
                        </td>
                        <td style={{ padding: '0.6rem 0.85rem' }}>
                          <span style={{
                            padding: '0.12rem 0.45rem',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.68rem',
                            fontWeight: 600,
                            backgroundColor: item.is_optional ? '#FEF3C7' : '#EFF6FF',
                            color: item.is_optional ? '#92400E' : '#1D4ED8'
                          }}>
                            {item.is_optional ? 'Optional Charge' : 'Institutional Line Item'}
                          </span>
                        </td>
                        <td style={{ padding: '0.6rem 0.85rem', textAlign: 'right', fontWeight: 700 }}>
                          {formatCurrency(item.amount)}
                        </td>
                        {!isCaller && (
                          <td style={{ padding: '0.6rem 0.85rem', textAlign: 'center' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                              <button
                                onClick={() => setEditingLineItem(item)}
                                className="btn-icon"
                                style={{ padding: '0.2rem', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--primary-600)' }}
                                title="Edit Fee Head"
                              >
                                <Edit size={13} />
                              </button>
                              <button
                                onClick={() => handleDeleteLineItem(item)}
                                className="btn-icon"
                                style={{ padding: '0.2rem', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--rose-600)' }}
                                title="Delete Fee Head"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          {(!localStudent.year_fees || localStudent.year_fees.length === 0) && (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No custom fee breakdown configured for this student yet. Click "+ Add Fee Head" above to add one.
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PAYMENT LEDGER */}
      {activeTab === 'payments' && (
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-light)',
          padding: '1.5rem',
          boxShadow: 'var(--shadow-xs)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Payment Transaction Ledger
            </h3>
            <button
              onClick={() => onRecordPayment(localStudent)}
              className="btn btn-primary btn-sm"
              style={{ gap: '0.4rem' }}
            >
              <CreditCard size={15} />
              <span>+ Record Payment</span>
            </button>
          </div>

          {/* All payments from year fees */}
          {(() => {
            const allPayments = [];
            (localStudent.year_fees || []).forEach((yf) => {
              (yf.payments || []).forEach((p) => {
                allPayments.push({ ...p, year_index: yf.year_index });
              });
            });

            if (allPayments.length === 0) {
              return (
                <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No payment transactions recorded for this student yet.
                </div>
              );
            }

            return (
              <div className="table-responsive">
                <table style={{ width: '100%', minWidth: 540, borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-light)', color: 'var(--text-secondary)', fontSize: '0.74rem', textTransform: 'uppercase' }}>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Date</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Year / Period</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Payment Mode</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Ref / Remarks</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Amount (₹)</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allPayments.map((p) => (
                      <tr key={p.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>{p.payment_date || 'N/A'}</td>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Year {p.year_index}</td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <span style={{
                            padding: '0.2rem 0.55rem',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            backgroundColor: p.payment_mode === 'CASH' ? '#DCFCE7' : '#EDE9FE',
                            color: p.payment_mode === 'CASH' ? '#15803D' : '#6D28D9'
                          }}>
                            {p.payment_mode}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>
                          {p.transaction_ref ? `Ref: ${p.transaction_ref}` : p.notes || '—'}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 800, color: 'var(--emerald-text)' }}>
                          {formatCurrency(p.amount)}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                            <button
                              onClick={() => onViewReceipt && onViewReceipt(localStudent)}
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '0.25rem 0.45rem', fontSize: '0.73rem' }}
                              title="View Receipt"
                            >
                              <FileText size={12} />
                              <span>Receipt</span>
                            </button>
                            <button
                              onClick={() => setEditingPayment(p)}
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '0.25rem 0.45rem', fontSize: '0.73rem', color: 'var(--primary-600)' }}
                              title="Edit Payment Transaction"
                            >
                              <Edit size={12} />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleDeletePayment(p)}
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '0.25rem 0.45rem', fontSize: '0.73rem', color: 'var(--rose-600)' }}
                              title="Delete Transaction (Restores Balance)"
                            >
                              <Trash2 size={12} />
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })()}
        </div>
      )}

      {/* TAB 4: DOCUMENTS & IDS */}
      {activeTab === 'documents' && (
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-light)',
          padding: '1.5rem',
          boxShadow: 'var(--shadow-xs)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Institutional Registration & Exam Ticket Mapping
              </h3>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
                Center codes and examination tickets mapped for AP Open School and university colleges.
              </p>
            </div>
            <button
              onClick={() => setShowEditStudentModal(true)}
              className="btn btn-secondary btn-sm"
              style={{ gap: '0.4rem', fontWeight: 600 }}
            >
              <Edit size={14} />
              <span>Edit IDs & Ticket Mapping</span>
            </button>
          </div>

          {/* Ticket Mapping Formula Info Banner */}
          <div style={{
            padding: '0.85rem 1rem',
            backgroundColor: 'var(--primary-50)',
            border: '1px solid var(--primary-200)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.5rem'
          }}>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-800)' }}>
                Hall Ticket & Roll ID Auto-Mapping Architecture
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--primary-700)', marginTop: '0.2rem' }}>
                Format: <code>[Batch Code: {localStudent.batch_name || '26A'}][Center: {localStudent.center_code || '106'}][Group: {localStudent.group || 'GEN'}][Roll: {String(localStudent.id).padStart(3, '0')}]</code>
              </div>
            </div>
            <span style={{
              padding: '0.25rem 0.65rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.74rem',
              fontWeight: 800,
              backgroundColor: 'var(--primary-600)',
              color: '#FFFFFF'
            }}>
              Active Ticket: {localStudent.hall_ticket_no || localStudent.student_id || 'Not Mapped'}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Provisional Admission / Reg No</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, marginTop: '0.25rem', color: 'var(--text-primary)' }}>
                {localStudent.registration_no || cf.provisional_no || 'Not registered'}
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Institutional Admission Number</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, marginTop: '0.25rem', color: localStudent.admission_no ? 'var(--text-primary)' : 'var(--amber-text)' }}>
                {localStudent.admission_no || 'Pending Allocation (Future Issue)'}
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Board / University Hall Ticket No</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, marginTop: '0.25rem', color: localStudent.hall_ticket_no ? 'var(--text-primary)' : 'var(--amber-text)' }}>
                {localStudent.hall_ticket_no || 'Pending Examination (Future Issue)'}
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>DEB Enrolment ID</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, marginTop: '0.25rem', color: 'var(--text-primary)' }}>
                {cf.deb || '—'}
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Center Code & Name</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, marginTop: '0.25rem', color: 'var(--text-primary)' }}>
                {localStudent.center_code || localStudent.center_name || 'Main Campus'}
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Candidate Cohort Type</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, marginTop: '0.25rem', color: 'var(--text-primary)' }}>
                {localStudent.candidate_type || 'WITHOUT'}
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Admission Status</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, marginTop: '0.25rem', color: 'var(--text-primary)' }}>
                {localStudent.admission_status || 'Submitted'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: CONTACTS & REFERENCE */}
      {activeTab === 'contacts' && (
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-light)',
          padding: '1.5rem',
          boxShadow: 'var(--shadow-xs)'
        }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
            Student Contacts & Reference Person Details
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {/* Student Contacts */}
            <div style={{ border: '1px solid var(--border-light)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.85rem' }}>Direct Contacts</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>Primary Phone</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                    <strong>{localStudent.primary_contact || 'N/A'}</strong>
                    {localStudent.primary_contact && (
                      <button
                        onClick={() => onOpenWhatsApp(localStudent)}
                        className="btn btn-whatsapp btn-sm"
                        style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}
                      >
                        WhatsApp
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>Secondary / Parent Phone</span>
                  <strong>{localStudent.secondary_contact || 'None'}</strong>
                </div>
              </div>
            </div>

            {/* Reference Person */}
            <div style={{ border: '1px solid var(--border-light)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.85rem' }}>Reference Person</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>Reference Name</span>
                  <strong>{localStudent.reference_name || 'Direct Admission / None'}</strong>
                </div>

                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>Reference Phone</span>
                  <strong>{localStudent.reference_phone || 'N/A'}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: FOLLOW-UP NOTES */}
      {activeTab === 'notes' && (
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-light)',
          padding: '1.5rem',
          boxShadow: 'var(--shadow-xs)'
        }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
            Follow-Up & Administrative Remarks
          </h3>

          <form onSubmit={handleAddNoteSubmit} style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '0.65rem' }}>
              <input
                type="text"
                placeholder="Add a payment follow-up note, promised payment date, or calling log..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                style={{
                  flex: 1,
                  padding: '0.6rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-light)',
                  backgroundColor: 'var(--bg-subtle)',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              />
              <button type="submit" className="btn btn-primary btn-sm">
                Add Note
              </button>
            </div>
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {notesList.map((n) => (
              <div
                key={n.id}
                style={{
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-subtle)',
                  border: '1px solid var(--border-light)',
                  fontSize: '0.84rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  <span>Logged by: <strong>{n.author}</strong></span>
                  <span>{n.date}</span>
                </div>
                <div style={{ color: 'var(--text-primary)' }}>{n.text}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Add Custom Fee Line Item */}
      {showAddLineItemModal && (
        <div className="modal-overlay" onClick={() => setShowAddLineItemModal(false)}>
          <div className="modal-card" style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Add Custom Fee Head</h3>
            </div>
            <form onSubmit={handleAddLineItem}>
              <div className="modal-body">
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Academic Year / Period
                  </label>
                  <select
                    value={itemYearIndex}
                    onChange={(e) => setItemYearIndex(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-light)',
                      fontSize: '0.85rem',
                      outline: 'none'
                    }}
                  >
                    <option value={1}>Year 1</option>
                    {localStudent.duration_years >= 2 && <option value={2}>Year 2</option>}
                    {localStudent.duration_years >= 3 && <option value={3}>Year 3</option>}
                  </select>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Fee Item Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Lab Practical, University Exam, Center Fee"
                    value={itemTitle}
                    onChange={(e) => setItemTitle(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-light)',
                      fontSize: '0.85rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Amount (₹) *
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 2500"
                    value={itemAmount}
                    onChange={(e) => setItemAmount(e.target.value)}
                    required
                    min={1}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-light)',
                      fontSize: '0.85rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setShowAddLineItemModal(false)}
                  className="btn btn-secondary"
                  disabled={lineItemLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={lineItemLoading}
                >
                  {lineItemLoading ? 'Saving...' : 'Add Line Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {showEditStudentModal && (
        <EditStudentModal
          isOpen={showEditStudentModal}
          student={localStudent}
          batches={batches}
          onClose={() => setShowEditStudentModal(false)}
          onStudentUpdated={(updated) => {
            setLocalStudent(updated);
            if (onStudentUpdated) onStudentUpdated(updated);
            setShowEditStudentModal(false);
            setActionFeedback({
              type: 'success',
              message: `Student details for ${updated.name} updated successfully!`
            });
            setTimeout(() => setActionFeedback(null), 4000);
          }}
        />
      )}

      {/* Modal: Edit Fee Line Item */}
      {editingLineItem && (
        <div className="modal-overlay" onClick={() => setEditingLineItem(null)}>
          <div className="modal-card" style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Edit Custom Fee Head</h3>
            </div>
            <form onSubmit={handleEditLineItemSubmit}>
              <div className="modal-body">
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Fee Item Name *
                  </label>
                  <input
                    type="text"
                    value={editingLineItem.title}
                    onChange={(e) => setEditingLineItem({ ...editingLineItem, title: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-light)',
                      fontSize: '0.85rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Amount (₹) *
                  </label>
                  <input
                    type="number"
                    value={editingLineItem.amount}
                    onChange={(e) => setEditingLineItem({ ...editingLineItem, amount: e.target.value })}
                    required
                    min={1}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-light)',
                      fontSize: '0.85rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    id="edit_is_optional"
                    checked={Boolean(editingLineItem.is_optional)}
                    onChange={(e) => setEditingLineItem({ ...editingLineItem, is_optional: e.target.checked })}
                  />
                  <label htmlFor="edit_is_optional" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    Optional / Non-Mandatory Charge
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setEditingLineItem(null)}
                  className="btn btn-secondary"
                  disabled={editLineItemLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={editLineItemLoading}
                >
                  {editLineItemLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Academic Year Fee Structure */}
      {editingYearFee && (
        <div className="modal-overlay" onClick={() => setEditingYearFee(null)}>
          <div className="modal-card" style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Adjust Year {editingYearFee.year_index} Fee Structure</h3>
            </div>
            <form onSubmit={handleEditYearFeeSubmit}>
              <div className="modal-body">
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Base Annual Tuition Fee (₹) *
                  </label>
                  <input
                    type="number"
                    value={editingYearFee.base_annual_fee}
                    onChange={(e) => setEditingYearFee({ ...editingYearFee, base_annual_fee: e.target.value })}
                    required
                    min={0}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-light)',
                      fontSize: '0.85rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Approved Discount / Scholarship / Concession (₹)
                  </label>
                  <input
                    type="number"
                    value={editingYearFee.discount_amount}
                    onChange={(e) => setEditingYearFee({ ...editingYearFee, discount_amount: e.target.value })}
                    min={0}
                    placeholder="0"
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-light)',
                      fontSize: '0.85rem',
                      outline: 'none'
                    }}
                  />
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Concession is automatically deducted from Year {editingYearFee.year_index} total.
                  </span>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Scholarship / Fee Revision Remarks
                  </label>
                  <input
                    type="text"
                    value={editingYearFee.remarks}
                    onChange={(e) => setEditingYearFee({ ...editingYearFee, remarks: e.target.value })}
                    placeholder="e.g. Merit Concession, Sports Quota, Sibling Discount"
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-light)',
                      fontSize: '0.85rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setEditingYearFee(null)}
                  className="btn btn-secondary"
                  disabled={editYearFeeLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={editYearFeeLoading}
                >
                  {editYearFeeLoading ? 'Saving...' : 'Update Obligation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Payment Modal */}
      {editingPayment && (
        <EditPaymentModal
          payment={editingPayment}
          studentId={localStudent.id}
          onClose={() => setEditingPayment(null)}
          onPaymentUpdated={async () => {
            await handleReloadStudent();
            setActionFeedback({
              type: 'success',
              message: 'Payment transaction updated successfully! Recalculated fee balances.'
            });
            setTimeout(() => setActionFeedback(null), 4000);
          }}
        />
      )}

      {/* Official 1-Page Student Fee Summary Statement (PDF Modal) */}
      {showStatementModal && (
        <StudentFeeStatementModal
          student={localStudent}
          onClose={() => setShowStatementModal(false)}
        />
      )}
    </div>
  );
}
