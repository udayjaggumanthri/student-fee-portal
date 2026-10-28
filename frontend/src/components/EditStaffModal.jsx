import React, { useState } from 'react';
import { X, User, Mail, Phone, ShieldCheck, Layers, AlertCircle, Check } from 'lucide-react';
import { api } from '../services/api';

export default function EditStaffModal({
  staff,
  batches = [],
  currentRole,
  onClose,
  onStaffUpdated
}) {
  const [name, setName] = useState(staff?.user_name || staff?.username || '');
  const [email, setEmail] = useState(staff?.email || '');
  const [phone, setPhone] = useState(staff?.phone || '');
  const [role, setRole] = useState(staff?.role || 'TEACHER_CALLER');
  const [selectedBatchIds, setSelectedBatchIds] = useState(() => {
    return (staff?.assigned_batch_ids || []).map(b => typeof b === 'object' ? b.id : b);
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!staff) return null;

  const isAdmin = currentRole === 'ADMIN';

  const handleToggleBatch = (bId) => {
    setSelectedBatchIds(prev =>
      prev.includes(bId) ? prev.filter(id => id !== bId) : [...prev, bId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Staff member name cannot be blank.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        assigned_batch_ids: selectedBatchIds
      };

      if (isAdmin) {
        payload.role = role;
      }

      await api.updateStaff(staff.id, payload);
      if (onStaffUpdated) {
        await onStaffUpdated();
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update staff member.');
    } finally {
      setLoading(false);
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
        borderRadius: 'var(--radius-lg)',
        width: '100%',
        maxWidth: 540,
        boxShadow: 'var(--shadow-xl)',
        border: '1px solid var(--border-light)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '90vh'
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
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Edit Staff Member
            </h3>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Account: <strong>@{staff.username}</strong>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              border: 'none',
              background: 'transparent',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '0.35rem',
              borderRadius: 'var(--radius-sm)'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{
            margin: '1rem 1.5rem 0',
            padding: '0.75rem',
            backgroundColor: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: 'var(--radius-md)',
            color: '#B91C1C',
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ overflowY: 'auto', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              Full Name *
            </label>
            <div style={{ position: 'relative' }}>
              <User size={15} style={{ position: 'absolute', left: 10, top: 11, color: 'var(--text-muted)' }} />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem 0.55rem 2rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-light)',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: 10, top: 11, color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem 0.55rem 2rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-light)',
                    fontSize: '0.85rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Phone / Mobile Number
              </label>
              <div style={{ position: 'relative' }}>
                <Phone size={15} style={{ position: 'absolute', left: 10, top: 11, color: 'var(--text-muted)' }} />
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem 0.55rem 2rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-light)',
                    fontSize: '0.85rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Role Selection (Only Admin can change roles) */}
          {isAdmin && (
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Institutional Role
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                {[
                  { id: 'ADMIN', label: 'Admin', desc: 'Full System' },
                  { id: 'PRINCIPAL', label: 'Principal', desc: 'Oversight' },
                  { id: 'TEACHER_CALLER', label: 'Staff / Caller', desc: 'Collections' }
                ].map(r => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id)}
                    style={{
                      padding: '0.6rem 0.4rem',
                      borderRadius: 'var(--radius-sm)',
                      border: role === r.id ? '2px solid var(--primary-600)' : '1px solid var(--border-light)',
                      backgroundColor: role === r.id ? 'var(--primary-50, #EFF6FF)' : 'var(--bg-surface)',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: role === r.id ? 'var(--primary-700)' : 'var(--text-primary)' }}>
                      {r.label}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{r.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Batch Assignments */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Assigned Batches / Cohorts
              </label>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {role === 'ADMIN' || role === 'PRINCIPAL' ? 'Unrestricted (all cohorts)' : `${selectedBatchIds.length} cohorts selected`}
              </span>
            </div>

            {role === 'ADMIN' || role === 'PRINCIPAL' ? (
              <div style={{
                padding: '0.65rem 0.85rem',
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.78rem',
                color: 'var(--text-secondary)'
              }}>
                Administrators and Principals have campus-wide access to all student cohorts automatically.
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                gap: '0.45rem',
                maxHeight: 140,
                overflowY: 'auto',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.5rem'
              }}>
                {batches.map(b => {
                  const checked = selectedBatchIds.includes(b.id);
                  return (
                    <label
                      key={b.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        fontSize: '0.78rem',
                        padding: '0.35rem 0.5rem',
                        borderRadius: 'var(--radius-xs)',
                        backgroundColor: checked ? '#EFF6FF' : 'transparent',
                        cursor: 'pointer',
                        color: checked ? '#1D4ED8' : 'var(--text-primary)',
                        fontWeight: checked ? 700 : 500
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleToggleBatch(b.id)}
                      />
                      <span>{b.batch_name}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Buttons */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '0.5rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid var(--border-light)',
            marginTop: '0.5rem'
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
              style={{ gap: '0.35rem' }}
            >
              <Check size={15} />
              <span>{loading ? 'Saving...' : 'Save Staff Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
