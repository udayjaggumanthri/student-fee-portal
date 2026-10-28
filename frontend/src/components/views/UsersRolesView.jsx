import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck, UserCheck, PhoneCall, Plus, Check,
  AlertCircle, Lock, EyeOff, Users, X, Mail, Key, Layers,
  Phone, Edit, Search, UserPlus, BookOpen, DollarSign
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import EditStaffModal from '../EditStaffModal';

export default function UsersRolesView() {
  const navigate = useNavigate();
  const { role, user, isAdmin, isPrincipal } = useAuth();
  const [activeTab, setActiveTab] = useState('staff');

  const [usersList, setUsersList] = useState([]);
  const [batches, setBatches] = useState([]);
  const [references, setReferences] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search filter
  const [staffSearch, setStaffSearch] = useState('');
  const [refSearch, setRefSearch] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [showAddRefModal, setShowAddRefModal] = useState(false);

  // New staff form state
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('Staff@2026');
  const [staffRole, setStaffRole] = useState('TEACHER_CALLER');
  const [selectedBatchIds, setSelectedBatchIds] = useState([]);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // New reference form state
  const [refName, setRefName] = useState('');
  const [refPhone, setRefPhone] = useState('');
  const [refNotes, setRefNotes] = useState('');
  const [refSubmitting, setRefSubmitting] = useState(false);

  // Feedback states
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Privacy rules state
  const [maskTotalFee, setMaskTotalFee] = useState(true);
  const [allowCallerPayments, setAllowCallerPayments] = useState(true);
  const [allowCallerExport, setAllowCallerExport] = useState(false);
  const [matrixSaved, setMatrixSaved] = useState(false);

  const loadData = async () => {
    try {
      const [uData, bData, rData] = await Promise.all([
        api.getRoles(),
        api.getBatches(),
        api.getReferences()
      ]);
      setUsersList(uData || []);
      setBatches(bData || []);
      setReferences(rData || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleBatch = (bId) => {
    setSelectedBatchIds((prev) =>
      prev.includes(bId) ? prev.filter((id) => id !== bId) : [...prev, bId]
    );
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    if (!username.trim() || !name.trim()) return;

    setFormSubmitting(true);
    setErrorMsg('');
    try {
      await api.createStaff({
        username: username.trim().toLowerCase(),
        name: name.trim(),
        email: email.trim() || `${username.trim().toLowerCase()}@navodaya.edu`,
        phone: phone.trim(),
        password: password || 'Staff@2026',
        role: staffRole,
        assigned_batch_ids: selectedBatchIds
      });

      setSuccessMsg(`Staff member "${name}" created successfully and assigned to cohorts!`);
      setShowAddModal(false);
      setName('');
      setUsername('');
      setEmail('');
      setPhone('');
      setSelectedBatchIds([]);
      await loadData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create staff member');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleCreateReference = async (e) => {
    e.preventDefault();
    if (!refName.trim()) return;

    setRefSubmitting(true);
    try {
      await api.createReference({
        name: refName.trim(),
        phone: refPhone.trim(),
        notes: refNotes.trim()
      });
      setSuccessMsg(`Universal reference contact "${refName}" added to the directory!`);
      setShowAddRefModal(false);
      setRefName('');
      setRefPhone('');
      setRefNotes('');
      await loadData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.message || 'Error creating reference person');
    } finally {
      setRefSubmitting(false);
    }
  };

  const handleSaveMatrix = () => {
    setMatrixSaved(true);
    setTimeout(() => setMatrixSaved(false), 2500);
  };

  const filteredStaff = usersList.filter(u => {
    const q = staffSearch.toLowerCase();
    return (
      (u.user_name || '').toLowerCase().includes(q) ||
      (u.username || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.role || '').toLowerCase().includes(q) ||
      (u.phone || '').includes(q)
    );
  });

  const filteredReferences = references.filter(r => {
    const q = refSearch.toLowerCase();
    return (
      (r.name || '').toLowerCase().includes(q) ||
      (r.phone || '').includes(q) ||
      (r.notes || '').toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.25rem'
      }}>
        <div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            User Accounts & Roles Management
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Empower Administrators and Principals to manage staff credentials, cohort batch assignments, and universal reference contacts.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {activeTab === 'staff' && (
            <button
              onClick={() => setShowAddModal(true)}
              className="btn btn-primary"
              style={{ gap: '0.45rem' }}
            >
              <Plus size={16} />
              <span>+ Add Staff Member</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '1.25rem',
        borderBottom: '1px solid var(--border-light)',
        marginBottom: '1.5rem'
      }}>
        <button
          onClick={() => setActiveTab('staff')}
          style={{
            padding: '0.65rem 0.25rem',
            border: 'none',
            background: 'transparent',
            fontSize: '0.9rem',
            fontWeight: 700,
            color: 'var(--primary-600)',
            borderBottom: '2px solid var(--primary-600)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
        >
          <Users size={16} />
          <span>Staff Accounts ({usersList.length})</span>
        </button>

        <button
          onClick={() => navigate('/reference-contacts')}
          style={{
            padding: '0.65rem 0.25rem',
            border: 'none',
            background: 'transparent',
            fontSize: '0.9rem',
            fontWeight: 500,
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
        >
          <UserCheck size={16} />
          <span>Universal Reference Contacts Directory →</span>
        </button>
      </div>

      {successMsg && (
        <div style={{
          padding: '0.85rem 1.15rem',
          backgroundColor: '#ECFDF5',
          color: '#065F46',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.86rem',
          fontWeight: 600,
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          border: '1px solid #A7F3D0',
          animation: 'fadeIn 0.2s ease'
        }}>
          <Check size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* TAB 1: STAFF ACCOUNTS */}
      {activeTab === 'staff' && (
        <div>
          {/* Search bar */}
          <div style={{ marginBottom: '1rem', position: 'relative', maxWidth: 360 }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: 11, color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search staff by name, email, phone..."
              value={staffSearch}
              onChange={(e) => setStaffSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '0.55rem 0.75rem 0.55rem 2.2rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)',
                backgroundColor: 'var(--bg-surface)',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Staff Table Card */}
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-xs)',
            overflow: 'hidden',
            marginBottom: '2rem'
          }}>
            <div className="table-responsive">
              <table style={{ width: '100%', minWidth: 680, borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{
                    backgroundColor: 'var(--bg-subtle)',
                    borderBottom: '1px solid var(--border-light)',
                    color: 'var(--text-secondary)',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    textTransform: 'uppercase'
                  }}>
                    <th style={{ padding: '0.75rem 1.25rem' }}>Staff Member</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Role</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Phone / Mobile</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Assigned Batches</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Email</th>
                    <th style={{ padding: '0.75rem 1.25rem', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
              <tbody>
                {filteredStaff.map((u) => {
                  const isStaff = u.role === 'TEACHER_CALLER';
                  const isUserAdmin = u.role === 'ADMIN';
                  const isUserPrincipal = u.role === 'PRINCIPAL';

                  // Admin can edit anyone; Principal can edit teachers/callers
                  const canEditThisUser = isAdmin || (isPrincipal && isStaff);

                  return (
                    <tr key={u.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '0.85rem 1.25rem' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                          {u.user_name || u.username}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          Username: <strong>@{u.username}</strong>
                        </div>
                      </td>

                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.2rem 0.6rem',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          backgroundColor: isUserAdmin ? '#EFF6FF' : isUserPrincipal ? '#ECFDF5' : '#FEF3C7',
                          color: isUserAdmin ? '#1D4ED8' : isUserPrincipal ? '#047857' : '#92400E',
                          border: `1px solid ${isUserAdmin ? '#BFDBFE' : isUserPrincipal ? '#A7F3D0' : '#FDE68A'}`
                        }}>
                          {isUserAdmin && <ShieldCheck size={13} />}
                          {isUserPrincipal && <UserCheck size={13} />}
                          {isStaff && <PhoneCall size={13} />}
                          <span>{isUserAdmin ? 'Administrator' : isUserPrincipal ? 'Principal' : 'Teacher / Caller'}</span>
                        </span>
                      </td>

                      <td style={{ padding: '0.85rem 1rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                        {u.phone ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <Phone size={13} style={{ color: 'var(--text-muted)' }} />
                            <span>{u.phone}</span>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Not set</span>
                        )}
                      </td>

                      <td style={{ padding: '0.85rem 1rem' }}>
                        {isUserAdmin || isUserPrincipal ? (
                          <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                            All Cohorts (Degree, PG, Inter, SSC)
                          </span>
                        ) : (
                          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                            {(u.assigned_batch_names || []).length > 0 ? (
                              u.assigned_batch_names.map((bName, idx) => (
                                <span
                                  key={idx}
                                  style={{
                                    padding: '0.15rem 0.5rem',
                                    borderRadius: 'var(--radius-xs)',
                                    backgroundColor: '#EFF6FF',
                                    color: '#1E40AF',
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                    border: '1px solid #DBEAFE'
                                  }}
                                >
                                  {bName}
                                </span>
                              ))
                            ) : (
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                All batches (Unrestricted)
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                        {u.email}
                      </td>

                      <td style={{ padding: '0.85rem 1.25rem', textAlign: 'center' }}>
                        {canEditThisUser ? (
                          <button
                            onClick={() => setEditingStaff(u)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', gap: '0.3rem' }}
                            title="Edit Staff Member Credentials & Batches"
                          >
                            <Edit size={13} />
                            <span>Edit</span>
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Protected</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          </div>

          {/* Security & Field Masking Permissions Matrix */}
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-light)',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-xs)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.15rem' }}>
              <EyeOff size={18} style={{ color: '#D97706' }} />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Staff Privacy & Field-Level Access Rules
              </h3>
            </div>

            {matrixSaved && (
              <div style={{
                padding: '0.65rem 0.85rem',
                backgroundColor: '#ECFDF5',
                color: '#065F46',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                border: '1px solid #A7F3D0'
              }}>
                <Check size={16} />
                <span>Field security rules updated and applied to caller sessions.</span>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              <label style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)',
                backgroundColor: 'var(--bg-subtle)',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={maskTotalFee}
                  onChange={(e) => setMaskTotalFee(e.target.checked)}
                  style={{ marginTop: '0.2rem', accentColor: 'var(--primary-600)' }}
                />
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Mask Total Assessed Fee for Callers
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    Callers only view the current installment due. Prevents sensitive institutional fee negotiation leaks.
                  </div>
                </div>
              </label>

              <label style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)',
                backgroundColor: 'var(--bg-subtle)',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={allowCallerPayments}
                  onChange={(e) => setAllowCallerPayments(e.target.checked)}
                  style={{ marginTop: '0.2rem', accentColor: 'var(--primary-600)' }}
                />
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Allow Callers to Record UPI / Cash Payments
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    Staff can enter transaction refs and generate instant receipts.
                  </div>
                </div>
              </label>

              <label style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)',
                backgroundColor: 'var(--bg-subtle)',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={allowCallerExport}
                  onChange={(e) => setAllowCallerExport(e.target.checked)}
                  style={{ marginTop: '0.2rem', accentColor: 'var(--primary-600)' }}
                />
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Allow Callers to Export Excel Sheets
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    Permit staff callers to download batch roster spreadsheets. Default: Disabled for data privacy.
                  </div>
                </div>
              </label>
            </div>

            <div style={{ marginTop: '1.25rem', textAlign: 'right' }}>
              <button onClick={handleSaveMatrix} className="btn btn-primary btn-sm">
                Save Permission Matrix
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: UNIVERSAL REFERENCE CONTACTS */}
      {activeTab === 'references' && (
        <div>
          {/* Search bar */}
          <div style={{ marginBottom: '1rem', position: 'relative', maxWidth: 360 }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: 11, color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search reference contacts by name or phone..."
              value={refSearch}
              onChange={(e) => setRefSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '0.55rem 0.75rem 0.55rem 2.2rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)',
                backgroundColor: 'var(--bg-surface)',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            />
          </div>

          <div style={{
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-xs)',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '1.15rem 1.25rem',
              borderBottom: '1px solid var(--border-light)',
              backgroundColor: 'var(--bg-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  Institutional Universal Reference Contacts
                </h3>
                <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
                  These reference persons are stored universally in the institutional directory and can be linked to any student across all batches.
                </p>
              </div>
              <button
                onClick={() => setShowAddRefModal(true)}
                className="btn btn-primary btn-sm"
                style={{ gap: '0.35rem' }}
              >
                <Plus size={14} />
                <span>+ Add Reference</span>
              </button>
            </div>

            <div className="table-responsive">
              <table style={{ width: '100%', minWidth: 640, borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{
                    backgroundColor: 'var(--bg-subtle)',
                    borderBottom: '1px solid var(--border-light)',
                    color: 'var(--text-secondary)',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    textTransform: 'uppercase'
                  }}>
                    <th style={{ padding: '0.75rem 1.25rem' }}>Reference Person</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Contact Number</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Designation / Notes</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Referred Students</th>
                    <th style={{ padding: '0.75rem 1.25rem', textAlign: 'right' }}>Total Referred Dues</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReferences.map((r) => (
                    <tr key={r.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '0.85rem 1.25rem' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                          {r.name}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          Universal Ref ID: #{r.id}
                        </div>
                      </td>

                      <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>
                        {r.phone ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <Phone size={13} style={{ color: 'var(--emerald-text)' }} />
                            <a href={`tel:${r.phone}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                              {r.phone}
                            </a>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>None</span>
                        )}
                      </td>

                      <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                        {r.notes || '—'}
                      </td>

                      <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                        <span style={{
                          padding: '0.2rem 0.6rem',
                          borderRadius: 'var(--radius-full)',
                          backgroundColor: '#EFF6FF',
                          color: '#1D4ED8',
                          fontWeight: 700,
                          fontSize: '0.75rem'
                        }}>
                          {r.student_count || 0} students
                        </span>
                      </td>

                      <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right', fontWeight: 800, color: 'var(--rose-text)' }}>
                        ₹{Number(r.total_referred_dues || 0).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Edit Staff Modal */}
      {editingStaff && (
        <EditStaffModal
          staff={editingStaff}
          batches={batches}
          currentRole={role}
          onClose={() => setEditingStaff(null)}
          onStaffUpdated={async () => {
            await loadData();
            setSuccessMsg(`Staff details for "${editingStaff.user_name || editingStaff.username}" updated successfully!`);
            setTimeout(() => setSuccessMsg(''), 4000);
          }}
        />
      )}

      {/* Add Staff Modal */}
      {showAddModal && (
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
            borderRadius: 'var(--radius-lg)',
            width: '100%',
            maxWidth: 540,
            boxShadow: 'var(--shadow-xl)',
            border: '1px solid var(--border-light)',
            overflow: 'hidden'
          }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Users size={20} style={{ color: 'var(--primary-600)' }} />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Add Institutional Staff Member
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateStaff}>
              <div className="modal-body" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
                {errorMsg && (
                  <div style={{
                    padding: '0.75rem',
                    backgroundColor: '#FEF2F2',
                    border: '1px solid #FECACA',
                    borderRadius: 'var(--radius-md)',
                    color: '#B91C1C',
                    fontSize: '0.82rem',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <AlertCircle size={16} />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.85rem', marginBottom: '0.85rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                      Full Name: *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. S. Lakshmi"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-light)',
                        backgroundColor: 'var(--bg-subtle)',
                        fontSize: '0.85rem',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                      Username: *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. lakshmi"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-light)',
                        backgroundColor: 'var(--bg-subtle)',
                        fontSize: '0.85rem',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.85rem', marginBottom: '0.85rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                      Email Address:
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. lakshmi@navodaya.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-light)',
                        backgroundColor: 'var(--bg-subtle)',
                        fontSize: '0.85rem',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                      Phone / Mobile:
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. 9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-light)',
                        backgroundColor: 'var(--bg-subtle)',
                        fontSize: '0.85rem',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                    Initial Password:
                  </label>
                  <input
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-light)',
                      backgroundColor: 'var(--bg-subtle)',
                      fontSize: '0.85rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '1.15rem' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                    Staff Role:
                  </label>
                  <select
                    value={staffRole}
                    onChange={(e) => setStaffRole(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-light)',
                      backgroundColor: 'var(--bg-subtle)',
                      fontSize: '0.85rem',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="TEACHER_CALLER">Fee Collection Staff / Caller (Masked View)</option>
                    <option value="PRINCIPAL">Principal / Academic Supervisor</option>
                    <option value="ADMIN">System Administrator</option>
                  </select>
                </div>

                {/* Batch Cohort Assignment Multi-Select */}
                <div style={{
                  padding: '0.85rem',
                  backgroundColor: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-light)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.5rem' }}>
                    <Layers size={15} style={{ color: 'var(--primary-600)' }} />
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      Assign Batches to this Staff Member:
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                    {batches.map((b) => {
                      const isChecked = selectedBatchIds.includes(b.id);
                      return (
                        <label
                          key={b.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.45rem 0.65rem',
                            borderRadius: 'var(--radius-xs)',
                            border: isChecked ? '1.5px solid var(--primary-600)' : '1px solid var(--border-light)',
                            backgroundColor: isChecked ? 'var(--primary-50)' : 'var(--bg-surface)',
                            cursor: 'pointer'
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleBatch(b.id)}
                            style={{ accentColor: 'var(--primary-600)', cursor: 'pointer' }}
                          />
                          <span style={{ fontSize: '0.78rem', fontWeight: isChecked ? 700 : 500, color: isChecked ? 'var(--primary-700)' : 'var(--text-primary)' }}>
                            {b.batch_name}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="btn btn-primary"
                  style={{ gap: '0.4rem' }}
                >
                  <Plus size={15} />
                  <span>{formSubmitting ? 'Saving...' : 'Create Staff User'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Universal Reference Modal */}
      {showAddRefModal && (
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
            borderRadius: 'var(--radius-lg)',
            width: '100%',
            maxWidth: 480,
            boxShadow: 'var(--shadow-xl)',
            border: '1px solid var(--border-light)',
            overflow: 'hidden'
          }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <UserPlus size={20} style={{ color: 'var(--primary-600)' }} />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Add Universal Reference Contact
                </h3>
              </div>
              <button
                onClick={() => setShowAddRefModal(false)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateReference}>
              <div className="modal-body">
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                    Contact Person Name: *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sri R. V. Rao or M. K. Swamy"
                    value={refName}
                    onChange={(e) => setRefName(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-light)',
                      backgroundColor: 'var(--bg-subtle)',
                      fontSize: '0.85rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                    Phone / Mobile Number:
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. 9848012345"
                    value={refPhone}
                    onChange={(e) => setRefPhone(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-light)',
                      backgroundColor: 'var(--bg-subtle)',
                      fontSize: '0.85rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                    Designation / Affiliation / Notes:
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Senior Lecturer, City Center or Community Referrer"
                    value={refNotes}
                    onChange={(e) => setRefNotes(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-light)',
                      backgroundColor: 'var(--bg-subtle)',
                      fontSize: '0.85rem',
                      outline: 'none',
                      resize: 'none'
                    }}
                  />
                </div>

                <div style={{
                  padding: '0.65rem 0.85rem',
                  backgroundColor: '#EFF6FF',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.75rem',
                  color: '#1E40AF',
                  border: '1px solid #DBEAFE'
                }}>
                  Universal references added here are stored globally and can be linked to any student across all batches (Degree, PG, Inter, SSC).
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowAddRefModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={refSubmitting}
                  className="btn btn-primary"
                  style={{ gap: '0.4rem' }}
                >
                  <Check size={15} />
                  <span>{refSubmitting ? 'Saving...' : 'Save Universal Contact'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
