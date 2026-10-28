import React, { useState, useEffect } from 'react';
import {
  X, Plus, AlertCircle, Check, Layers, MessageSquare,
  Building, Edit2, Trash2, Ticket, ExternalLink, Phone
} from 'lucide-react';
import { api } from '../services/api';

export default function AddBatchModal({ programs = [], onClose, onSuccess }) {
  const [programId, setProgramId] = useState(programs[0]?.id || '');
  const [batchName, setBatchName] = useState('');
  const [academicYear, setAcademicYear] = useState('2026-2027');
  const [whatsappLink, setWhatsappLink] = useState('');
  const [defaultBaseFee, setDefaultBaseFee] = useState('');
  const [candidateTypes, setCandidateTypes] = useState(['WITH', 'WITHOUT']);
  const [selectedCenterIds, setSelectedCenterIds] = useState([]);
  const [centersList, setCentersList] = useState([]);
  const [programsList, setProgramsList] = useState(programs);

  // Inline Center Management state
  const [showAddCenter, setShowAddCenter] = useState(false);
  const [newCenterCode, setNewCenterCode] = useState('');
  const [newCenterName, setNewCenterName] = useState('');
  const [newCenterPhone, setNewCenterPhone] = useState('');
  const [centerLoading, setCenterLoading] = useState(false);

  // Inline Center Editing state
  const [editingCenterId, setEditingCenterId] = useState(null);
  const [editCenterCode, setEditCenterCode] = useState('');
  const [editCenterName, setEditCenterName] = useState('');
  const [editCenterPhone, setEditCenterPhone] = useState('');

  // Inline Program Management state
  const [showAddProgram, setShowAddProgram] = useState(false);
  const [newProgName, setNewProgName] = useState('');
  const [newProgCode, setNewProgCode] = useState('');
  const [newProgDuration, setNewProgDuration] = useState('3');
  const [progLoading, setProgLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successInfo, setSuccessInfo] = useState('');

  const loadCenters = async () => {
    try {
      const cData = await api.getCenters();
      setCentersList(cData || []);
    } catch (e) {
      console.error(e);
    }
  };

  const loadPrograms = async () => {
    try {
      const pData = await api.getPrograms();
      if (Array.isArray(pData) && pData.length > 0) {
        setProgramsList(pData);
        if (!programId) setProgramId(pData[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadCenters();
    loadPrograms();
  }, []);

  const handleToggleCandidateType = (type) => {
    setCandidateTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleToggleCenter = (centerId) => {
    setSelectedCenterIds((prev) =>
      prev.includes(centerId) ? prev.filter((id) => id !== centerId) : [...prev, centerId]
    );
  };

  const handleSelectAllCenters = () => {
    setSelectedCenterIds(centersList.map((c) => c.id));
  };

  const handleClearAllCenters = () => {
    setSelectedCenterIds([]);
  };

  // Create Center Inline
  const handleCreateCenter = async (e) => {
    e.preventDefault();
    if (!newCenterCode.trim() && !newCenterName.trim()) {
      setError('Please provide a center code or name.');
      return;
    }
    setCenterLoading(true);
    setError('');
    try {
      const code = newCenterCode.trim() || newCenterName.trim();
      const name = newCenterName.trim() || newCenterCode.trim();
      const created = await api.createCenter({
        code,
        name,
        contact_number: newCenterPhone.trim()
      });
      await loadCenters();
      setSelectedCenterIds((prev) => [...prev, created.id]);
      setNewCenterCode('');
      setNewCenterName('');
      setNewCenterPhone('');
      setShowAddCenter(false);
      setSuccessInfo(`Study Center "${created.code}" registered and assigned.`);
      setTimeout(() => setSuccessInfo(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to create center.');
    } finally {
      setCenterLoading(false);
    }
  };

  // Start Editing Center
  const startEditCenter = (c, e) => {
    e.stopPropagation();
    setEditingCenterId(c.id);
    setEditCenterCode(c.code || '');
    setEditCenterName(c.name || '');
    setEditCenterPhone(c.contact_number || '');
  };

  // Save Edit Center
  const handleSaveEditCenter = async (e) => {
    e.preventDefault();
    if (!editCenterCode.trim() && !editCenterName.trim()) return;
    try {
      await api.updateCenter(editingCenterId, {
        code: editCenterCode.trim(),
        name: editCenterName.trim() || editCenterCode.trim(),
        contact_number: editCenterPhone.trim()
      });
      await loadCenters();
      setEditingCenterId(null);
      setSuccessInfo('Study center updated successfully.');
      setTimeout(() => setSuccessInfo(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update center.');
    }
  };

  // Delete Center
  const handleDeleteCenter = async (c, e) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to remove Study Center "${c.code || c.name}"?\nEnrolled students will be unlinked safely.`)) {
      return;
    }
    try {
      await api.deleteCenter(c.id);
      setSelectedCenterIds((prev) => prev.filter((id) => id !== c.id));
      await loadCenters();
      setSuccessInfo(`Center "${c.code}" removed.`);
      setTimeout(() => setSuccessInfo(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete center.');
    }
  };

  // Create Program Inline
  const handleCreateProgram = async (e) => {
    e.preventDefault();
    if (!newProgName.trim() || !newProgCode.trim()) {
      setError('Please provide course program name and code.');
      return;
    }
    setProgLoading(true);
    setError('');
    try {
      const created = await api.createProgram({
        name: newProgName.trim(),
        code: newProgCode.trim().toUpperCase(),
        duration_years: Number(newProgDuration) || 1
      });
      await loadPrograms();
      setProgramId(created.id);
      setNewProgName('');
      setNewProgCode('');
      setShowAddProgram(false);
      setSuccessInfo(`Course / Program "${created.name}" created and selected!`);
      setTimeout(() => setSuccessInfo(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to create program.');
    } finally {
      setProgLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!batchName.trim()) {
      setError('Please provide a batch name (e.g. 26A or Degree 2026-27)');
      return;
    }
    if (!programId) {
      setError('Please select an academic program');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        program: Number(programId),
        batch_name: batchName.trim(),
        academic_year: academicYear.trim(),
        whatsapp_group_link: whatsappLink.trim(),
        candidate_types: candidateTypes,
        default_base_fee: defaultBaseFee ? Number(defaultBaseFee) : 0,
        centers: selectedCenterIds,
        is_active: true
      };

      await api.createBatch(payload);
      if (onSuccess) await onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error creating batch');
    } finally {
      setLoading(false);
    }
  };

  // Live Ticket Mapping formula preview
  const selectedBatchPrefix = (batchName || '26A').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const firstSelectedCenter = centersList.find((c) => selectedCenterIds.includes(c.id));
  const centerCodeSample = firstSelectedCenter ? firstSelectedCenter.code.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase() : '106';
  const sampleTicketNo = `${selectedBatchPrefix}${centerCodeSample}BA058`;

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
              <Layers size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Create New Academic Batch Cohort
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.15rem 0 0 0' }}>
                Configure academic programs, study centers CRUD, tuition base, and exam ticket mapping
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

        {/* Feedback Alerts */}
        {error && (
          <div style={{
            margin: '0.75rem 1.5rem 0',
            padding: '0.65rem 1rem',
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

        {successInfo && (
          <div style={{
            margin: '0.75rem 1.5rem 0',
            padding: '0.65rem 1rem',
            backgroundColor: '#ECFDF5',
            border: '1px solid #A7F3D0',
            borderRadius: 'var(--radius-md)',
            color: '#065F46',
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Check size={16} style={{ flexShrink: 0 }} />
            <span>{successInfo}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', overflowY: 'auto', flex: 1 }}>
            
            {/* Row 1: Batch Name & Academic Year */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Batch Cohort Name <span style={{ color: 'var(--rose-text)' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 26A or Degree 2026-27"
                  value={batchName}
                  onChange={(e) => setBatchName(e.target.value)}
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
                  Academic Year
                </label>
                <input
                  type="text"
                  placeholder="e.g. 2026-2027"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
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
            </div>

            {/* Row 2: Program / Course Selection & Inline Add */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', margin: 0 }}>
                    Academic Program / Course <span style={{ color: 'var(--rose-text)' }}>*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowAddProgram(!showAddProgram)}
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
                    <span>{showAddProgram ? 'Close' : '+ New Course'}</span>
                  </button>
                </div>
                <select
                  required
                  value={programId}
                  onChange={(e) => setProgramId(e.target.value)}
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
                  <option value="">Select Academic Program...</option>
                  {programsList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.code}) — {p.duration_years} Yr
                    </option>
                  ))}
                </select>

                {/* Inline Add Course/Program Form */}
                {showAddProgram && (
                  <div style={{
                    marginTop: '0.5rem',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-subtle)',
                    border: '1px solid var(--border-light)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                  }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      Quick Add Academic Course / Program:
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.4rem' }}>
                      <input
                        type="text"
                        placeholder="Course Name (e.g. B.Ed)"
                        value={newProgName}
                        onChange={(e) => setNewProgName(e.target.value)}
                        style={{ padding: '0.35rem 0.5rem', fontSize: '0.78rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}
                      />
                      <input
                        type="text"
                        placeholder="Code (BED)"
                        value={newProgCode}
                        onChange={(e) => setNewProgCode(e.target.value)}
                        style={{ padding: '0.35rem 0.5rem', fontSize: '0.78rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}
                      />
                      <select
                        value={newProgDuration}
                        onChange={(e) => setNewProgDuration(e.target.value)}
                        style={{ padding: '0.35rem', fontSize: '0.78rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}
                      >
                        <option value="1">1 Year</option>
                        <option value="2">2 Years</option>
                        <option value="3">3 Years</option>
                        <option value="4">4 Years</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                      <button
                        type="button"
                        onClick={() => setShowAddProgram(false)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleCreateProgram}
                        disabled={progLoading}
                        className="btn btn-primary btn-sm"
                        style={{ padding: '0.2rem 0.65rem', fontSize: '0.72rem' }}
                      >
                        {progLoading ? 'Saving...' : 'Save Course'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Default Base Annual Tuition (₹)
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: 'var(--text-muted)' }}>
                    ₹
                  </span>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 18000"
                    value={defaultBaseFee}
                    onChange={(e) => setDefaultBaseFee(e.target.value)}
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
              </div>
            </div>

            {/* Row 3: WhatsApp Group Link */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Batch WhatsApp Group Link
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <MessageSquare size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#16A34A' }} />
                  <input
                    type="url"
                    placeholder="https://chat.whatsapp.com/..."
                    value={whatsappLink}
                    onChange={(e) => setWhatsappLink(e.target.value)}
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
                {whatsappLink && (
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#16A34A' }}
                  >
                    <span>Test</span>
                    <ExternalLink size={13} />
                  </a>
                )}
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Students in this batch will receive reminders with this WhatsApp group link
              </span>
            </div>

            {/* Row 4: Candidate Types Allowed */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Supported Candidate Types:
              </label>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.82rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={candidateTypes.includes('WITH')}
                    onChange={() => handleToggleCandidateType('WITH')}
                    style={{ accentColor: 'var(--primary-600)' }}
                  />
                  <span><strong>WITH</strong> (With regular classes, materials & coaching)</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.82rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={candidateTypes.includes('WITHOUT')}
                    onChange={() => handleToggleCandidateType('WITHOUT')}
                    style={{ accentColor: 'var(--primary-600)' }}
                  />
                  <span><strong>WITHOUT</strong> (Direct examination / Self-study only)</span>
                </label>
              </div>
            </div>

            {/* Row 5: STUDY CENTERS CRUD & TICKET MAPPING */}
            <div style={{
              marginBottom: '1rem',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)',
              padding: '0.9rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.65rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    Study Centers Management & Batch Assignment
                  </label>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    Add, edit, remove centers. Centers map directly to student Exam Hall Tickets.
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowAddCenter(!showAddCenter)}
                    className="btn btn-primary btn-sm"
                    style={{ padding: '0.25rem 0.6rem', fontSize: '0.72rem', gap: '0.25rem' }}
                  >
                    <Plus size={13} />
                    <span>+ Add Center</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSelectAllCenters}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem' }}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={handleClearAllCenters}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem' }}
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Inline Add Center Panel */}
              {showAddCenter && (
                <div style={{
                  marginBottom: '0.85rem',
                  padding: '0.85rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-subtle)',
                  border: '1.5px dashed var(--primary-300)',
                  animation: 'fadeIn 0.2s ease'
                }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary-700)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Building size={14} />
                    <span>Create & Register New Study Center:</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                        Center Code (Maps to Ticket) *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 106- JK or TUNI"
                        value={newCenterCode}
                        onChange={(e) => setNewCenterCode(e.target.value)}
                        style={{ width: '100%', padding: '0.35rem 0.5rem', fontSize: '0.78rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                        Center Full Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Jagannaickpur Branch"
                        value={newCenterName}
                        onChange={(e) => setNewCenterName(e.target.value)}
                        style={{ width: '100%', padding: '0.35rem 0.5rem', fontSize: '0.78rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                        Contact Phone
                      </label>
                      <input
                        type="tel"
                        placeholder="e.g. 9848012345"
                        value={newCenterPhone}
                        onChange={(e) => setNewCenterPhone(e.target.value)}
                        style={{ width: '100%', padding: '0.35rem 0.5rem', fontSize: '0.78rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => setShowAddCenter(false)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '0.25rem 0.55rem', fontSize: '0.74rem' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleCreateCenter}
                      disabled={centerLoading}
                      className="btn btn-primary btn-sm"
                      style={{ padding: '0.25rem 0.75rem', fontSize: '0.74rem' }}
                    >
                      {centerLoading ? 'Creating...' : '+ Save Center'}
                    </button>
                  </div>
                </div>
              )}

              {/* Study Centers List with Checkbox, Ticket Tag, Edit, and Delete */}
              <div style={{
                maxHeight: 180,
                overflowY: 'auto',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-subtle)',
                display: 'flex',
                flexDirection: 'column'
              }}>
                {centersList.length === 0 ? (
                  <div style={{ padding: '1rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    No study centers created yet. Click "+ Add Center" above to register one.
                  </div>
                ) : (
                  centersList.map((c) => {
                    const isSelected = selectedCenterIds.includes(c.id);
                    const isEditing = editingCenterId === c.id;

                    if (isEditing) {
                      return (
                        <div key={c.id} style={{ padding: '0.5rem 0.75rem', backgroundColor: '#EFF6FF', borderBottom: '1px solid var(--border-light)' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '0.4rem', alignItems: 'center' }}>
                            <input
                              type="text"
                              value={editCenterCode}
                              onChange={(e) => setEditCenterCode(e.target.value)}
                              placeholder="Code"
                              style={{ padding: '0.25rem 0.4rem', fontSize: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}
                            />
                            <input
                              type="text"
                              value={editCenterName}
                              onChange={(e) => setEditCenterName(e.target.value)}
                              placeholder="Name"
                              style={{ padding: '0.25rem 0.4rem', fontSize: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}
                            />
                            <input
                              type="tel"
                              value={editCenterPhone}
                              onChange={(e) => setEditCenterPhone(e.target.value)}
                              placeholder="Phone"
                              style={{ padding: '0.25rem 0.4rem', fontSize: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}
                            />
                            <div style={{ display: 'flex', gap: '0.25rem' }}>
                              <button
                                type="button"
                                onClick={handleSaveEditCenter}
                                className="btn btn-primary btn-sm"
                                style={{ padding: '0.2rem 0.45rem', fontSize: '0.7rem' }}
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingCenterId(null)}
                                className="btn btn-secondary btn-sm"
                                style={{ padding: '0.2rem 0.45rem', fontSize: '0.7rem' }}
                              >
                                X
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={c.id}
                        onClick={() => handleToggleCenter(c.id)}
                        style={{
                          padding: '0.5rem 0.75rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          borderBottom: '1px solid var(--border-light)',
                          backgroundColor: isSelected ? 'var(--primary-50)' : 'transparent',
                          cursor: 'pointer',
                          transition: 'background-color 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', minWidth: 0 }}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            style={{ accentColor: 'var(--primary-600)', width: 15, height: 15, cursor: 'pointer' }}
                          />
                          <div style={{ minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <strong style={{ fontSize: '0.82rem', color: isSelected ? 'var(--primary-900)' : 'var(--text-primary)' }}>
                                {c.code || c.name}
                              </strong>
                              {c.name && c.name !== c.code && (
                                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                  ({c.name})
                                </span>
                              )}
                              <span style={{
                                fontSize: '0.65rem',
                                fontWeight: 700,
                                backgroundColor: isSelected ? 'var(--primary-100)' : 'var(--bg-surface)',
                                color: isSelected ? 'var(--primary-700)' : 'var(--text-secondary)',
                                padding: '0.1rem 0.35rem',
                                borderRadius: 'var(--radius-xs)',
                                border: '1px solid var(--border-light)'
                              }}>
                                🎫 Maps to Ticket: {c.code.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4)}
                              </span>
                            </div>
                            {c.contact_number && (
                              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <Phone size={10} />
                                <span>{c.contact_number}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right Actions: Student Count Pill, Edit, Delete */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexShrink: 0 }}>
                          <span style={{
                            fontSize: '0.68rem',
                            fontWeight: 600,
                            color: 'var(--text-secondary)',
                            backgroundColor: 'var(--bg-surface)',
                            padding: '0.15rem 0.45rem',
                            borderRadius: 'var(--radius-full)',
                            border: '1px solid var(--border-light)'
                          }}>
                            {c.student_count || 0} students
                          </span>

                          <button
                            type="button"
                            onClick={(e) => startEditCenter(c, e)}
                            title="Edit Center Code / Details"
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--primary-600)',
                              cursor: 'pointer',
                              padding: '0.2rem'
                            }}
                          >
                            <Edit2 size={13} />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => handleDeleteCenter(c, e)}
                            title="Remove Center"
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--rose-600)',
                              cursor: 'pointer',
                              padding: '0.2rem'
                            }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.4rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                <span>{selectedCenterIds.length} of {centersList.length} centers assigned</span>
                <span>Unchecked centers remain campus-wide open</span>
              </div>
            </div>

            {/* Row 6: TICKET & ROLL CODE MAPPING PREVIEW */}
            <div style={{
              marginBottom: '1rem',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Ticket size={18} style={{ color: 'var(--primary-600)', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    Exam Hall Ticket & Roll ID Auto-Mapping:
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Pattern: <code>[Batch Code][Center Code][Course Group][Roll #]</code>
                  </div>
                </div>
              </div>
              <div style={{
                fontFamily: 'monospace',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: 'var(--primary-700)',
                backgroundColor: 'var(--primary-50)',
                padding: '0.25rem 0.65rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--primary-200)'
              }}>
                Sample: {sampleTicketNo}
              </div>
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
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ minWidth: 140, justifyContent: 'center' }}
            >
              {loading ? 'Creating...' : '+ Create Batch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
