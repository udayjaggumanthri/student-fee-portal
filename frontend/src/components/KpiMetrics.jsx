import React from 'react';
import { Users, CreditCard, CheckCircle2, AlertCircle, TrendingUp, EyeOff } from 'lucide-react';

export default function KpiMetrics({ kpiData, roleView }) {
  if (!kpiData) return null;

  const isCaller = roleView === 'TEACHER_CALLER';

  const formatCurrency = (val) => {
    const num = Number(val || 0);
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(num);
  };

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1rem'
      }}>
        {/* Card 1: Total Students */}
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          padding: '1.25rem',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-xs)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Enrolled Students
            </span>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--primary-50)',
              color: 'var(--primary-600)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Users size={18} />
            </div>
          </div>
          <div style={{ marginTop: '0.75rem' }}>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {kpiData.total_students}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Across selected batches
            </div>
          </div>
        </div>

        {/* Card 2: Total Expected (Masked for Teacher Callers) */}
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          padding: '1.25rem',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-xs)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Total Expected Fees
            </span>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: 'var(--radius-md)',
              backgroundColor: isCaller ? '#FEF3C7' : 'var(--bg-subtle)',
              color: isCaller ? '#92400E' : 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {isCaller ? <EyeOff size={18} /> : <CreditCard size={18} />}
            </div>
          </div>
          <div style={{ marginTop: '0.75rem' }}>
            <div style={{
              fontSize: '1.85rem',
              fontWeight: 800,
              color: isCaller ? 'var(--text-muted)' : 'var(--text-primary)'
            }}>
              {isCaller ? '••••••••' : formatCurrency(kpiData.total_expected)}
            </div>
            <div style={{ fontSize: '0.75rem', color: isCaller ? '#92400E' : 'var(--text-muted)', marginTop: '0.2rem' }}>
              {isCaller ? 'Masked for callers' : 'Total annual billings'}
            </div>
          </div>
        </div>

        {/* Card 3: Total Collected & Rate */}
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          padding: '1.25rem',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-xs)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Total Collected
            </span>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--emerald-50)',
              color: 'var(--emerald-600)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div style={{ marginTop: '0.75rem' }}>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--emerald-600)' }}>
              {formatCurrency(kpiData.total_collected)}
            </div>
            {/* Progress Bar */}
            <div style={{ marginTop: '0.45rem' }}>
              <div style={{
                height: 6,
                backgroundColor: 'var(--border-light)',
                borderRadius: 'var(--radius-full)',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${Math.min(100, kpiData.collection_rate || 0)}%`,
                  height: '100%',
                  backgroundColor: 'var(--emerald-500)',
                  borderRadius: 'var(--radius-full)',
                  transition: 'width 0.4s ease'
                }} />
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.72rem',
                color: 'var(--text-muted)',
                marginTop: '0.25rem'
              }}>
                <span>Progress</span>
                <span style={{ fontWeight: 700, color: 'var(--emerald-700)' }}>{kpiData.collection_rate}% Collected</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Outstanding Dues (High Priority for Calling) */}
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          padding: '1.25rem',
          borderRadius: 'var(--radius-lg)',
          border: '1.5px solid var(--rose-100)',
          boxShadow: '0 4px 12px rgba(225, 29, 72, 0.06)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--rose-700)' }}>
              Outstanding Balance Due
            </span>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--rose-50)',
              color: 'var(--rose-600)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <AlertCircle size={18} />
            </div>
          </div>
          <div style={{ marginTop: '0.75rem' }}>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--rose-600)' }}>
              {formatCurrency(kpiData.total_dues)}
            </div>
            <div style={{
              fontSize: '0.75rem',
              color: 'var(--rose-700)',
              marginTop: '0.2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}>
              <TrendingUp size={13} />
              <span>Pending fee collection target</span>
            </div>
          </div>
        </div>
      </div>

      {/* Status Breakdown Chips */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        marginTop: '0.85rem',
        flexWrap: 'wrap'
      }}>
        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)' }}>
          Student Statuses:
        </span>
        <span className="badge badge-paid">
          ● {kpiData.paid_count} Fully Paid
        </span>
        <span className="badge badge-partial">
          ● {kpiData.partial_count} Partial Paid
        </span>
        <span className="badge badge-unpaid">
          ● {kpiData.unpaid_count} Dues Pending / Unpaid
        </span>
      </div>
    </div>
  );
}
