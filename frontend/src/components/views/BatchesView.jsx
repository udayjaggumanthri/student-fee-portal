import React, { useState } from 'react';
import {
  Layers, Plus, Users, Download, CreditCard, ChevronRight,
  GraduationCap, BookOpen, Award, School, CheckCircle2, AlertCircle,
  Edit, MessageSquare, ExternalLink, Building, Search, RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import EditBatchModal from '../EditBatchModal';
import ManageCentersModal from '../ManageCentersModal';

export default function BatchesView({
  batches = [],
  programs = [],
  loading = false,
  onSelectBatch,
  onAddNewBatch,
  onExportExcel,
  onBatchUpdated
}) {
  const { isCaller, isAdmin, isPrincipal } = useAuth();
  const [selectedProgramFilter, setSelectedProgramFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingBatch, setEditingBatch] = useState(null);
  const [showCentersModal, setShowCentersModal] = useState(false);

  const formatCurrency = (val) => {
    if (val === null || val === undefined) return '••••••';
    const num = Number(val || 0);
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(num);
  };

  const getProgramIcon = (code) => {
    switch (code) {
      case 'DEGREE':
        return <GraduationCap size={20} style={{ color: '#2563EB' }} />;
      case 'PG':
        return <Award size={20} style={{ color: '#8B5CF6' }} />;
      case 'INTER':
        return <BookOpen size={20} style={{ color: '#F59E0B' }} />;
      case 'SSC':
        return <School size={20} style={{ color: '#10B981' }} />;
      default:
        return <Layers size={20} style={{ color: '#2563EB' }} />;
    }
  };

  const filteredBatches = (batches || []).filter((b) => {
    const matchesProgram =
      selectedProgramFilter === 'all' ||
      String(b.program) === String(selectedProgramFilter) ||
      b.program_code === selectedProgramFilter;
    if (!matchesProgram) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (b.batch_name || '').toLowerCase().includes(q) ||
      (b.academic_year || '').toLowerCase().includes(q) ||
      (b.program_name || '').toLowerCase().includes(q)
    );
  });

  // Calculate totals
  const totalStudents = (batches || []).reduce((sum, b) => sum + (b.student_count || 0), 0);
  const totalExpected = (batches || []).reduce((sum, b) => sum + Number(b.total_expected || 0), 0);
  const totalCollected = (batches || []).reduce((sum, b) => sum + Number(b.total_collected || 0), 0);
  const totalDue = (batches || []).reduce((sum, b) => sum + Number(b.total_due || 0), 0);
  const overallRate = totalExpected > 0 ? Math.min(100, Math.round((totalCollected / totalExpected) * 100)) : 0;

  return (
    <div>
      {/* Top Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        marginBottom: '1rem'
      }}>
        <div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Batches & Academic Programs
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Manage academic cohorts, course structures, and batch-wise fee collections.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center'
          }}>
            <Search size={15} style={{ position: 'absolute', left: '0.75rem', color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search batches..."
              style={{
                padding: '0.45rem 0.85rem 0.45rem 2.2rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                fontSize: '0.82rem',
                outline: 'none',
                minWidth: '180px'
              }}
            />
          </div>

          <button
            onClick={() => setShowCentersModal(true)}
            className="btn btn-secondary btn-sm"
            style={{ gap: '0.4rem', fontWeight: 600 }}
            title="Manage Study Centers, Courses, and Hall Ticket Mapping"
          >
            <Building size={15} />
            <span>Centers & Ticket Mapping</span>
          </button>

          <button
            onClick={onAddNewBatch}
            className="btn btn-primary btn-sm"
            style={{ gap: '0.4rem' }}
          >
            <Plus size={15} />
            <span>+ Add New Batch</span>
          </button>
        </div>
      </div>

      {/* Program Filter Pills */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.45rem',
        overflowX: 'auto',
        paddingBottom: '0.35rem',
        marginBottom: '1.25rem'
      }}>
        <button
          onClick={() => setSelectedProgramFilter('all')}
          style={{
            padding: '0.4rem 0.85rem',
            borderRadius: 'var(--radius-full)',
            border: selectedProgramFilter === 'all' ? '1.5px solid var(--primary-600)' : '1px solid var(--border-light)',
            backgroundColor: selectedProgramFilter === 'all' ? 'var(--primary-50)' : 'var(--bg-surface)',
            color: selectedProgramFilter === 'all' ? 'var(--primary-700)' : 'var(--text-secondary)',
            fontSize: '0.78rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            whiteSpace: 'nowrap'
          }}
        >
          <span>All Programs ({batches.length} Batches)</span>
        </button>

        {programs.map((p) => {
          const isSelected = String(selectedProgramFilter) === String(p.id) || selectedProgramFilter === p.code;
          const count = batches.filter(
            (b) => String(b.program) === String(p.id) || b.program_code === p.code
          ).length;
          return (
            <button
              key={p.id}
              onClick={() => setSelectedProgramFilter(String(p.id))}
              style={{
                padding: '0.45rem 0.95rem',
                borderRadius: 'var(--radius-full)',
                border: isSelected ? '1.5px solid var(--primary-600)' : '1px solid var(--border-light)',
                backgroundColor: isSelected ? 'var(--primary-50)' : 'var(--bg-surface)',
                color: isSelected ? 'var(--primary-700)' : 'var(--text-secondary)',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                whiteSpace: 'nowrap'
              }}
            >
              {getProgramIcon(p.code)}
              <span>{p.name}</span>
              <span style={{
                fontSize: '0.7rem',
                padding: '0.1rem 0.45rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: isSelected ? 'var(--primary-200)' : 'var(--bg-subtle)',
                color: isSelected ? 'var(--primary-800)' : 'var(--text-muted)'
              }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div style={{
          padding: '3rem 2rem',
          textAlign: 'center',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-light)',
          marginBottom: '2rem'
        }}>
          <div style={{
            display: 'inline-block',
            width: 36,
            height: 36,
            border: '3px solid var(--border-light)',
            borderTopColor: 'var(--primary-600)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            marginBottom: '1rem'
          }} />
          <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Loading batches & cohorts...
          </div>
        </div>
      )}

      {/* Zero Batches Registered Empty State */}
      {!loading && batches.length === 0 && (
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-light)',
          padding: '3.5rem 2rem',
          textAlign: 'center',
          marginBottom: '2rem',
          boxShadow: 'var(--shadow-xs)'
        }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            backgroundColor: 'var(--bg-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
            color: 'var(--primary-600)'
          }}>
            <Layers size={32} />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            No Academic Batches Found
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', maxWidth: 460, margin: '0 auto 1.5rem', lineHeight: 1.5 }}>
            Create your first academic cohort or ingest existing institutional spreadsheets to start managing student fee ledger and study centers.
          </p>
          <button
            onClick={onAddNewBatch}
            className="btn btn-primary"
            style={{ gap: '0.5rem', margin: '0 auto', padding: '0.6rem 1.4rem' }}
          >
            <Plus size={16} />
            <span>+ Create First Batch</span>
          </button>
        </div>
      )}

      {/* Filtered Empty State */}
      {!loading && batches.length > 0 && filteredBatches.length === 0 && (
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px dashed var(--border-light)',
          padding: '2.5rem 1.5rem',
          textAlign: 'center',
          marginBottom: '2rem'
        }}>
          <AlertCircle size={28} style={{ color: 'var(--amber-500)', margin: '0 auto 0.75rem' }} />
          <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
            No Matching Batches Found
          </h4>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            No cohorts match your current program or search filters.
          </p>
          <button
            onClick={() => {
              setSelectedProgramFilter('all');
              setSearchQuery('');
            }}
            className="btn btn-secondary btn-sm"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Batches Grid */}
      {!loading && filteredBatches.length > 0 && (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2rem'
      }}>
        {filteredBatches.map((b) => {
          const expected = Number(b.total_expected || 0);
          const collected = Number(b.total_collected || 0);
          const due = Number(b.total_due || 0);
          const rate = expected > 0 ? Math.min(100, Math.round((collected / expected) * 100)) : 0;

          return (
            <div
              key={b.id}
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-light)',
                padding: '1.35rem',
                boxShadow: 'var(--shadow-xs)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'var(--transition)'
              }}
            >
              <div>
                {/* Card Header: Icon, Batch Title, Academic Year */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {getProgramIcon(b.program_code)}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {b.batch_name}
                      </h3>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {b.program_name} • {b.duration_years} {b.duration_years > 1 ? 'Years' : 'Year'}
                      </div>
                    </div>
                  </div>

                  <span style={{
                    padding: '0.2rem 0.6rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    backgroundColor: 'var(--primary-50)',
                    color: 'var(--primary-700)',
                    border: '1px solid var(--primary-100)'
                  }}>
                    {b.academic_year}
                  </span>
                </div>

                {/* 4 Metric Boxes */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '0.65rem',
                  marginBottom: '1.15rem'
                }}>
                  <div style={{
                    backgroundColor: 'var(--bg-subtle)',
                    padding: '0.65rem 0.75rem',
                    borderRadius: 'var(--radius-sm)'
                  }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Students</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {b.student_count || 0}
                    </div>
                  </div>

                  <div style={{
                    backgroundColor: 'var(--bg-subtle)',
                    padding: '0.65rem 0.75rem',
                    borderRadius: 'var(--radius-sm)'
                  }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Total Assessed</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {isCaller ? '••••••' : formatCurrency(expected)}
                    </div>
                  </div>

                  <div style={{
                    backgroundColor: 'var(--emerald-50)',
                    padding: '0.65rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--emerald-100)'
                  }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--emerald-text)' }}>Collected</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--emerald-text)' }}>
                      {formatCurrency(collected)}
                    </div>
                  </div>

                  <div style={{
                    backgroundColor: 'var(--rose-50)',
                    padding: '0.65rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--rose-100)'
                  }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--rose-text)' }}>Pending Due</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--rose-text)' }}>
                      {formatCurrency(due)}
                    </div>
                  </div>
                </div>

                {/* Candidate types and WhatsApp group badge */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.85rem' }}>
                  <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                    {(Array.isArray(b.candidate_types) && b.candidate_types.length > 0 ? b.candidate_types : ['WITH', 'WITHOUT']).map((ct) => (
                      <span key={ct} style={{
                        padding: '0.15rem 0.5rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        backgroundColor: ct === 'WITH' ? '#ECFDF5' : 'var(--bg-subtle)',
                        color: ct === 'WITH' ? '#047857' : 'var(--text-secondary)',
                        border: '1px solid var(--border-light)'
                      }}>
                        {ct}
                      </span>
                    ))}
                  </div>

                  {b.whatsapp_group_link ? (
                    <a
                      href={b.whatsapp_group_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        padding: '0.2rem 0.55rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        backgroundColor: '#ECFDF5',
                        color: '#16A34A',
                        textDecoration: 'none',
                        border: '1px solid #BBF7D0'
                      }}
                      title="Open Batch Dedicated WhatsApp Group"
                    >
                      <MessageSquare size={12} />
                      <span>WhatsApp Group</span>
                      <ExternalLink size={10} />
                    </a>
                  ) : null}
                </div>

                {/* Collection Progress Bar */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.35rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Collection Progress</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{rate}%</strong>
                  </div>
                  <div style={{
                    width: '100%',
                    height: 8,
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--border-light)',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${rate}%`,
                      height: '100%',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: rate >= 80 ? 'var(--emerald-600)' : rate >= 40 ? 'var(--amber-500)' : 'var(--primary-600)',
                      transition: 'width 0.6s ease'
                    }} />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--border-light)', paddingTop: '0.85rem' }}>
                <button
                  onClick={() => onSelectBatch(String(b.id))}
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1, justifyContent: 'center', fontSize: '0.8rem' }}
                >
                  <Users size={14} />
                  <span>Students</span>
                </button>
                <button
                  onClick={() => setEditingBatch(b)}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '0.45rem 0.65rem', fontSize: '0.8rem', gap: '0.3rem' }}
                  title="Edit Batch & Settings"
                >
                  <Edit size={13} />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => onExportExcel(String(b.id))}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '0.45rem' }}
                  title="Export Batch Excel"
                >
                  <Download size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* Batch Performance Summary Table */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-light)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-xs)'
      }}>
        <div style={{ padding: '1.15rem 1.5rem', borderBottom: '1px solid var(--border-light)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Batch Performance Comparison Ledger
          </h3>
        </div>

        <div className="table-responsive">
          <table style={{ width: '100%', minWidth: 720, borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{
                backgroundColor: 'var(--bg-subtle)',
                borderBottom: '1px solid var(--border-light)',
                color: 'var(--text-secondary)',
                fontSize: '0.74rem',
                fontWeight: 700,
                textTransform: 'uppercase'
              }}>
                <th style={{ padding: '0.75rem 1.5rem' }}>Batch Name</th>
                <th style={{ padding: '0.75rem 1rem' }}>Academic Program</th>
                <th style={{ padding: '0.75rem 1rem' }}>Enrolled</th>
                <th style={{ padding: '0.75rem 1rem' }}>Total Assessed (₹)</th>
                <th style={{ padding: '0.75rem 1rem' }}>Total Collected (₹)</th>
                <th style={{ padding: '0.75rem 1rem' }}>Balance Due (₹)</th>
                <th style={{ padding: '0.75rem 1.5rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBatches.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    {loading ? 'Loading batch ledger records...' : (batches.length === 0 ? 'No academic batches registered yet.' : 'No batches match your filter.')}
                  </td>
                </tr>
              ) : (
                filteredBatches.map((b) => (
                <tr key={b.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '0.85rem 1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    <div>{b.batch_name}</div>
                    {b.whatsapp_group_link && (
                      <div style={{ fontSize: '0.7rem', color: '#16A34A', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <MessageSquare size={10} />
                        <span>WhatsApp Enabled</span>
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>
                    {b.program_name}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>
                    {b.student_count || 0}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>
                    {isCaller ? '••••••' : formatCurrency(b.total_expected)}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--emerald-text)' }}>
                    {formatCurrency(b.total_collected)}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--rose-text)' }}>
                    {formatCurrency(b.total_due)}
                  </td>
                  <td style={{ padding: '0.85rem 1.5rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.35rem' }}>
                      <button
                        onClick={() => setEditingBatch(b)}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.55rem', gap: '0.25rem' }}
                        title="Edit Batch"
                      >
                        <Edit size={12} />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => onSelectBatch(String(b.id))}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                      >
                        <span>Inspect</span>
                        <ChevronRight size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Batch Modal */}
      {editingBatch && (
        <EditBatchModal
          batch={editingBatch}
          programs={programs}
          onClose={() => setEditingBatch(null)}
          onSuccess={async () => {
            if (onBatchUpdated) await onBatchUpdated();
            setEditingBatch(null);
          }}
          onDeleted={async () => {
            if (onBatchUpdated) await onBatchUpdated();
            setEditingBatch(null);
          }}
        />
      )}

      {/* Manage Centers & Programs Modal */}
      {showCentersModal && (
        <ManageCentersModal
          isOpen={showCentersModal}
          onClose={() => setShowCentersModal(false)}
          onRefresh={async () => {
            if (onBatchUpdated) await onBatchUpdated();
          }}
        />
      )}
    </div>
  );
}
