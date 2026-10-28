import React, { useState, useEffect } from 'react';
import {
  X, UserPlus, AlertCircle, Check, Users, Building,
  Phone, DollarSign, Award, BookOpen, Layers, Ticket, Plus
} from 'lucide-react';
import { api } from '../services/api';

export default function AddStudentModal({
  batches = [],
  programs = [],
  initialBatchId = null,
  onClose,
  onStudentCreated
}) {
  const [name, setName] = useState('');
  const [batchId, setBatchId] = useState(initialBatchId || (batches[0]?.id ? String(batches[0].id) : ''));
  const [isBatchLocked, setIsBatchLocked] = useState(Boolean(initialBatchId && initialBatchId !== 'all'));

  useEffect(() => {
    if (initialBatchId && initialBatchId !== 'all') {
      setBatchId(String(initialBatchId));
      setIsBatchLocked(true);
    }
  }, [initialBatchId]);

  const [studentId, setStudentId] = useState('');
  const [hallTicketNo, setHallTicketNo] = useState('');
  const [registrationNo, setRegistrationNo] = useState('');
  const [candidateType, setCandidateType] = useState('WITHOUT');
  const [centerId, setCenterId] = useState('');
  const [group, setGroup] = useState('');
  const [primaryContact, setPrimaryContact] = useState('');
  const [secondaryContact, setSecondaryContact] = useState('');
  const [referenceId, setReferenceId] = useState('');
  const [isAddingNewRef, setIsAddingNewRef] = useState(false);
  const [newRefName, setNewRefName] = useState('');
  const [newRefPhone, setNewRefPhone] = useState('');
  const [baseFee, setBaseFee] = useState('');
  const [notes, setNotes] = useState('');

  // Dropdown options
  const [centersList, setCentersList] = useState([]);
  const [referencesList, setReferencesList] = useState([]);
  const [loadingMetadata, setLoadingMetadata] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Inline Center quick creation
  const [showAddCenter, setShowAddCenter] = useState(false);
  const [newCenterCode, setNewCenterCode] = useState('');
  const [newCenterName, setNewCenterName] = useState('');
  const [centerSubmitting, setCenterSubmitting] = useState(false);

  // Load centers and references
  const loadResources = async () => {
    try {
      const [cData, rData] = await Promise.all([
        api.getCenters(),
        api.getReferences()
      ]);
      setCentersList(cData || []);
      setReferencesList(rData || []);
      if (cData && cData.length > 0 && !centerId) {
        setCenterId(String(cData[0].id));
      }
    } catch (e) {
      console.error('Failed to load centers/references:', e);
    } finally {
      setLoadingMetadata(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, []);

  // Selected batch object
  const currentBatch = batches.find((b) => String(b.id) === String(batchId));

  // Dynamic Ticket & Roll ID Auto-Mapping when Batch, Center, or Group changes
  useEffect(() => {
    if (!batchId) return;
    const selected = batches.find((b) => String(b.id) === String(batchId));
    if (selected) {
      const batchPrefix = (selected.batch_name || '26A').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      const selectedCenter = centersList.find((c) => String(c.id) === String(centerId));
      const centerCode = (selectedCenter?.code || '106').replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase();
      const groupCode = (group || 'BA').replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase() || 'BA';
      const nextNum = (selected.student_count || 0) + 1;
      const serial = String(nextNum).padStart(3, '0');

      const mappedCode = `${batchPrefix}${centerCode}${groupCode}${serial}`;

      setStudentId(mappedCode);
      if (!hallTicketNo) {
        setHallTicketNo(mappedCode);
      }

      // Auto-populate default base fee if set
      if (selected.default_base_fee && Number(selected.default_base_fee) > 0 && !baseFee) {
        setBaseFee(String(selected.default_base_fee));
      }

      // Check candidate types
      if (selected.candidate_types && Array.isArray(selected.candidate_types) && selected.candidate_types.length > 0) {
        if (!selected.candidate_types.includes(candidateType)) {
          setCandidateType(selected.candidate_types[0]);
        }
      }
    }
  }, [batchId, centerId, group, batches, centersList]);

  // Quick Create Center Inline
  const handleQuickCreateCenter = async (e) => {
    e.preventDefault();
    if (!newCenterCode.trim()) return;
    setCenterSubmitting(true);
    try {
      const created = await api.createCenter({
        code: newCenterCode.trim(),
        name: newCenterName.trim() || newCenterCode.trim()
      });
      await loadResources();
      setCenterId(String(created.id));
      setNewCenterCode('');
      setNewCenterName('');
      setShowAddCenter(false);
    } catch (err) {
      setError(err.message || 'Failed to create center.');
    } finally {
      setCenterSubmitting(false);
    }
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Student full name is required.');
      return;
    }
    if (!batchId) {
      setError('Please select an academic cohort / batch.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const payload = {
        name: name.trim(),
        batch: Number(batchId),
        student_id: studentId.trim() || undefined,
        hall_ticket_no: hallTicketNo.trim() || undefined,
        registration_no: registrationNo.trim() || undefined,
        candidate_type: candidateType,
        center: centerId ? Number(centerId) : null,
        group: group.trim(),
        primary_contact: primaryContact.trim(),
        secondary_contact: secondaryContact.trim(),
        base_annual_fee: baseFee ? Number(baseFee) : 0,
        admission_status: 'Submitted',
      };

      if (isAddingNewRef && newRefName.trim()) {
        payload.new_reference_name = newRefName.trim();
        payload.new_reference_phone = newRefPhone.trim();
      } else if (referenceId) {
        payload.reference = Number(referenceId);
      }

      const res = await api.createStudent(payload);
      if (onStudentCreated) {
        onStudentCreated(res.student || res);
      }
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to create student. Please verify all fields.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: '1rem',
        animation: 'fadeIn 0.2s ease'
      }}
    >
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          width: '100%',
          maxWidth: 680,
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--border-light)',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '1.2rem 1.5rem',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--bg-subtle)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--primary-50)',
              color: 'var(--primary-600)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <UserPlus size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Enroll New Student
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.15rem 0 0 0' }}>
                Auto-maps exam hall ticket, study center, course group & initializes Year 1 fee
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: '0.4rem',
              borderRadius: 'var(--radius-sm)'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div style={{
            margin: '1rem 1.5rem 0',
            padding: '0.75rem 1rem',
            backgroundColor: 'var(--rose-50)',
            border: '1px solid var(--rose-100)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--rose-text)',
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', overflowY: 'auto', flex: 1 }}>
            
            {/* Row 1: Full Name & Batch Cohort */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Student Full Name <span style={{ color: 'var(--rose-text)' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. K. Rajesh Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-light)',
                    fontSize: '0.85rem',
                    color: 'var(--text-primary)',
                    backgroundColor: 'var(--bg-surface)',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Academic Batch / Program <span style={{ color: 'var(--rose-text)' }}>*</span>
                </label>
                {isBatchLocked && currentBatch ? (
                  <div style={{
                    padding: '0.45rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--primary-50)',
                    border: '1.5px solid var(--primary-200)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.5rem'
                  }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--primary-900)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {currentBatch.batch_name} — {currentBatch.program_name || currentBatch.program_code}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--primary-600)', fontWeight: 600 }}>
                        Cohort Year: {currentBatch.academic_year || '2026-2027'}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsBatchLocked(false)}
                      style={{
                        background: 'transparent',
                        border: '1px solid var(--primary-300)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--primary-700)',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.5rem',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <select
                    required
                    value={batchId}
                    onChange={(e) => setBatchId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-light)',
                      fontSize: '0.85rem',
                      color: 'var(--text-primary)',
                      backgroundColor: 'var(--bg-surface)',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="">Select Batch...</option>
                    {batches.map((b) => (
                      <option key={b.id} value={String(b.id)}>
                        {b.batch_name} — {b.program_name || b.program_code} ({b.academic_year})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Row 2: Study Center & Course Group */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', margin: 0 }}>
                    Study Center / Branch
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowAddCenter(!showAddCenter)}
                    style={{ background: 'none', border: 'none', color: 'var(--primary-600)', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    {showAddCenter ? 'Close' : '+ Add Center'}
                  </button>
                </div>
                <select
                  value={centerId}
                  onChange={(e) => setCenterId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-light)',
                    fontSize: '0.85rem',
                    color: 'var(--text-primary)',
                    backgroundColor: 'var(--bg-surface)',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {centersList.map((c) => (
                    <option key={c.id} value={String(c.id)}>
                      {c.code || c.name} {c.name && c.name !== c.code ? `(${c.name})` : ''}
                    </option>
                  ))}
                </select>

                {/* Inline Quick Add Center */}
                {showAddCenter && (
                  <div style={{ marginTop: '0.4rem', padding: '0.5rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', display: 'flex', gap: '0.4rem' }}>
                    <input
                      type="text"
                      placeholder="Code (e.g. 142-KK)"
                      value={newCenterCode}
                      onChange={(e) => setNewCenterCode(e.target.value)}
                      style={{ flex: 1, padding: '0.3rem 0.5rem', fontSize: '0.75rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-light)' }}
                    />
                    <input
                      type="text"
                      placeholder="Name"
                      value={newCenterName}
                      onChange={(e) => setNewCenterName(e.target.value)}
                      style={{ flex: 1, padding: '0.3rem 0.5rem', fontSize: '0.75rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-light)' }}
                    />
                    <button
                      type="button"
                      onClick={handleQuickCreateCenter}
                      disabled={centerSubmitting}
                      className="btn btn-primary btn-sm"
                      style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}
                    >
                      {centerSubmitting ? '...' : 'Add'}
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Specialization / Course Group
                </label>
                <input
                  type="text"
                  placeholder="e.g. B.A, B.Com, B.Sc Comp, MPC"
                  value={group}
                  onChange={(e) => setGroup(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-light)',
                    fontSize: '0.85rem',
                    color: 'var(--text-primary)',
                    backgroundColor: 'var(--bg-surface)',
                    outline: 'none'
                  }}
                />

                {/* Course Group Quick Suggestions tailored to program */}
                {(() => {
                  const progCode = currentBatch?.program_code;
                  const suggestions =
                    progCode === 'DEGREE' ? ['B.A', 'B.Com', 'B.Sc (Comp)', 'BBA'] :
                    progCode === 'PG' ? ['M.A', 'M.Com', 'M.Sc (Comp)', 'MBA'] :
                    progCode === 'INTER' ? ['MPC', 'BiPC', 'CEC', 'HEC'] :
                    progCode === 'SSC' ? ['SSC 10th General'] : ['B.A', 'B.Com', 'MPC'];

                  return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flexWrap: 'wrap', marginTop: '0.35rem' }}>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>Quick:</span>
                      {suggestions.map((sug) => (
                        <button
                          key={sug}
                          type="button"
                          onClick={() => setGroup(sug)}
                          style={{
                            padding: '0.12rem 0.45rem',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.68rem',
                            fontWeight: group === sug ? 800 : 600,
                            backgroundColor: group === sug ? 'var(--primary-600)' : 'var(--bg-subtle)',
                            color: group === sug ? '#FFFFFF' : 'var(--text-secondary)',
                            border: group === sug ? '1px solid var(--primary-600)' : '1px solid var(--border-light)',
                            cursor: 'pointer'
                          }}
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Row 3: Auto-Mapped Ticket & Roll Code Banner */}
            <div style={{
              marginBottom: '1rem',
              backgroundColor: '#F8FAFC',
              border: '1.5px solid #E2E8F0',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem 1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary-700)' }}>
                  <Ticket size={16} />
                  <span>Exam Hall Ticket & Student Roll Auto-Mapping</span>
                </div>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#047857', backgroundColor: '#ECFDF5', padding: '0.15rem 0.45rem', borderRadius: 'var(--radius-full)' }}>
                  ⚡ Auto-Mapped from Batch + Center + Group
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                    Student Roll ID / Code
                  </label>
                  <input
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.45rem 0.65rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-light)',
                      fontSize: '0.85rem',
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      color: 'var(--primary-700)',
                      backgroundColor: 'var(--bg-surface)'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                    Board / University Hall Ticket No
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 26A106BA058"
                    value={hallTicketNo}
                    onChange={(e) => setHallTicketNo(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.45rem 0.65rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-light)',
                      fontSize: '0.85rem',
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      color: '#065F46',
                      backgroundColor: 'var(--bg-surface)'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Row 4: Candidate Type Selection */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Candidate Type <span style={{ color: 'var(--rose-text)' }}>*</span>
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setCandidateType('WITHOUT')}
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    border: candidateType === 'WITHOUT' ? '2px solid var(--primary-600)' : '1px solid var(--border-light)',
                    backgroundColor: candidateType === 'WITHOUT' ? 'var(--primary-50)' : 'var(--bg-surface)',
                    color: candidateType === 'WITHOUT' ? 'var(--primary-700)' : 'var(--text-secondary)',
                    cursor: 'pointer'
                  }}
                >
                  WITHOUT (Direct/Exam)
                </button>
                <button
                  type="button"
                  onClick={() => setCandidateType('WITH')}
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    border: candidateType === 'WITH' ? '2px solid #059669' : '1px solid var(--border-light)',
                    backgroundColor: candidateType === 'WITH' ? '#ECFDF5' : 'var(--bg-surface)',
                    color: candidateType === 'WITH' ? '#047857' : 'var(--text-secondary)',
                    cursor: 'pointer'
                  }}
                >
                  WITH (Classes & Material)
                </button>
              </div>
            </div>

            {/* Row 5: Phone Numbers (Primary & Secondary) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Primary Contact (WhatsApp)
                </label>
                <div style={{ position: 'relative' }}>
                  <Phone size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="tel"
                    placeholder="10-digit mobile number"
                    value={primaryContact}
                    onChange={(e) => setPrimaryContact(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem 0.55rem 2.15rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-light)',
                      fontSize: '0.85rem',
                      color: 'var(--text-primary)',
                      backgroundColor: 'var(--bg-surface)',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Secondary / Parent Contact
                </label>
                <div style={{ position: 'relative' }}>
                  <Phone size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="tel"
                    placeholder="Alternative phone"
                    value={secondaryContact}
                    onChange={(e) => setSecondaryContact(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem 0.55rem 2.15rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-light)',
                      fontSize: '0.85rem',
                      color: 'var(--text-primary)',
                      backgroundColor: 'var(--bg-surface)',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Row 6: Reference Contact */}
            <div style={{
              marginBottom: '1rem',
              padding: '1rem',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-light)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  Reference Contact / Agent
                </label>
                <button
                  type="button"
                  onClick={() => setIsAddingNewRef(!isAddingNewRef)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary-600)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}
                >
                  <Plus size={13} />
                  <span>{isAddingNewRef ? 'Select Existing Reference' : 'Create New Reference Person'}</span>
                </button>
              </div>

              {!isAddingNewRef ? (
                <select
                  value={referenceId}
                  onChange={(e) => setReferenceId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-light)',
                    fontSize: '0.85rem',
                    color: 'var(--text-primary)',
                    backgroundColor: 'var(--bg-surface)',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">Direct Admission (No Reference)</option>
                  {referencesList.map((r) => (
                    <option key={r.id} value={String(r.id)}>
                      {r.name} {r.designation ? `(${r.designation})` : ''} {r.phone ? `— ${r.phone}` : ''}
                    </option>
                  ))}
                </select>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.65rem', animation: 'fadeIn 0.2s ease' }}>
                  <input
                    type="text"
                    placeholder="Reference Person Name"
                    value={newRefName}
                    onChange={(e) => setNewRefName(e.target.value)}
                    style={{
                      padding: '0.45rem 0.65rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-light)',
                      fontSize: '0.82rem',
                      backgroundColor: 'var(--bg-surface)',
                      color: 'var(--text-primary)'
                    }}
                  />
                  <input
                    type="tel"
                    placeholder="Reference Phone / WhatsApp"
                    value={newRefPhone}
                    onChange={(e) => setNewRefPhone(e.target.value)}
                    style={{
                      padding: '0.45rem 0.65rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-light)',
                      fontSize: '0.82rem',
                      backgroundColor: 'var(--bg-surface)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>
              )}
            </div>

            {/* Row 7: Base Tuition Fee Initialization */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Initial Year 1 Tuition Fee Obligation (₹)
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: 'var(--text-muted)' }}>
                  ₹
                </span>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 18000"
                  value={baseFee}
                  onChange={(e) => setBaseFee(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem 0.55rem 1.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-light)',
                    fontSize: '0.85rem',
                    color: 'var(--text-primary)',
                    backgroundColor: 'var(--bg-surface)',
                    outline: 'none'
                  }}
                />
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                You can add discounts, additional examination fees, or coaching line items later anytime.
              </span>
            </div>

          </div>

          {/* Footer Controls */}
          <div style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            backgroundColor: 'var(--bg-subtle)'
          }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              style={{ minWidth: 140, justifyContent: 'center' }}
            >
              {submitting ? 'Enrolling...' : '+ Enroll Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
