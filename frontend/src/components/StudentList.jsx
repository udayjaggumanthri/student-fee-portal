import React from 'react';
import StudentCard from './StudentCard';
import { Filter, Users, CheckCircle, AlertCircle, Clock } from 'lucide-react';

export default function StudentList({
  students,
  feeStatus,
  setFeeStatus,
  selectedRef,
  setSelectedRef,
  selectedCenter,
  setSelectedCenter,
  references,
  centers,
  roleView,
  onRecordPayment,
  onOpenWhatsApp,
  onViewReceipt,
  onAddLineItem,
  loading
}) {
  return (
    <div>
      {/* Filter Toolbar */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-light)',
        padding: '0.85rem 1.15rem',
        marginBottom: '1.25rem',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.85rem'
      }}>
        {/* Status Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setFeeStatus('ALL')}
            className={`btn btn-sm ${feeStatus === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: 'var(--radius-full)' }}
          >
            All Students ({students.length})
          </button>

          <button
            onClick={() => setFeeStatus('PARTIAL')}
            className={`btn btn-sm ${feeStatus === 'PARTIAL' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: 'var(--radius-full)' }}
          >
            <Clock size={13} />
            <span>Partial Paid</span>
          </button>

          <button
            onClick={() => setFeeStatus('UNPAID')}
            className={`btn btn-sm ${feeStatus === 'UNPAID' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: 'var(--radius-full)' }}
          >
            <AlertCircle size={13} />
            <span>Unpaid / Dues</span>
          </button>

          <button
            onClick={() => setFeeStatus('PAID')}
            className={`btn btn-sm ${feeStatus === 'PAID' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: 'var(--radius-full)' }}
          >
            <CheckCircle size={13} />
            <span>Fully Paid</span>
          </button>
        </div>

        {/* Reference & Center Dropdowns */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {/* Reference filter */}
          <select
            value={selectedRef}
            onChange={(e) => setSelectedRef(e.target.value)}
            style={{
              padding: '0.45rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-light)',
              backgroundColor: 'var(--bg-subtle)',
              fontSize: '0.8rem',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="all">All References</option>
            {references.map((r) => (
              <option key={r.id} value={String(r.id)}>
                Ref: {r.name} ({r.student_count})
              </option>
            ))}
          </select>

          {/* Center filter */}
          <select
            value={selectedCenter}
            onChange={(e) => setSelectedCenter(e.target.value)}
            style={{
              padding: '0.45rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-light)',
              backgroundColor: 'var(--bg-subtle)',
              fontSize: '0.8rem',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="all">All Centers</option>
            {centers.map((c) => (
              <option key={c.id} value={String(c.id)}>
                Center: {c.code}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Student Cards Grid */}
      {loading ? (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-light)',
          color: 'var(--text-muted)'
        }}>
          <p>Loading student billing records...</p>
        </div>
      ) : students.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-light)',
          color: 'var(--text-muted)'
        }}>
          <Users size={40} style={{ opacity: 0.4, marginBottom: '0.75rem' }} />
          <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.25rem' }}>No students found</h4>
          <p style={{ fontSize: '0.85rem' }}>Try clearing filters or search criteria.</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '1rem'
        }}>
          {students.map((student) => (
            <StudentCard
              key={student.id}
              student={student}
              roleView={roleView}
              onRecordPayment={onRecordPayment}
              onOpenWhatsApp={onOpenWhatsApp}
              onViewReceipt={onViewReceipt}
              onAddLineItem={onAddLineItem}
            />
          ))}
        </div>
      )}
    </div>
  );
}
