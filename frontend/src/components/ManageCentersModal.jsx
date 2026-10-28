import React, { useState, useEffect } from 'react';
import {
  X, Building, Plus, Edit, Trash2, CheckCircle, AlertCircle,
  GraduationCap, BookOpen, Award, School, Layers, Sparkles, Phone, Shield
} from 'lucide-react';
import { api } from '../services/api';

export default function ManageCentersModal({
  isOpen,
  onClose,
  onRefresh
}) {
  const [activeTab, setActiveTab] = useState('centers'); // 'centers' | 'programs'

  // Centers State
  const [centers, setCenters] = useState([]);
  const [loadingCenters, setLoadingCenters] = useState(false);
  const [showAddCenter, setShowAddCenter] = useState(false);
  const [newCenterCode, setNewCenterCode] = useState('');
  const [newCenterName, setNewCenterName] = useState('');
  const [newCenterPhone, setNewCenterPhone] = useState('');
  const [savingCenter, setSavingCenter] = useState(false);
  const [editingCenterId, setEditingCenterId] = useState(null);
  const [editCenterCode, setEditCenterCode] = useState('');
  const [editCenterName, setEditCenterName] = useState('');
  const [editCenterPhone, setEditCenterPhone] = useState('');

  // Programs State
  const [programs, setPrograms] = useState([]);
  const [loadingPrograms, setLoadingPrograms] = useState(false);
  const [showAddProgram, setShowAddProgram] = useState(false);
  const [newProgramName, setNewProgramName] = useState('');
  const [newProgramCode, setNewProgramCode] = useState('');
  const [newProgramDuration, setNewProgramDuration] = useState('1');
  const [newProgramDesc, setNewProgramDesc] = useState('');
  const [savingProgram, setSavingProgram] = useState(false);
  const [editingProgramId, setEditingProgramId] = useState(null);
  const [editProgramName, setEditProgramName] = useState('');
  const [editProgramCode, setEditProgramCode] = useState('');
  const [editProgramDuration, setEditProgramDuration] = useState('1');
  const [editProgramDesc, setEditProgramDesc] = useState('');

  // Notifications
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      setLoadingCenters(true);
      setLoadingPrograms(true);
      const [cData, pData] = await Promise.all([
        api.getCenters(),
        api.getPrograms()
      ]);
      setCenters(cData || []);
      setPrograms(pData || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load centers and courses.');
    } finally {
      setLoadingCenters(false);
      setLoadingPrograms(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const showSuccess = (msg) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 4000);
  };

  // Center Handlers
  const handleCreateCenter = async (e) => {
    e.preventDefault();
    if (!newCenterCode.trim() && !newCenterName.trim()) {
      alert('Please enter center code or name.');
      return;
    }
    setSavingCenter(true);
    setError('');
    try {
      const code = newCenterCode.trim() || newCenterName.trim();
      const name = newCenterName.trim() || code;
      const created = await api.createCenter({
        code: code,
        name: name,
        contact_number: newCenterPhone.trim()
      });
      setCenters(prev => [...prev, created]);
      setShowAddCenter(false);
      setNewCenterCode('');
      setNewCenterName('');
      setNewCenterPhone('');
      showSuccess(`Study center "${created.name}" created successfully!`);
      if (onRefresh) onRefresh();
    } catch (err) {
      setError(err.message || 'Error creating study center.');
    } finally {
      setSavingCenter(false);
    }
  };

  const handleStartEditCenter = (c) => {
    setEditingCenterId(c.id);
    setEditCenterCode(c.code);
    setEditCenterName(c.name);
    setEditCenterPhone(c.contact_number || '');
  };

  const handleSaveEditCenter = async (id) => {
    try {
      const updated = await api.updateCenter(id, {
        code: editCenterCode.trim(),
        name: editCenterName.trim(),
        contact_number: editCenterPhone.trim()
      });
      setCenters(prev => prev.map(c => c.id === id ? updated : c));
      setEditingCenterId(null);
      showSuccess(`Center updated successfully!`);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.message || 'Error updating center');
    }
  };

  const handleDeleteCenter = async (c) => {
    const confirmMsg = `Are you sure you want to delete Study Center "${c.code} - ${c.name}"?\n\nNOTE: Any enrolled students mapped to this center will have their center unlinked safely (student records will NOT be deleted).`;
    if (!window.confirm(confirmMsg)) return;
    try {
      await api.deleteCenter(c.id);
      setCenters(prev => prev.filter(item => item.id !== c.id));
      showSuccess(`Study center "${c.name}" removed successfully.`);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.message || 'Error deleting center');
    }
  };

  // Program Handlers
  const handleCreateProgram = async (e) => {
    e.preventDefault();
    if (!newProgramName.trim() || !newProgramCode.trim()) {
      alert('Program name and code are required.');
      return;
    }
    setSavingProgram(true);
    setError('');
    try {
      const created = await api.createProgram({
        name: newProgramName.trim(),
        code: newProgramCode.trim().toUpperCase(),
        duration_years: Number(newProgramDuration) || 1,
        description: newProgramDesc.trim()
      });
      setPrograms(prev => [...prev, created]);
      setShowAddProgram(false);
      setNewProgramName('');
      setNewProgramCode('');
      setNewProgramDuration('1');
      setNewProgramDesc('');
      showSuccess(`Program "${created.name}" created successfully!`);
      if (onRefresh) onRefresh();
    } catch (err) {
      setError(err.message || 'Error creating program.');
    } finally {
      setSavingProgram(false);
    }
  };

  const handleStartEditProgram = (p) => {
    setEditingProgramId(p.id);
    setEditProgramName(p.name);
    setEditProgramCode(p.code);
    setEditProgramDuration(String(p.duration_years || 1));
    setEditProgramDesc(p.description || '');
  };

  const handleSaveEditProgram = async (id) => {
    try {
      const updated = await api.updateProgram(id, {
        name: editProgramName.trim(),
        code: editProgramCode.trim().toUpperCase(),
        duration_years: Number(editProgramDuration) || 1,
        description: editProgramDesc.trim()
      });
      setPrograms(prev => prev.map(p => p.id === id ? updated : p));
      setEditingProgramId(null);
      showSuccess(`Program updated successfully!`);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.message || 'Error updating program');
    }
  };

  const handleDeleteProgram = async (p) => {
    const confirmMsg = `Are you sure you want to delete course program "${p.name} (${p.code})"?\n\nEnsure no batches are currently linked to this program.`;
    if (!window.confirm(confirmMsg)) return;
    try {
      await api.deleteProgram(p.id);
      setPrograms(prev => prev.filter(item => item.id !== p.id));
      showSuccess(`Course "${p.name}" removed successfully.`);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.message || 'Error deleting program');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 110,
      padding: '1rem',
      animation: 'fadeIn 0.2s ease'
    }}>
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border-light)',
        boxShadow: 'var(--shadow-xl)',
        width: '100%',
        maxWidth: 780,
        maxHeight: '92vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
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
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--primary-100)',
              color: 'var(--primary-700)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Building size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Study Centers, Courses & Exam Ticket Mapping
              </h3>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
                Add, modify, or remove study centers and academic programs mapped to student hall tickets.
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
              borderRadius: 'var(--radius-xs)'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-light)',
          backgroundColor: 'var(--bg-surface)',
          padding: '0 1.5rem'
        }}>
          <button
            onClick={() => setActiveTab('centers')}
            style={{
              padding: '0.75rem 1.25rem',
              border: 'none',
              borderBottom: activeTab === 'centers' ? '2.5px solid var(--primary-600)' : '2.5px solid transparent',
              background: 'none',
              color: activeTab === 'centers' ? 'var(--primary-700)' : 'var(--text-secondary)',
              fontSize: '0.85rem',
              fontWeight: activeTab === 'centers' ? 800 : 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Building size={16} />
            <span>Study Centers ({centers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('programs')}
            style={{
              padding: '0.75rem 1.25rem',
              border: 'none',
              borderBottom: activeTab === 'programs' ? '2.5px solid var(--primary-600)' : '2.5px solid transparent',
              background: 'none',
              color: activeTab === 'programs' ? 'var(--primary-700)' : 'var(--text-secondary)',
              fontSize: '0.85rem',
              fontWeight: activeTab === 'programs' ? 800 : 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Layers size={16} />
            <span>Courses & Academic Programs ({programs.length})</span>
          </button>
        </div>

        {/* Body Content */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          {/* Feedback & Error banners */}
          {feedback && (
            <div style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: '#ECFDF5',
              border: '1px solid #A7F3D0',
              color: '#065F46',
              fontSize: '0.82rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1rem'
            }}>
              <CheckCircle size={16} />
              <span>{feedback}</span>
            </div>
          )}

          {error && (
            <div style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: '#FEF2F2',
              border: '1px solid #FECACA',
              color: '#DC2626',
              fontSize: '0.82rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1rem'
            }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* TAB 1: STUDY CENTERS */}
          {activeTab === 'centers' && (
            <div>
              {/* Ticket Mapping Architecture Card */}
              <div style={{
                padding: '0.85rem 1.15rem',
                backgroundColor: 'var(--primary-50)',
                border: '1px solid var(--primary-200)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.25rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.84rem', fontWeight: 700, color: 'var(--primary-800)', marginBottom: '0.25rem' }}>
                  <Sparkles size={15} />
                  <span>Exam Hall Ticket & Roll ID Auto-Mapping Protocol</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--primary-700)', margin: '0 0 0.5rem 0' }}>
                  When students enroll or sit for exams, their unique identification ticket is dynamically constructed from:
                </p>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.78rem',
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  backgroundColor: '#FFFFFF',
                  padding: '0.4rem 0.65rem',
                  borderRadius: 'var(--radius-xs)',
                  border: '1px solid var(--primary-200)',
                  color: 'var(--primary-800)'
                }}>
                  <span style={{ color: '#2563EB' }}>[Batch: 26A]</span>
                  <span>+</span>
                  <span style={{ color: '#059669' }}>[Center: 106]</span>
                  <span>+</span>
                  <span style={{ color: '#D97706' }}>[Group: BA]</span>
                  <span>+</span>
                  <span style={{ color: '#7C3AED' }}>[Roll: 058]</span>
                  <span style={{ margin: '0 0.35rem' }}>&rarr;</span>
                  <span style={{ color: '#1E293B', fontWeight: 800 }}>26A106BA058</span>
                </div>
              </div>

              {/* Add Center Button / Expandable Form */}
              <div style={{ marginBottom: '1.25rem' }}>
                {!showAddCenter ? (
                  <button
                    onClick={() => setShowAddCenter(true)}
                    className="btn btn-primary btn-sm"
                    style={{ gap: '0.4rem' }}
                  >
                    <Plus size={15} />
                    <span>+ Add New Study Center</span>
                  </button>
                ) : (
                  <form onSubmit={handleCreateCenter} style={{
                    padding: '1rem',
                    backgroundColor: 'var(--bg-subtle)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--primary-300)',
                    animation: 'fadeIn 0.2s ease'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                        Add New Study Center
                      </strong>
                      <button
                        type="button"
                        onClick={() => setShowAddCenter(false)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr 1.5fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                          Center Code *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 142- RJY"
                          value={newCenterCode}
                          onChange={(e) => setNewCenterCode(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.45rem 0.65rem',
                            fontSize: '0.82rem',
                            borderRadius: 'var(--radius-xs)',
                            border: '1px solid var(--border-light)',
                            outline: 'none'
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                          Center Name & City *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Rajahmundry Study Center"
                          value={newCenterName}
                          onChange={(e) => setNewCenterName(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.45rem 0.65rem',
                            fontSize: '0.82rem',
                            borderRadius: 'var(--radius-xs)',
                            border: '1px solid var(--border-light)',
                            outline: 'none'
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                          Contact Phone / Incharge
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 9849460071"
                          value={newCenterPhone}
                          onChange={(e) => setNewCenterPhone(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.45rem 0.65rem',
                            fontSize: '0.82rem',
                            borderRadius: 'var(--radius-xs)',
                            border: '1px solid var(--border-light)',
                            outline: 'none'
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={() => setShowAddCenter(false)}
                        className="btn btn-secondary btn-sm"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={savingCenter}
                        className="btn btn-primary btn-sm"
                      >
                        {savingCenter ? 'Saving...' : 'Save Study Center'}
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Study Centers Table */}
              <div style={{
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)',
                overflow: 'hidden'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-light)', color: 'var(--text-secondary)' }}>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Center Code</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Full Center Name</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Contact Phone</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Ticket Prefix</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Students</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {centers.map((c) => {
                      const isEditing = editingCenterId === c.id;
                      const ticketDigits = c.code ? c.code.replace(/[^0-9]/g, '') || c.code.slice(0, 3) : '---';

                      if (isEditing) {
                        return (
                          <tr key={c.id} style={{ borderBottom: '1px solid var(--border-light)', backgroundColor: 'var(--primary-50)' }}>
                            <td style={{ padding: '0.5rem 0.75rem' }}>
                              <input
                                type="text"
                                value={editCenterCode}
                                onChange={(e) => setEditCenterCode(e.target.value)}
                                style={{ width: '100%', padding: '0.3rem 0.5rem', fontSize: '0.8rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-light)' }}
                              />
                            </td>
                            <td style={{ padding: '0.5rem 0.75rem' }}>
                              <input
                                type="text"
                                value={editCenterName}
                                onChange={(e) => setEditCenterName(e.target.value)}
                                style={{ width: '100%', padding: '0.3rem 0.5rem', fontSize: '0.8rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-light)' }}
                              />
                            </td>
                            <td style={{ padding: '0.5rem 0.75rem' }}>
                              <input
                                type="text"
                                value={editCenterPhone}
                                onChange={(e) => setEditCenterPhone(e.target.value)}
                                style={{ width: '100%', padding: '0.3rem 0.5rem', fontSize: '0.8rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-light)' }}
                              />
                            </td>
                            <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>
                              <code style={{ fontSize: '0.75rem', fontWeight: 700 }}>{ticketDigits}</code>
                            </td>
                            <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>
                              {c.student_count || 0}
                            </td>
                            <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right' }}>
                              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.35rem' }}>
                                <button
                                  type="button"
                                  onClick={() => handleSaveEditCenter(c.id)}
                                  className="btn btn-primary btn-sm"
                                  style={{ padding: '0.25rem 0.55rem', fontSize: '0.72rem' }}
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingCenterId(null)}
                                  className="btn btn-secondary btn-sm"
                                  style={{ padding: '0.25rem 0.55rem', fontSize: '0.72rem' }}
                                >
                                  Cancel
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      }

                      return (
                        <tr key={c.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <span style={{
                              padding: '0.2rem 0.55rem',
                              borderRadius: 'var(--radius-xs)',
                              backgroundColor: 'var(--primary-100)',
                              color: 'var(--primary-800)',
                              fontWeight: 700,
                              fontSize: '0.78rem'
                            }}>
                              {c.code}
                            </span>
                          </td>
                          <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {c.name}
                          </td>
                          <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>
                            {c.contact_number || '—'}
                          </td>
                          <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                            <span style={{
                              padding: '0.15rem 0.45rem',
                              borderRadius: 'var(--radius-full)',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              backgroundColor: '#DCFCE7',
                              color: '#15803D'
                            }}>
                              Maps: {ticketDigits}
                            </span>
                          </td>
                          <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            {c.student_count || 0}
                          </td>
                          <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.35rem' }}>
                              <button
                                type="button"
                                onClick={() => handleStartEditCenter(c)}
                                className="btn btn-secondary btn-sm"
                                style={{ padding: '0.25rem 0.45rem', fontSize: '0.73rem', color: 'var(--primary-600)' }}
                                title="Edit center code and name"
                              >
                                <Edit size={13} />
                                <span>Edit</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteCenter(c)}
                                className="btn btn-secondary btn-sm"
                                style={{ padding: '0.25rem 0.45rem', fontSize: '0.73rem', color: 'var(--rose-600)' }}
                                title="Safe delete center (unlinks students without deleting records)"
                              >
                                <Trash2 size={13} />
                                <span>Delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: COURSES & ACADEMIC PROGRAMS */}
          {activeTab === 'programs' && (
            <div>
              {/* Add Program Button / Expandable Form */}
              <div style={{ marginBottom: '1.25rem' }}>
                {!showAddProgram ? (
                  <button
                    onClick={() => setShowAddProgram(true)}
                    className="btn btn-primary btn-sm"
                    style={{ gap: '0.4rem' }}
                  >
                    <Plus size={15} />
                    <span>+ Add New Academic Program / Course</span>
                  </button>
                ) : (
                  <form onSubmit={handleCreateProgram} style={{
                    padding: '1rem',
                    backgroundColor: 'var(--bg-subtle)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--primary-300)',
                    animation: 'fadeIn 0.2s ease'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                        Add New Course Program
                      </strong>
                      <button
                        type="button"
                        onClick={() => setShowAddProgram(false)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                          Course Program Name *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Master of Commerce (M.Com)"
                          value={newProgramName}
                          onChange={(e) => setNewProgramName(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.45rem 0.65rem',
                            fontSize: '0.82rem',
                            borderRadius: 'var(--radius-xs)',
                            border: '1px solid var(--border-light)',
                            outline: 'none'
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                          Course Code *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. MCOM"
                          value={newProgramCode}
                          onChange={(e) => setNewProgramCode(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.45rem 0.65rem',
                            fontSize: '0.82rem',
                            borderRadius: 'var(--radius-xs)',
                            border: '1px solid var(--border-light)',
                            outline: 'none'
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                          Duration (Years)
                        </label>
                        <select
                          value={newProgramDuration}
                          onChange={(e) => setNewProgramDuration(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.45rem 0.65rem',
                            fontSize: '0.82rem',
                            borderRadius: 'var(--radius-xs)',
                            border: '1px solid var(--border-light)',
                            outline: 'none'
                          }}
                        >
                          <option value="1">1 Year</option>
                          <option value="2">2 Years</option>
                          <option value="3">3 Years</option>
                          <option value="4">4 Years</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ marginBottom: '0.75rem' }}>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                        Description (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Two-year postgraduate degree program"
                        value={newProgramDesc}
                        onChange={(e) => setNewProgramDesc(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.45rem 0.65rem',
                          fontSize: '0.82rem',
                          borderRadius: 'var(--radius-xs)',
                          border: '1px solid var(--border-light)',
                          outline: 'none'
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={() => setShowAddProgram(false)}
                        className="btn btn-secondary btn-sm"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={savingProgram}
                        className="btn btn-primary btn-sm"
                      >
                        {savingProgram ? 'Saving...' : 'Save Program'}
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Programs Table */}
              <div style={{
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)',
                overflow: 'hidden'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-light)', color: 'var(--text-secondary)' }}>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Code</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Course / Program Name</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Duration</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Linked Batches</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {programs.map((p) => {
                      const isEditing = editingProgramId === p.id;

                      if (isEditing) {
                        return (
                          <tr key={p.id} style={{ borderBottom: '1px solid var(--border-light)', backgroundColor: 'var(--primary-50)' }}>
                            <td style={{ padding: '0.5rem 0.75rem' }}>
                              <input
                                type="text"
                                value={editProgramCode}
                                onChange={(e) => setEditProgramCode(e.target.value)}
                                style={{ width: '100%', padding: '0.3rem 0.5rem', fontSize: '0.8rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-light)' }}
                              />
                            </td>
                            <td style={{ padding: '0.5rem 0.75rem' }}>
                              <input
                                type="text"
                                value={editProgramName}
                                onChange={(e) => setEditProgramName(e.target.value)}
                                style={{ width: '100%', padding: '0.3rem 0.5rem', fontSize: '0.8rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-light)' }}
                              />
                            </td>
                            <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>
                              <select
                                value={editProgramDuration}
                                onChange={(e) => setEditProgramDuration(e.target.value)}
                                style={{ padding: '0.3rem 0.5rem', fontSize: '0.8rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-light)' }}
                              >
                                <option value="1">1 Yr</option>
                                <option value="2">2 Yr</option>
                                <option value="3">3 Yr</option>
                                <option value="4">4 Yr</option>
                              </select>
                            </td>
                            <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>
                              {p.batch_count || 0}
                            </td>
                            <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right' }}>
                              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.35rem' }}>
                                <button
                                  type="button"
                                  onClick={() => handleSaveEditProgram(p.id)}
                                  className="btn btn-primary btn-sm"
                                  style={{ padding: '0.25rem 0.55rem', fontSize: '0.72rem' }}
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingProgramId(null)}
                                  className="btn btn-secondary btn-sm"
                                  style={{ padding: '0.25rem 0.55rem', fontSize: '0.72rem' }}
                                >
                                  Cancel
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      }

                      return (
                        <tr key={p.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <span style={{
                              padding: '0.2rem 0.55rem',
                              borderRadius: 'var(--radius-xs)',
                              backgroundColor: 'var(--primary-100)',
                              color: 'var(--primary-800)',
                              fontWeight: 700,
                              fontSize: '0.78rem'
                            }}>
                              {p.code}
                            </span>
                          </td>
                          <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {p.name}
                            {p.description && (
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                                {p.description}
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 600 }}>
                            {p.duration_years} {p.duration_years === 1 ? 'Year' : 'Years'}
                          </td>
                          <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            {p.batch_count || 0}
                          </td>
                          <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.35rem' }}>
                              <button
                                type="button"
                                onClick={() => handleStartEditProgram(p)}
                                className="btn btn-secondary btn-sm"
                                style={{ padding: '0.25rem 0.45rem', fontSize: '0.73rem', color: 'var(--primary-600)' }}
                                title="Edit course program"
                              >
                                <Edit size={13} />
                                <span>Edit</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteProgram(p)}
                                className="btn btn-secondary btn-sm"
                                style={{ padding: '0.25rem 0.45rem', fontSize: '0.73rem', color: 'var(--rose-600)' }}
                                title="Safe delete course program"
                              >
                                <Trash2 size={13} />
                                <span>Delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid var(--border-light)',
          display: 'flex',
          justifyContent: 'flex-end',
          backgroundColor: 'var(--bg-subtle)'
        }}>
          <button
            onClick={onClose}
            className="btn btn-secondary"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
