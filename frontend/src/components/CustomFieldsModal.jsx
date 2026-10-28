import React, { useState, useEffect } from 'react';
import { X, Plus, ShieldAlert, Check, Tag } from 'lucide-react';
import { api } from '../services/api';

export default function CustomFieldsModal({ onClose }) {
  const [fields, setFields] = useState([]);
  const [label, setLabel] = useState('');
  const [key, setKey] = useState('');
  const [fieldType, setFieldType] = useState('text');
  const [isMasked, setIsMasked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const loadFields = async () => {
    try {
      const data = await api.getCustomFields();
      setFields(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadFields();
  }, []);

  const handleLabelChange = (e) => {
    const val = e.target.value;
    setLabel(val);
    // Auto generate slug key
    const slug = val.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').slice(0, 30);
    setKey(slug);
  };

  const handleCreateField = async (e) => {
    e.preventDefault();
    if (!label.trim() || !key.trim()) return;

    setLoading(true);
    try {
      await api.addCustomField({
        field_label: label.trim(),
        field_key: key.trim(),
        field_type: fieldType,
        is_masked_for_callers: isMasked
      });
      setMessage(`Added dynamic field "${label}" successfully!`);
      setLabel('');
      setKey('');
      setIsMasked(false);
      await loadFields();
    } catch (e) {
      setMessage('Error adding field');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Dynamic Custom Fields Builder</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Add new attributes (e.g. Contact 3, Aadhaar, Address) without schema changes
            </p>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-icon" style={{ border: 'none' }}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {message && (
            <div style={{
              padding: '0.65rem 0.85rem',
              backgroundColor: '#ECFDF5',
              color: '#065F46',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.82rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem'
            }}>
              <Check size={16} />
              <span>{message}</span>
            </div>
          )}

          {/* Form to add new field */}
          <form onSubmit={handleCreateField} style={{
            backgroundColor: 'var(--bg-subtle)',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            border: '1px solid var(--border-light)'
          }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              + Add New Custom Attribute
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                  Field Label:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Contact 3 / Guardian Phone"
                  value={label}
                  onChange={handleLabelChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.65rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-light)',
                    fontSize: '0.85rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                  Field Identifier (Key):
                </label>
                <input
                  type="text"
                  placeholder="e.g. contact_3"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.65rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-light)',
                    fontSize: '0.85rem',
                    outline: 'none',
                    backgroundColor: '#FFFFFF'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                  Field Type:
                </label>
                <select
                  value={fieldType}
                  onChange={(e) => setFieldType(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.65rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-light)',
                    fontSize: '0.85rem',
                    backgroundColor: '#FFFFFF',
                    outline: 'none'
                  }}
                >
                  <option value="text">Text / String</option>
                  <option value="phone">Phone Number</option>
                  <option value="number">Numeric</option>
                  <option value="date">Date</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', marginTop: '1.25rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={isMasked}
                    onChange={(e) => setIsMasked(e.target.checked)}
                  />
                  <span>Mask / Hide for Callers</span>
                </label>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary btn-sm" style={{ width: '100%' }}>
              <Plus size={14} />
              <span>{loading ? 'Creating...' : 'Save Dynamic Field'}</span>
            </button>
          </form>

          {/* Existing Fields List */}
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
              Configured Dynamic Fields ({fields.length}):
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {fields.map((f) => (
                <div key={f.id} style={{
                  padding: '0.55rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-light)',
                  backgroundColor: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.82rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <Tag size={14} style={{ color: 'var(--primary-600)' }} />
                    <strong>{f.field_label}</strong>
                    <code style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>({f.field_key})</code>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="badge badge-neutral" style={{ fontSize: '0.68rem' }}>{f.field_type}</span>
                    {f.is_masked_for_callers && (
                      <span className="badge badge-unpaid" style={{ fontSize: '0.68rem' }}>
                        <ShieldAlert size={11} /> Masked
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
