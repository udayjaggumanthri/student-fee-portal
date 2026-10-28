import React, { useState } from 'react';
import {
  FileSpreadsheet, Plus, Edit2, Trash2, CheckCircle2,
  MoreVertical, Layers, BookOpen, AlertCircle, Info, Users
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function FeeStructureView({ batches, programs, onInspectBatch }) {
  const { isCaller } = useAuth();

  // Selected Program and Batch
  const [selectedProgramId, setSelectedProgramId] = useState(programs[0]?.id ? String(programs[0].id) : '1');
  const [selectedBatchId, setSelectedBatchId] = useState(batches[0]?.id ? String(batches[0].id) : '1');
  const [selectedYear, setSelectedYear] = useState('1');

  // Fee templates per program
  const [feeTemplates, setFeeTemplates] = useState({
    DEGREE: [
      { id: 1, name: 'Annual Tuition Fee', amount: 35000, type: 'Mandatory' },
      { id: 2, name: 'University Examination Fee', amount: 3500, type: 'Mandatory' },
      { id: 3, name: 'Special Coaching & Study Center Fee', amount: 5000, type: 'Mandatory' },
      { id: 4, name: 'Lab Practical & Records Fee', amount: 2500, type: 'Optional' },
      { id: 5, name: 'Registration & Provisional ID Fee', amount: 1500, type: 'Mandatory' }
    ],
    PG: [
      { id: 1, name: 'Master Program Tuition Fee', amount: 45000, type: 'Mandatory' },
      { id: 2, name: 'University Exam Fee', amount: 5000, type: 'Mandatory' },
      { id: 3, name: 'Special Seminar & Project Guidance', amount: 8000, type: 'Mandatory' },
      { id: 4, name: 'Assignment & Record Submission', amount: 2000, type: 'Optional' }
    ],
    INTER: [
      { id: 1, name: 'Intermediate Course Tuition', amount: 20000, type: 'Mandatory' },
      { id: 2, name: 'Science Practical & Lab Fee', amount: 3000, type: 'Optional' },
      { id: 3, name: 'Board Examination Fee', amount: 2500, type: 'Mandatory' },
      { id: 4, name: 'Study Material & Record Books', amount: 1500, type: 'Mandatory' }
    ],
    SSC: [
      { id: 1, name: 'APOSS 10th Class Tuition (5/6 Subjects)', amount: 14000, type: 'Mandatory' },
      { id: 2, name: 'State Board Registration Fee', amount: 1500, type: 'Mandatory' },
      { id: 3, name: 'Assignment Workbooks & Coaching', amount: 2500, type: 'Mandatory' }
    ]
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [newHeadName, setNewHeadName] = useState('');
  const [newHeadAmount, setNewHeadAmount] = useState('');
  const [newHeadType, setNewHeadType] = useState('Mandatory');

  const currentProgram = programs.find((p) => String(p.id) === String(selectedProgramId)) || programs[0];
  const programCode = currentProgram?.code || 'DEGREE';
  const currentHeads = feeTemplates[programCode] || feeTemplates.DEGREE;

  // Filter batches for selected program
  const applicableBatches = batches.filter((b) => String(b.program) === String(selectedProgramId));
  const currentBatch = batches.find((b) => String(b.id) === String(selectedBatchId)) || applicableBatches[0] || batches[0];

  const handleAddHead = (e) => {
    e.preventDefault();
    if (!newHeadName || !newHeadAmount) return;

    setFeeTemplates((prev) => ({
      ...prev,
      [programCode]: [
        ...(prev[programCode] || []),
        {
          id: Date.now(),
          name: newHeadName.trim(),
          amount: Number(newHeadAmount),
          type: newHeadType
        }
      ]
    }));

    setNewHeadName('');
    setNewHeadAmount('');
    setShowAddModal(false);
  };

  const handleDeleteHead = (id) => {
    setFeeTemplates((prev) => ({
      ...prev,
      [programCode]: (prev[programCode] || []).filter((item) => item.id !== id)
    }));
  };

  const totalFeeStructure = currentHeads.reduce((acc, curr) => acc + curr.amount, 0);

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
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Fee Structure Configuration
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Configure institutional fee heads, academic year installments, and student-level obligation templates.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary btn-sm"
            style={{ gap: '0.4rem' }}
          >
            <Plus size={15} />
            <span>+ Add Fee Head</span>
          </button>
        </div>
      </div>

      {/* Program, Batch, Year Filter Bar */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-light)',
        padding: '1rem 1.25rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        flexWrap: 'wrap',
        boxShadow: 'var(--shadow-xs)'
      }}>
        {/* Program Selector */}
        <div style={{ flex: '1 1 220px' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
            Academic Program Tier
          </label>
          <select
            value={selectedProgramId}
            onChange={(e) => {
              setSelectedProgramId(e.target.value);
              const matching = batches.filter((b) => String(b.program) === e.target.value);
              if (matching.length > 0) setSelectedBatchId(String(matching[0].id));
            }}
            style={{
              width: '100%',
              padding: '0.55rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-light)',
              backgroundColor: 'var(--bg-subtle)',
              fontSize: '0.84rem',
              color: 'var(--text-primary)',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            {programs.map((p) => (
              <option key={p.id} value={String(p.id)}>{p.name} ({p.duration_years} Yr)</option>
            ))}
          </select>
        </div>

        {/* Batch Selector */}
        <div style={{ flex: '1 1 220px' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
            Academic Batch / Cohort
          </label>
          <select
            value={selectedBatchId}
            onChange={(e) => setSelectedBatchId(e.target.value)}
            style={{
              width: '100%',
              padding: '0.55rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-light)',
              backgroundColor: 'var(--bg-subtle)',
              fontSize: '0.84rem',
              color: 'var(--text-primary)',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            {applicableBatches.map((b) => (
              <option key={b.id} value={String(b.id)}>{b.batch_name} ({b.academic_year})</option>
            ))}
          </select>
        </div>

        {/* Year / Period Selector */}
        <div style={{ flex: '1 1 160px' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
            Academic Period / Year
          </label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            style={{
              width: '100%',
              padding: '0.55rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-light)',
              backgroundColor: 'var(--bg-subtle)',
              fontSize: '0.84rem',
              color: 'var(--text-primary)',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="1">1st Year</option>
            {currentProgram?.duration_years >= 2 && <option value="2">2nd Year</option>}
            {currentProgram?.duration_years >= 3 && <option value="3">3rd Year</option>}
          </select>
        </div>
      </div>

      {/* Info Callout: Student-specific variance explanation */}
      <div style={{
        backgroundColor: '#EFF6FF',
        border: '1px solid #BFDBFE',
        borderRadius: 'var(--radius-md)',
        padding: '0.85rem 1.15rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        color: '#1E40AF',
        fontSize: '0.82rem'
      }}>
        <Info size={18} style={{ flexShrink: 0 }} />
        <div>
          <strong>Configurable Multi-Tier Structure:</strong> While the template below defines standard fee heads for <strong>{currentProgram?.name}</strong>, individual students can have custom base tuition, concessions, or additional line items (e.g. Lab, Exam, Center fees) configured directly on their profile.
        </div>
      </div>

      {/* Main Fee Structure Card */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-light)',
        boxShadow: 'var(--shadow-xs)',
        overflow: 'hidden',
        marginBottom: '2rem'
      }}>
        {/* Card Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileSpreadsheet size={18} style={{ color: 'var(--primary-600)' }} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Year {selectedYear} Standard Fee Template • {currentProgram?.name}
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Total Template Fee: <strong style={{ color: 'var(--text-primary)', fontSize: '1.05rem' }}>₹{totalFeeStructure.toLocaleString('en-IN')}</strong>
            </div>
          </div>
        </div>

        {/* Fee Heads Table */}
        <div className="table-responsive">
          <table style={{ width: '100%', minWidth: 540, borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{
                backgroundColor: 'var(--bg-subtle)',
                borderBottom: '1px solid var(--border-light)',
                color: 'var(--text-secondary)',
                fontSize: '0.74rem',
                fontWeight: 700,
                textTransform: 'uppercase'
              }}>
                <th style={{ padding: '0.75rem 1.5rem', width: 45 }}>#</th>
                <th style={{ padding: '0.75rem 1rem' }}>Fee Head Name</th>
                <th style={{ padding: '0.75rem 1rem' }}>Standard Amount (₹)</th>
                <th style={{ padding: '0.75rem 1rem' }}>Classification</th>
                <th style={{ padding: '0.75rem 1.5rem', textAlign: 'right', width: 120 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentHeads.map((item, idx) => (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '0.85rem 1.5rem', color: 'var(--text-muted)' }}>{idx + 1}</td>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {item.name}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    ₹{item.amount.toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span style={{
                      padding: '0.2rem 0.6rem',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      backgroundColor: item.type === 'Mandatory' ? '#EFF6FF' : '#FFFBEB',
                      color: item.type === 'Mandatory' ? '#1D4ED8' : '#D97706',
                      border: item.type === 'Mandatory' ? '1px solid #BFDBFE' : '1px solid #FDE68A'
                    }}>
                      {item.type}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem 1.5rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleDeleteHead(item.id)}
                        title="Delete Fee Head"
                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--rose-600)' }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Button to Add New Fee Head */}
        <div style={{ padding: '1rem 1.5rem', backgroundColor: 'var(--bg-subtle)' }}>
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              border: 'none',
              background: 'transparent',
              color: 'var(--primary-600)',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <Plus size={16} />
            <span>+ Add New Fee Head</span>
          </button>
        </div>
      </div>

      {/* Modal to Add New Fee Head */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-card" style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Add New Fee Head to Template</h3>
            </div>
            <form onSubmit={handleAddHead}>
              <div className="modal-body">
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Fee Head Title *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Lab Fee, Assignment Submission, Center Fee"
                    value={newHeadName}
                    onChange={(e) => setNewHeadName(e.target.value)}
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
                    Standard Amount (₹) *
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 2500"
                    value={newHeadAmount}
                    onChange={(e) => setNewHeadAmount(e.target.value)}
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
                    Classification
                  </label>
                  <select
                    value={newHeadType}
                    onChange={(e) => setNewHeadType(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-light)',
                      fontSize: '0.85rem',
                      outline: 'none'
                    }}
                  >
                    <option value="Mandatory">Mandatory Institutional Fee</option>
                    <option value="Optional">Optional / Conditional Charge</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Fee Head
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
