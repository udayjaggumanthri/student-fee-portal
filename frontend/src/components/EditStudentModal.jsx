import React, { useState, useEffect } from 'react';
import {
  X, User, Phone, BookOpen, Layers, MapPin, UserPlus,
  AlertCircle, Plus, Sparkles, Building, CheckCircle
} from 'lucide-react';
import { api } from '../services/api';

export default function EditStudentModal({
  isOpen,
  student,
  batches = [],
  onClose,
  onStudentUpdated
}) {
  const [name, setName] = useState(student?.name || '');
  const [studentId, setStudentId] = useState(student?.student_id || '');
  const [registrationNo, setRegistrationNo] = useState(student?.registration_no || '');
  const [hallTicketNo, setHallTicketNo] = useState(student?.hall_ticket_no || '');
  const [group, setGroup] = useState(student?.group || '');
  const [candidateType, setCandidateType] = useState(student?.candidate_type || 'WITHOUT');
  const [primaryContact, setPrimaryContact] = useState(student?.primary_contact || '');
  const [secondaryContact, setSecondaryContact] = useState(student?.secondary_contact || '');
  const [batchId, setBatchId] = useState(student?.batch ? String(student.batch) : '');
  const [centerId, setCenterId] = useState(student?.center ? String(student.center) : '');
  const [referenceId, setReferenceId] = useState(student?.reference ? String(student.reference) : '');

  // References, Centers, and Batches lists
  const [references, setReferences] = useState([]);
  const [centers, setCenters] = useState([]);
  const [batchList, setBatchList] = useState(batches);

  // Inline "Add New Center" form
  const [showNewCenterForm, setShowNewCenterForm] = useState(false);
  const [newCenterCode, setNewCenterCode] = useState('');
  const [newCenterName, setNewCenterName] = useState('');
  const [newCenterPhone, setNewCenterPhone] = useState('');
  const [savingCenter, setSavingCenter] = useState(false);

  // Show inline "Add New Universal Reference" fields
  const [showNewRefInput, setShowNewRefInput] = useState(false);
  const [newRefName, setNewRefName] = useState('');
  const [newRefPhone, setNewRefPhone] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (student) {
      setName(student.name || '');
      setStudentId(student.student_id || '');
      setRegistrationNo(student.registration_no || '');
      setHallTicketNo(student.hall_ticket_no || '');
      setGroup(student.group || '');
      setCandidateType(student.candidate_type || 'WITHOUT');
      setPrimaryContact(student.primary_contact || '');
      setSecondaryContact(student.secondary_contact || '');
      setBatchId(student.batch ? String(student.batch) : '');
      setCenterId(student.center ? String(student.center) : '');
      setReferenceId(student.reference ? String(student.reference) : '');
    }
  }, [student]);

  useEffect(() => {
    if (isOpen) {
      Promise.all([
        api.getReferences(),
        api.getCenters(),
        api.getBatches()
      ]).then(([refData, centerData, batchData]) => {
        setReferences(refData || []);
        setCenters(centerData || []);
        if (batchData && batchData.length > 0) {
          setBatchList(batchData);
        }
      }).catch(err => console.error(err));
    }
  }, [isOpen]);

  if (!isOpen || !student) return null;

  // Auto-map Hall Ticket & Roll ID formula based on Batch, Center, Group, and Roll Serial
  const handleAutoMapTicket = () => {
    const selectedB = batchList.find(b => String(b.id) === String(batchId));
    const selectedC = centers.find(c => String(c.id) === String(centerId));

    // Batch code e.g. "26A"
    const batchCode = selectedB?.batch_name ? selectedB.batch_name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 4) : '26A';
    // Center code e.g. "106- JK" -> "106"
    const centerDigits = selectedC?.code ? selectedC.code.replace(/[^0-9]/g, '') || selectedC.code.slice(0, 3) : '106';
    // Group e.g. "BA" or "BSC" or "BCOM"
    const grpCode = group ? group.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 4) : 'GEN';
    // Serial: 3 digits
    const serial = String(student.id || 1).padStart(3, '0');

    const mappedCode = `${batchCode}${centerDigits}${grpCode}${serial}`;
    setStudentId(mappedCode);
    setHallTicketNo(mappedCode);
  };

  // Quick save new study center
  const handleCreateCenter = async (e) => {
    e.preventDefault();
    if (!newCenterCode.trim() && !newCenterName.trim()) {
      alert('Please enter center code or name.');
      return;
    }
    setSavingCenter(true);
    try {
      const code = newCenterCode.trim() || newCenterName.trim();
      const cName = newCenterName.trim() || code;
      const created = await api.createCenter({
        code: code,
        name: cName,
        contact_number: newCenterPhone.trim()
      });
      setCenters(prev => [...prev, created]);
      setCenterId(String(created.id));
      setShowNewCenterForm(false);
      setNewCenterCode('');
      setNewCenterName('');
      setNewCenterPhone('');
    } catch (err) {
      alert(err.message || 'Error creating study center');
    } finally {
      setSavingCenter(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Student name is required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        name: name.trim(),
        student_id: studentId.trim(),
        registration_no: registrationNo.trim(),
        hall_ticket_no: hallTicketNo.trim(),
        group: group.trim(),
        candidate_type: candidateType,
        primary_contact: primaryContact.trim(),
        secondary_contact: secondaryContact.trim(),
      };

      if (batchId) payload.batch = Number(batchId);
      if (centerId) payload.center = Number(centerId);

      if (showNewRefInput && newRefName.trim()) {
        payload.new_reference_name = newRefName.trim();
        payload.new_reference_phone = newRefPhone.trim();
      } else if (referenceId) {
        payload.reference = Number(referenceId);
      } else {
        payload.reference = null;
      }

      const res = await api.updateStudent(student.id, payload);
      if (onStudentUpdated) {
        await onStudentUpdated(res.student);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Error updating student record.');
    } finally {
      setLoading(false);
    }
  };

  // Ticket Preview Calculation
  const selBatch = batchList.find(b => String(b.id) === String(batchId));
  const selCenter = centers.find(c => String(c.id) === String(centerId));
  const previewBatch = selBatch?.batch_name ? selBatch.batch_name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 4) : '26A';
  const previewCenter = selCenter?.code ? selCenter.code.replace(/[^0-9]/g, '') || selCenter.code.slice(0, 3) : '106';
  const previewGroup = group ? group.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 4) : 'GEN';
  const previewSerial = String(student.id || 1).padStart(3, '0');
  const previewTicket = `${previewBatch}${previewCenter}${previewGroup}${previewSerial}`;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.6)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '1rem',
      animation: 'fadeIn 0.2s ease'
    }}>
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border-light)',
        boxShadow: 'var(--shadow-xl)',
        width: '100%',
        maxWidth: 680,
        maxHeight: '92vh',
        overflowY: 'auto'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--bg-subtle)',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--primary-100)',
              color: 'var(--primary-700)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <User size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Edit Student, Study Center & Hall Ticket Mapping
              </h3>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Student: {student.name} • Roll ID: {student.student_id || student.registration_no || student.id}
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
              padding: '0.35rem',
              borderRadius: 'var(--radius-xs)'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          {error && (
            <div style={{
              padding: '0.75rem 1rem',
              backgroundColor: '#FEF2F2',
              border: '1px solid #FECACA',
              borderRadius: 'var(--radius-sm)',
              color: '#DC2626',
              fontSize: '0.82rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1.25rem'
            }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Hall Ticket & Roll ID Auto-Mapping Banner */}
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
            gap: '0.75rem'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-800)' }}>
                <Sparkles size={14} />
                <span>Center & Cohort Exam Ticket Formula</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--primary-700)', marginTop: '0.2rem' }}>
                Formula: <code>[{previewBatch}][{previewCenter}][{previewGroup}][{previewSerial}]</code> &rarr; <strong>{previewTicket}</strong>
              </div>
            </div>
            <button
              type="button"
              onClick={handleAutoMapTicket}
              className="btn btn-primary btn-sm"
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', gap: '0.35rem' }}
              title="Apply mapped ticket format to Roll ID and Hall Ticket Number"
            >
              <Sparkles size={13} />
              <span>Apply Mapped Ticket</span>
            </button>
          </div>

          {/* Row 1: Student Name & Candidate Type */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                Student Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem',
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
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                Candidate Type
              </label>
              <select
                value={candidateType}
                onChange={(e) => setCandidateType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-light)',
                  backgroundColor: 'var(--bg-subtle)',
                  fontSize: '0.88rem',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="WITHOUT">WITHOUT (Direct exam / self-study)</option>
                <option value="WITH">WITH (Regular classes & coaching)</option>
              </select>
            </div>
          </div>

          {/* Row 2: Roll / Student ID & Hall Ticket No */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                Roll / Student ID (Mapped)
              </label>
              <input
                type="text"
                placeholder="e.g. 26A106BA058"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-light)',
                  backgroundColor: 'var(--bg-subtle)',
                  fontSize: '0.88rem',
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                Board / Univ Hall Ticket No
              </label>
              <input
                type="text"
                placeholder="e.g. 26A106BA058"
                value={hallTicketNo}
                onChange={(e) => setHallTicketNo(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-light)',
                  backgroundColor: 'var(--bg-subtle)',
                  fontSize: '0.88rem',
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Row 3: Reg No & Group/Course */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                Registration / University No
              </label>
              <input
                type="text"
                placeholder="e.g. SDE149503"
                value={registrationNo}
                onChange={(e) => setRegistrationNo(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem',
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
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                Course Group / Branch
              </label>
              <input
                type="text"
                placeholder="e.g. BA, B.Com, B.Sc"
                value={group}
                onChange={(e) => setGroup(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-light)',
                  backgroundColor: 'var(--bg-subtle)',
                  fontSize: '0.88rem',
                  color: 'var(--text-primary)',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Row 4: Primary & Secondary Contacts */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                Primary Contact (WhatsApp) *
              </label>
              <div style={{ position: 'relative' }}>
                <Phone size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="e.g. 9849460071"
                  value={primaryContact}
                  onChange={(e) => setPrimaryContact(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem 0.55rem 2.2rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-light)',
                    backgroundColor: 'var(--bg-subtle)',
                    fontSize: '0.88rem',
                    color: 'var(--text-primary)',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                Secondary Contact
              </label>
              <div style={{ position: 'relative' }}>
                <Phone size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Alternate phone"
                  value={secondaryContact}
                  onChange={(e) => setSecondaryContact(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem 0.55rem 2.2rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-light)',
                    backgroundColor: 'var(--bg-subtle)',
                    fontSize: '0.88rem',
                    color: 'var(--text-primary)',
                    outline: 'none'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Row 5: Batch & Study Center (With Inline Add Center Toggle) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                Batch / Academic Cohort
              </label>
              <select
                value={batchId}
                onChange={(e) => setBatchId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-light)',
                  backgroundColor: 'var(--bg-subtle)',
                  fontSize: '0.88rem',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {batchList.map((b) => (
                  <option key={b.id} value={String(b.id)}>{b.batch_name} ({b.academic_year})</option>
                ))}
              </select>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Study Center
                </label>
                <button
                  type="button"
                  onClick={() => setShowNewCenterForm(!showNewCenterForm)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary-600)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.2rem'
                  }}
                >
                  <Plus size={12} />
                  <span>{showNewCenterForm ? 'Cancel' : '+ Add Center'}</span>
                </button>
              </div>

              {showNewCenterForm ? (
                <div style={{
                  padding: '0.65rem',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--primary-300)',
                  borderRadius: 'var(--radius-sm)',
                  animation: 'fadeIn 0.2s ease'
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '0.4rem', marginBottom: '0.4rem' }}>
                    <input
                      type="text"
                      placeholder="Code (e.g. 142)"
                      value={newCenterCode}
                      onChange={(e) => setNewCenterCode(e.target.value)}
                      style={{
                        padding: '0.35rem 0.5rem',
                        fontSize: '0.78rem',
                        borderRadius: 'var(--radius-xs)',
                        border: '1px solid var(--border-light)',
                        outline: 'none'
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Center Name / City"
                      value={newCenterName}
                      onChange={(e) => setNewCenterName(e.target.value)}
                      style={{
                        padding: '0.35rem 0.5rem',
                        fontSize: '0.78rem',
                        borderRadius: 'var(--radius-xs)',
                        border: '1px solid var(--border-light)',
                        outline: 'none'
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <input
                      type="text"
                      placeholder="Phone / Incharge"
                      value={newCenterPhone}
                      onChange={(e) => setNewCenterPhone(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '0.35rem 0.5rem',
                        fontSize: '0.78rem',
                        borderRadius: 'var(--radius-xs)',
                        border: '1px solid var(--border-light)',
                        outline: 'none'
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleCreateCenter}
                      disabled={savingCenter}
                      className="btn btn-primary btn-sm"
                      style={{ fontSize: '0.74rem', padding: '0.3rem 0.6rem' }}
                    >
                      {savingCenter ? 'Saving...' : 'Save & Select'}
                    </button>
                  </div>
                </div>
              ) : (
                <select
                  value={centerId}
                  onChange={(e) => setCenterId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-light)',
                    backgroundColor: 'var(--bg-subtle)',
                    fontSize: '0.88rem',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">No Center Assigned</option>
                  {centers.map((c) => (
                    <option key={c.id} value={String(c.id)}>{c.code} - {c.name}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Universal Reference Person Section */}
          <div style={{
            padding: '1rem',
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: 'var(--radius-md)',
            border: '1px dashed var(--border-hover)',
            marginBottom: '1.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Universal Reference Person / Agent
              </label>
              <button
                type="button"
                onClick={() => setShowNewRefInput(!showNewRefInput)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--primary-600)',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.2rem'
                }}
              >
                <Plus size={13} />
                <span>{showNewRefInput ? 'Choose Existing' : '+ Add New Universal Reference'}</span>
              </button>
            </div>

            {showNewRefInput ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', animation: 'fadeIn 0.2s ease' }}>
                <div>
                  <input
                    type="text"
                    placeholder="New Reference Name (e.g. Master Anji)"
                    value={newRefName}
                    onChange={(e) => setNewRefName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 'var(--radius-xs)',
                      border: '1px solid var(--border-light)',
                      backgroundColor: 'var(--bg-surface)',
                      fontSize: '0.84rem',
                      color: 'var(--text-primary)',
                      outline: 'none'
                    }}
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Reference Phone (optional)"
                    value={newRefPhone}
                    onChange={(e) => setNewRefPhone(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 'var(--radius-xs)',
                      border: '1px solid var(--border-light)',
                      backgroundColor: 'var(--bg-surface)',
                      fontSize: '0.84rem',
                      color: 'var(--text-primary)',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>
            ) : (
              <select
                value={referenceId}
                onChange={(e) => setReferenceId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-light)',
                  backgroundColor: 'var(--bg-surface)',
                  fontSize: '0.88rem',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="">No Reference Person</option>
                {references.map((r) => (
                  <option key={r.id} value={String(r.id)}>{r.name} {r.phone ? `(${r.phone})` : ''}</option>
                ))}
              </select>
            )}
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
              Universal references are available across all students and tracked in reports.
            </p>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? 'Saving Changes...' : 'Save Student Details'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
