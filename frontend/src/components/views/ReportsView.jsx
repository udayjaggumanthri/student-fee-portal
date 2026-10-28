import React from 'react';
import {
  FileText, Download, ChevronRight, BarChart2,
  Users, Layers, Clock, ArrowDownToLine
} from 'lucide-react';

export default function ReportsView({ onExportExcel }) {
  const reports = [
    { id: 'collection', title: 'Collection Report', desc: 'Summary of daily and monthly fee collections', icon: BarChart2, color: '#2563EB' },
    { id: 'student_wise', title: 'Student Wise Report', desc: 'Detailed payment statements per student', icon: Users, color: '#059669' },
    { id: 'batch_wise', title: 'Batch Wise Report', desc: 'Collection percentage and targets by cohort', icon: Layers, color: '#6366F1' },
    { id: 'pending_dues', title: 'Pending Dues Report', desc: 'Prioritized caller list with contact numbers', icon: Clock, color: '#DC2626' },
    { id: 'payment_history', title: 'Payment History', desc: 'Complete chronological audit log of all transactions', icon: FileText, color: '#D97706' },
  ];

  return (
    <div style={{ maxWidth: 860, margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Reports & Exports
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Generate institutional financial summaries and download audited spreadsheets.
        </p>
      </div>

      <div style={{
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-light)',
        boxShadow: 'var(--shadow-xs)',
        overflow: 'hidden',
        marginBottom: '1.5rem'
      }}>
        {reports.map((r, idx) => {
          const Icon = r.icon;
          return (
            <div
              key={r.id}
              onClick={onExportExcel}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1.15rem 1.35rem',
                borderBottom: idx < reports.length - 1 ? '1px solid var(--border-light)' : 'none',
                cursor: 'pointer',
                transition: 'var(--transition)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-subtle)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: `${r.color}15`,
                  color: r.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Icon size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {r.title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {r.desc}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                <Download size={16} />
                <ChevronRight size={18} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Direct Export to Excel Card */}
      <div style={{
        backgroundColor: 'var(--primary-50)',
        border: '1.5px solid var(--primary-200)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary-800)' }}>
            Export Complete Master Dataset
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--primary-700)', marginTop: '0.15rem' }}>
            Includes all batches (Degree, PG, Open School), financial ledgers, and contact numbers.
          </div>
        </div>

        <button
          onClick={onExportExcel}
          className="btn btn-primary"
          style={{ gap: '0.45rem' }}
        >
          <ArrowDownToLine size={16} />
          <span>Download Excel (.xlsx)</span>
        </button>
      </div>
    </div>
  );
}
