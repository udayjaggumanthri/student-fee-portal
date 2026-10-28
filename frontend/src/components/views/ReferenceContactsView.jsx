import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserCheck, Phone, Mail, Search, Plus, Edit, Trash2,
  Users, DollarSign, AlertCircle, Check, X, ExternalLink,
  MessageSquare, ShieldCheck, ChevronRight
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function ReferenceContactsView() {
  const { isAdmin, isPrincipal, isCaller } = useAuth();
  const navigate = useNavigate();

  const [references, setReferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRef, setEditingRef] = useState(null);
  const [deletingRef, setDeletingRef] = useState(null);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [designation, setDesignation] = useState('');
  const [notes, setNotes] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  const loadReferences = async () => {
    try {
      const data = await api.getReferences();
      setReferences(data || []);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load reference contacts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReferences();
  }, []);

  const openAddModal = () => {
    setName('');
    setPhone('');
    setDesignation('');
    setNotes('');
    setShowAddModal(true);
  };

  const openEditModal = (r) => {
    setEditingRef(r);
    setName(r.name || '');
    setPhone(r.phone || '');
    setDesignation(r.designation || '');
    setNotes(r.notes || '');
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setFormSubmitting(true);
    setErrorMsg('');
    try {
      await api.createReference({
        name: name.trim(),
        phone: phone.trim(),
        designation: designation.trim(),
        notes: notes.trim()
      });
      setSuccessMsg(`Reference contact "${name}" created successfully!`);
      setShowAddModal(false);
      await loadReferences();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create reference contact.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingRef || !name.trim()) return;

    setFormSubmitting(true);
    setErrorMsg('');
    try {
      await api.updateReference(editingRef.id, {
        name: name.trim(),
        phone: phone.trim(),
        designation: designation.trim(),
        notes: notes.trim()
      });
      setSuccessMsg(`Reference contact "${name}" updated successfully!`);
      setEditingRef(null);
      await loadReferences();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update reference contact.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async (r) => {
    try {
      await api.deleteReference(r.id);
      setSuccessMsg(`Reference contact "${r.name}" was removed.`);
      setDeletingRef(null);
      await loadReferences();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to delete reference contact.');
    }
  };

  // Filter references by search query
  const filteredReferences = references.filter((r) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      (r.name && r.name.toLowerCase().includes(q)) ||
      (r.phone && r.phone.toLowerCase().includes(q)) ||
      (r.designation && r.designation.toLowerCase().includes(q)) ||
      (r.notes && r.notes.toLowerCase().includes(q))
    );
  });

  const totalReferredStudents = references.reduce((sum, r) => sum + (r.student_count || 0), 0);
  const totalReferredDues = references.reduce((sum, r) => sum + Number(r.total_referred_dues || 0), 0);

  const formatCurrency = (val) => {
    const num = Number(val || 0);
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(num);
  };

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>
              Reference Contacts Directory
            </h2>
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              backgroundColor: 'var(--primary-50)',
              color: 'var(--primary-700)',
              padding: '0.2rem 0.55rem',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--primary-100)'
            }}>
              First-Class Universal Directory
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
            Universal mentors, faculty liaisons, community references, and admission agents across cohorts.
          </p>
        </div>

        {(isAdmin || isPrincipal) && (
          <button
            onClick={openAddModal}
            className="btn btn-primary btn-sm"
            style={{ gap: '0.4rem' }}
          >
            <Plus size={15} />
            <span>+ Add Reference Contact</span>
          </button>
        )}
      </div>

      {/* Success Notification Banner */}
      {successMsg && (
        <div style={{
          padding: '0.85rem 1.15rem',
          backgroundColor: '#ECFDF5',
          border: '1px solid #A7F3D0',
          borderRadius: 'var(--radius-md)',
          color: '#065F46',
          fontSize: '0.85rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '1.25rem',
          animation: 'fadeIn 0.2s ease'
        }}>
          <Check size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Error Notification Banner */}
      {errorMsg && (
        <div style={{
          padding: '0.85rem 1.15rem',
          backgroundColor: '#FEF2F2',
          border: '1px solid #FECACA',
          borderRadius: 'var(--radius-md)',
          color: '#991B1B',
          fontSize: '0.85rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '1.25rem',
          animation: 'fadeIn 0.2s ease'
        }}>
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 3 Metric Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          padding: '1.15rem 1.25rem',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-xs)'
        }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Reference Contacts</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.35rem' }}>
            {references.length}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Available across all batches
          </div>
        </div>

        <div style={{
          backgroundColor: 'var(--bg-surface)',
          padding: '1.15rem 1.25rem',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-xs)'
        }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Students Referred</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-600)', marginTop: '0.35rem' }}>
            {totalReferredStudents}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Enrolled in institution
          </div>
        </div>

        <div style={{
          backgroundColor: 'var(--bg-surface)',
          padding: '1.15rem 1.25rem',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-xs)'
        }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Outstanding Dues</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--rose-text)', marginTop: '0.35rem' }}>
            {formatCurrency(totalReferredDues)}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Pending fee recovery
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-light)',
        padding: '0.85rem 1.15rem',
        marginBottom: '1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        boxShadow: 'var(--shadow-xs)'
      }}>
        <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: 420 }}>
          <Search size={15} style={{
            position: 'absolute',
            left: '0.75rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)'
          }} />
          <input
            type="text"
            placeholder="Search by name, phone, designation, or notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem 0.5rem 2.15rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-light)',
              backgroundColor: 'var(--bg-subtle)',
              fontSize: '0.82rem',
              color: 'var(--text-primary)',
              outline: 'none'
            }}
          />
        </div>

        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Showing <strong>{filteredReferences.length}</strong> of {references.length} contacts
        </div>
      </div>

      {/* Table of Reference Contacts */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-light)',
        boxShadow: 'var(--shadow-xs)',
        overflow: 'hidden'
      }}>
        <div className="table-responsive">
          <table style={{ width: '100%', minWidth: 700, borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{
                backgroundColor: 'var(--bg-subtle)',
                borderBottom: '1px solid var(--border-light)',
                color: 'var(--text-secondary)',
                fontSize: '0.74rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}>
                <th style={{ padding: '0.85rem 1.25rem' }}>Reference Contact</th>
                <th style={{ padding: '0.85rem 1rem' }}>Phone & WhatsApp</th>
                <th style={{ padding: '0.85rem 1rem' }}>Designation / Role</th>
                <th style={{ padding: '0.85rem 1rem' }}>Notes / Context</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>Referred Students</th>
                <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Referred Dues</th>
                <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReferences.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No reference contacts found matching "{search}".
                  </td>
                </tr>
              ) : (
                filteredReferences.map((r) => {
                  const cleanP = r.phone ? r.phone.replace(/[^0-9]/g, '') : '';
                  const waNumber = cleanP.length === 10 ? `91${cleanP}` : cleanP;

                  return (
                    <tr key={r.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '0.85rem 1.25rem' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                          {r.name}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          Ref ID: #{r.id}
                        </div>
                      </td>

                      <td style={{ padding: '0.85rem 1rem' }}>
                        {r.phone ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                            <a
                              href={`tel:${r.phone}`}
                              style={{
                                color: 'var(--text-primary)',
                                textDecoration: 'none',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.3rem'
                              }}
                              title="Click to Call"
                            >
                              <Phone size={13} style={{ color: 'var(--primary-600)' }} />
                              <span>{r.phone}</span>
                            </a>
                            {cleanP && (
                              <a
                                href={`https://wa.me/${waNumber}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  color: '#16A34A',
                                  padding: '0.15rem',
                                  borderRadius: 'var(--radius-sm)'
                                }}
                                title="Open WhatsApp Chat"
                              >
                                <MessageSquare size={14} />
                              </a>
                            )}
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>None</span>
                        )}
                      </td>

                      <td style={{ padding: '0.85rem 1rem' }}>
                        {r.designation ? (
                          <span style={{
                            padding: '0.2rem 0.55rem',
                            borderRadius: 'var(--radius-full)',
                            backgroundColor: 'var(--primary-50)',
                            color: 'var(--primary-700)',
                            fontSize: '0.75rem',
                            fontWeight: 700
                          }}>
                            {r.designation}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>—</span>
                        )}
                      </td>

                      <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)', fontSize: '0.8rem', maxWidth: 220 }}>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={r.notes}>
                          {r.notes || '—'}
                        </div>
                      </td>

                      <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                        <button
                          onClick={() => navigate(`/students?ref=${r.id}`)}
                          style={{
                            padding: '0.2rem 0.65rem',
                            borderRadius: 'var(--radius-full)',
                            backgroundColor: '#EFF6FF',
                            color: '#1D4ED8',
                            fontWeight: 700,
                            fontSize: '0.76rem',
                            border: '1px solid #BFDBFE',
                            cursor: 'pointer'
                          }}
                          title="View all students enrolled under this reference"
                        >
                          {r.student_count || 0} students
                        </button>
                      </td>

                      <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right', fontWeight: 800, color: Number(r.total_referred_dues) > 0 ? 'var(--rose-text)' : 'var(--emerald-text)' }}>
                        {formatCurrency(r.total_referred_dues)}
                      </td>

                      <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                          {(isAdmin || isPrincipal) && (
                            <>
                              <button
                                onClick={() => openEditModal(r)}
                                className="btn btn-secondary btn-sm"
                                style={{ padding: '0.35rem 0.55rem', fontSize: '0.76rem', gap: '0.25rem' }}
                                title="Edit Reference Particulars"
                              >
                                <Edit size={13} />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => setDeletingRef(r)}
                                className="btn btn-secondary btn-sm"
                                style={{ padding: '0.35rem 0.45rem', color: 'var(--rose-text)' }}
                                title="Delete Reference Contact"
                              >
                                <Trash2 size={13} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowAddModal(false)}
          style={{
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
          }}
        >
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-lg)',
              width: '100%',
              maxWidth: 500,
              boxShadow: 'var(--shadow-xl)',
              border: '1px solid var(--border-light)',
              overflow: 'hidden'
            }}
          >
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
                  width: 36,
                  height: 36,
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--primary-50)',
                  color: 'var(--primary-600)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <UserCheck size={18} />
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Add Reference Contact
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Full Name <span style={{ color: 'var(--rose-text)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Master Anji or Madam Jyothi"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-light)',
                      fontSize: '0.85rem',
                      outline: 'none',
                      backgroundColor: 'var(--bg-surface)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Phone / WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    placeholder="10-digit mobile number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-light)',
                      fontSize: '0.85rem',
                      outline: 'none',
                      backgroundColor: 'var(--bg-surface)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Designation / Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Senior Lecturer, District Agent, Headmaster, Trustee"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-light)',
                      fontSize: '0.85rem',
                      outline: 'none',
                      backgroundColor: 'var(--bg-surface)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Notes & Institutional Affiliation
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Additional context, address, or referral notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-light)',
                      fontSize: '0.85rem',
                      outline: 'none',
                      backgroundColor: 'var(--bg-surface)',
                      color: 'var(--text-primary)',
                      resize: 'vertical'
                    }}
                  />
                </div>
              </div>

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
                  onClick={() => setShowAddModal(false)}
                  className="btn btn-secondary"
                  disabled={formSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={formSubmitting}
                  style={{ minWidth: 140, justifyContent: 'center' }}
                >
                  {formSubmitting ? 'Saving...' : '+ Save Reference'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingRef && (
        <div
          className="modal-overlay"
          onClick={() => setEditingRef(null)}
          style={{
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
          }}
        >
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-lg)',
              width: '100%',
              maxWidth: 500,
              boxShadow: 'var(--shadow-xl)',
              border: '1px solid var(--border-light)',
              overflow: 'hidden'
            }}
          >
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
                  width: 36,
                  height: 36,
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--primary-50)',
                  color: 'var(--primary-600)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Edit size={18} />
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Edit Reference Contact
                </h3>
              </div>
              <button
                onClick={() => setEditingRef(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdate}>
              <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Full Name <span style={{ color: 'var(--rose-text)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-light)',
                      fontSize: '0.85rem',
                      outline: 'none',
                      backgroundColor: 'var(--bg-surface)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Phone / WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-light)',
                      fontSize: '0.85rem',
                      outline: 'none',
                      backgroundColor: 'var(--bg-surface)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Designation / Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Senior Lecturer, District Agent, Headmaster, Trustee"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-light)',
                      fontSize: '0.85rem',
                      outline: 'none',
                      backgroundColor: 'var(--bg-surface)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Notes & Institutional Affiliation
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-light)',
                      fontSize: '0.85rem',
                      outline: 'none',
                      backgroundColor: 'var(--bg-surface)',
                      color: 'var(--text-primary)',
                      resize: 'vertical'
                    }}
                  />
                </div>
              </div>

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
                  onClick={() => setEditingRef(null)}
                  className="btn btn-secondary"
                  disabled={formSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={formSubmitting}
                  style={{ minWidth: 140, justifyContent: 'center' }}
                >
                  {formSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingRef && (
        <div
          className="modal-overlay"
          onClick={() => setDeletingRef(null)}
          style={{
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
          }}
        >
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-lg)',
              width: '100%',
              maxWidth: 440,
              boxShadow: 'var(--shadow-xl)',
              border: '1px solid var(--border-light)',
              padding: '1.5rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: '#B91C1C', marginBottom: '0.75rem' }}>
              <AlertCircle size={22} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>
                Remove Reference Contact?
              </h3>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
              Are you sure you want to remove <strong>"{deletingRef.name}"</strong>?
              Enrolled students will not be deleted, but will be unlinked from this reference contact.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem' }}>
              <button
                onClick={() => setDeletingRef(null)}
                className="btn btn-secondary btn-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deletingRef)}
                className="btn btn-sm"
                style={{ backgroundColor: '#DC2626', color: '#FFFFFF' }}
              >
                Yes, Remove Contact
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
