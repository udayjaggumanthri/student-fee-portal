import React, { useState } from 'react';
import {
  Users, DollarSign, CreditCard, AlertTriangle,
  Calendar, ArrowUpRight, ArrowDownRight,
  School, CheckCircle2, TrendingUp, Layers, ChevronRight,
  ChevronDown, Search, Check, Filter, ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useBranding } from '../../context/BrandingContext';

export default function DashboardView({
  kpiData,
  programs = [],
  batches = [],
  onOpenCollectPayment,
  academicWorkspace,
  setAcademicWorkspace,
  onNavigateToStudents
}) {
  const { isCaller } = useAuth();
  const { branding } = useBranding();
  const [academicYear, setAcademicYear] = useState('2026 - 2027');

  const programBreakdown = kpiData?.program_breakdown || [];

  const formatCurrency = (val) => {
    if (val === null || val === undefined) return '••••••';
    const num = Number(val || 0);
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(num);
  };

  // Derive metrics dynamically from live kpiData and program breakdown
  let totalStudents = Number(kpiData?.total_students || 0);
  let totalDue = Number(kpiData?.total_dues || 0);
  let totalCollected = Number(kpiData?.total_collected || 0);
  let paidCount = Number(kpiData?.paid_count || 0);
  let partialCount = Number(kpiData?.partial_count || 0);
  let unpaidCount = Number(kpiData?.unpaid_count || 0);

  if (academicWorkspace !== 'all') {
    const match = programBreakdown.find(
      pb => pb.code?.toLowerCase() === academicWorkspace.toLowerCase() || String(pb.id) === String(academicWorkspace)
    );
    if (match) {
      totalStudents = Number(match.student_count || 0);
      totalDue = Number(match.total_due || 0);
      totalCollected = Number(match.total_collected || 0);
      paidCount = Number(match.paid_count || 0);
      partialCount = Number(match.partial_count || 0);
      unpaidCount = Number(match.unpaid_count || 0);
    }
  }

  const totalBilled = totalCollected + totalDue;
  const collectionPercentage = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0;

  // Monthly collection trend
  const monthlyData = [
    { month: 'Apr', collected: 1.8, target: 2.2 },
    { month: 'May', collected: 2.4, target: 2.5 },
    { month: 'Jun', collected: 3.6, target: 3.5 },
    { month: 'Jul', collected: 2.9, target: 3.0 },
    { month: 'Aug', collected: 3.2, target: 3.2 },
    { month: 'Sep', collected: 4.1, target: 3.8 },
    { month: 'Oct', collected: 3.5, target: 3.6 },
    { month: 'Nov', collected: 2.8, target: 3.0 },
    { month: 'Dec', collected: 3.9, target: 3.7 },
    { month: 'Jan', collected: 3.4, target: 3.5 }
  ];

  // Active Cohort details when a specific batch workspace is active
  const activeCohort = [
    { id: 'degree', batchName: 'Batch 26A (1st Year)', title: 'Degree College', courses: 'B.Com Gen • B.Sc Comp • B.A', students: 69, collection: 43, icon: '🎓', accent: '#2563EB' },
    { id: 'pg', batchName: 'Batch PG 26 (2-Year)', title: 'Post-Graduate Master\'s', courses: 'M.Com • M.A • M.Sc Math', students: 11, collection: 50, icon: '🏛️', accent: '#8B5CF6' },
    { id: 'inter', batchName: 'Inter 2026-2027', title: 'Intermediate College', courses: 'Bi.P.C • M.P.C • C.E.C', students: 24, collection: 41, icon: '🏫', accent: '#F59E0B' },
    { id: 'ssc', batchName: 'SSC 2026-2027 (10th)', title: 'Open School SSC', courses: '10th Standard Board Exams', students: 23, collection: 98, icon: '🎒', accent: '#10B981' }
  ].find((c) => c.id === academicWorkspace);

  // Content Renderer for customizable dashboard widgets
  const renderSectionContent = (sectionId) => {
    switch (sectionId) {
      case 'kpi_metrics':
        return (
          <div className="dashboard-kpi-grid">
            {/* Card 1: Total Students */}
            <div className="dashboard-kpi-card" style={{
              backgroundColor: 'var(--bg-surface)',
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-light)',
              boxShadow: 'var(--shadow-xs)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Total Students
                </span>
                <div className="dashboard-kpi-icon" style={{
                  width: 32,
                  height: 32,
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--primary-50)',
                  color: 'var(--primary-600)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Users size={16} />
                </div>
              </div>
              <div style={{ marginTop: '0.35rem' }}>
                <div className="dashboard-kpi-value" style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                  {totalStudents}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--emerald-text)', marginTop: '0.15rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  <CheckCircle2 size={12} />
                  <span className="truncate-text">Verified Cohort</span>
                </div>
              </div>
            </div>

            {/* Card 2: Total Assessed Fees */}
            <div className="dashboard-kpi-card" style={{
              backgroundColor: 'var(--bg-surface)',
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-light)',
              boxShadow: 'var(--shadow-xs)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Assessed Fees
                </span>
                <div className="dashboard-kpi-icon" style={{
                  width: 32,
                  height: 32,
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(124, 58, 237, 0.1)',
                  color: '#7C3AED',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <DollarSign size={16} />
                </div>
              </div>
              <div style={{ marginTop: '0.35rem' }}>
                <div className="dashboard-kpi-value" style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                  {isCaller ? '••••••••' : formatCurrency(totalBilled)}
                </div>
                <div className="truncate-text" style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                  Base + Heads
                </div>
              </div>
            </div>

            {/* Card 3: Total Collected */}
            <div className="dashboard-kpi-card" style={{
              backgroundColor: 'var(--bg-surface)',
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-light)',
              boxShadow: 'var(--shadow-xs)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Total Collected
                </span>
                <div className="dashboard-kpi-icon" style={{
                  width: 32,
                  height: 32,
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--emerald-50)',
                  color: 'var(--emerald-600)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <CreditCard size={16} />
                </div>
              </div>
              <div style={{ marginTop: '0.35rem' }}>
                <div className="dashboard-kpi-value" style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--emerald-text)', lineHeight: 1.2 }}>
                  {formatCurrency(totalCollected)}
                </div>
                <div className="truncate-text" style={{ fontSize: '0.7rem', color: 'var(--emerald-text)', marginTop: '0.15rem', fontWeight: 700 }}>
                  {collectionPercentage}% Target Realized
                </div>
              </div>
            </div>

            {/* Card 4: Total Outstanding Due */}
            <div className="dashboard-kpi-card" style={{
              backgroundColor: 'var(--bg-surface)',
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-light)',
              boxShadow: 'var(--shadow-xs)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Pending Balance
                </span>
                <div className="dashboard-kpi-icon" style={{
                  width: 32,
                  height: 32,
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--rose-50)',
                  color: 'var(--rose-600)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <AlertTriangle size={16} />
                </div>
              </div>
              <div style={{ marginTop: '0.35rem' }}>
                <div className="dashboard-kpi-value" style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--rose-text)', lineHeight: 1.2 }}>
                  {formatCurrency(totalDue)}
                </div>
                <div className="truncate-text" style={{ fontSize: '0.7rem', color: 'var(--rose-text)', marginTop: '0.15rem', fontWeight: 600 }}>
                  Action Required
                </div>
              </div>
            </div>
          </div>
        );

      case 'cohort_journey':
        return (
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-light)',
            padding: '1.25rem 1.5rem',
            boxShadow: 'var(--shadow-xs)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Academic Cohort & Course Journey
                </h3>
                <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: '0.15rem 0 0 0' }}>
                  Select a batch to activate its dedicated workspace or explore enrolled students
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Academic Year:</span>
                <select
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  style={{
                    padding: '0.35rem 0.65rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-light)',
                    backgroundColor: 'var(--bg-subtle)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="2026 - 2027">2026 - 2027 (Current)</option>
                  <option value="2025 - 2026">2025 - 2026</option>
                  <option value="2024 - 2025">2024 - 2025</option>
                </select>
              </div>
            </div>

            {/* 4 Clickable Batch Journey Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '0.85rem'
            }}>
              {[
                {
                  id: 'degree',
                  title: 'Degree College',
                  batch: 'Batch 26A (1st Year)',
                  courses: 'B.Com Gen • B.Sc Comp • B.A',
                  students: 69,
                  collection: 43,
                  icon: '🎓',
                  accent: '#2563EB',
                  hasWhatsApp: true
                },
                {
                  id: 'pg',
                  title: 'Post-Graduate Master\'s',
                  batch: 'Batch PG 26 (2-Year)',
                  courses: 'M.Com • M.A • M.Sc Math',
                  students: 11,
                  collection: 50,
                  icon: '🏛️',
                  accent: '#8B5CF6',
                  hasWhatsApp: true
                },
                {
                  id: 'inter',
                  title: 'Intermediate College',
                  batch: 'Inter 2026-2027',
                  courses: 'Bi.P.C • M.P.C • C.E.C',
                  students: 24,
                  collection: 41,
                  icon: '🏫',
                  accent: '#F59E0B',
                  hasWhatsApp: true
                },
                {
                  id: 'ssc',
                  title: 'Open School SSC',
                  batch: 'SSC 2026-2027 (10th)',
                  courses: '10th Standard Board Exams',
                  students: 23,
                  collection: 98,
                  icon: '🎒',
                  accent: '#10B981',
                  hasWhatsApp: true
                }
              ].map((c) => {
                const isSelected = academicWorkspace === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      setAcademicWorkspace(c.id);
                    }}
                    style={{
                      padding: '1rem',
                      borderRadius: 'var(--radius-md)',
                      border: isSelected ? `2px solid ${c.accent}` : '1px solid var(--border-light)',
                      backgroundColor: isSelected ? 'var(--bg-surface)' : 'var(--bg-subtle)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      position: 'relative'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '1.4rem' }}>{c.icon}</span>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '0.15rem 0.45rem',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: isSelected ? `${c.accent}20` : 'var(--bg-surface)',
                        color: c.accent,
                        border: `1px solid ${c.accent}40`
                      }}>
                        {c.students} Students
                      </span>
                    </div>
                    <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-primary)', marginBottom: '0.15rem' }}>
                      {c.title}
                    </div>
                    <div style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--primary-600)', marginBottom: '0.35rem' }}>
                      {c.batch}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.65rem' }}>
                      {c.courses}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Collected: <strong>{c.collection}%</strong></span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAcademicWorkspace(c.id);
                          if (onNavigateToStudents) onNavigateToStudents();
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: c.accent,
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.2rem',
                          cursor: 'pointer',
                          padding: 0
                        }}
                        title={`Explore ${c.title} Students`}
                      >
                        <span>Explore</span>
                        <ChevronRight size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'velocity_chart':
        return (
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-light)',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-xs)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Fee Collection Velocity & Academic Targets
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.15rem 0 0 0' }}>
                  Realized revenue (₹ Lakhs) vs scheduled term milestone targets
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.72rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)' }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: '#2563EB' }}></span>
                  Realized
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)' }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: 'var(--bg-subtle)', border: '1px dashed var(--border-hover)' }}></span>
                  Target
                </span>
              </div>
            </div>

            {/* Interactive Bar Chart */}
            <div style={{
              height: 190,
              display: 'flex',
              alignItems: 'flex-end',
              gap: '0.55rem',
              paddingBottom: '1rem',
              paddingTop: '1rem',
              position: 'relative',
              borderBottom: '1px solid var(--border-light)'
            }}>
              {monthlyData.map((d) => {
                const collectedLakhs = d.collected;
                const targetLakhs = d.target;
                const pct = Math.round((collectedLakhs / targetLakhs) * 100);
                const isOverTarget = collectedLakhs >= targetLakhs;

                return (
                  <div
                    key={d.month}
                    title={`${d.month}: Collected ₹${(collectedLakhs * 100000).toLocaleString('en-IN')} (Target: ₹${(targetLakhs * 100000).toLocaleString('en-IN')}) — ${pct}%`}
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      height: '100%',
                      justifyContent: 'flex-end',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '100%', width: '100%', justifyContent: 'center' }}>
                      <div
                        style={{
                          width: '44%',
                          height: `${(collectedLakhs / 4.5) * 100}%`,
                          backgroundColor: isOverTarget ? '#16A34A' : '#2563EB',
                          borderRadius: '4px 4px 0 0',
                          transition: 'height 0.3s ease'
                        }}
                      />
                      <div
                        style={{
                          width: '44%',
                          height: `${(targetLakhs / 4.5) * 100}%`,
                          backgroundColor: 'var(--bg-subtle)',
                          border: '1px dashed var(--border-hover)',
                          borderRadius: '4px 4px 0 0'
                        }}
                      />
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.45rem', fontWeight: 600 }}>
                      {d.month}
                    </span>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.85rem', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              <span>Green = Target Exceeded</span>
              <span style={{ fontWeight: 700, color: 'var(--emerald-text)' }}>Average: ₹3.2L / Month</span>
            </div>
          </div>
        );

      case 'channel_breakdown':
        return (
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-light)',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-xs)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.15rem' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Payment Modes & Channel Breakdown
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.15rem 0 0 0' }}>
                  Collection channel distribution across cash counter and digital UPI
                </p>
              </div>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#16A34A', backgroundColor: '#ECFDF5', padding: '0.2rem 0.55rem', borderRadius: 'var(--radius-full)', border: '1px solid #BBF7D0' }}>
                ⚡ 78% Digital UPI
              </span>
            </div>

            {/* Mode Proportions Stacked Bar */}
            <div style={{
              height: 14,
              width: '100%',
              borderRadius: 'var(--radius-full)',
              display: 'flex',
              overflow: 'hidden',
              marginBottom: '1.25rem',
              backgroundColor: 'var(--bg-subtle)'
            }}>
              <div style={{ width: '42%', backgroundColor: '#6739B7' }} title="PhonePe: 42%" />
              <div style={{ width: '24%', backgroundColor: '#1A73E8' }} title="Google Pay: 24%" />
              <div style={{ width: '12%', backgroundColor: '#00897B' }} title="Other UPI: 12%" />
              <div style={{ width: '16%', backgroundColor: '#F59E0B' }} title="Cash Counter: 16%" />
              <div style={{ width: '6%', backgroundColor: '#64748B' }} title="Net Banking & Cheque: 6%" />
            </div>

            {/* Mode Details List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {[
                { mode: 'PhonePe UPI QR', share: '42%', amount: '₹3,60,570', color: '#6739B7' },
                { mode: 'Google Pay', share: '24%', amount: '₹2,06,040', color: '#1A73E8' },
                { mode: 'Direct Cash Counter', share: '16%', amount: '₹1,37,360', color: '#F59E0B' },
                { mode: 'Other UPI (Paytm/BHIM)', share: '12%', amount: '₹1,03,020', color: '#00897B' },
                { mode: 'NetBanking / Cheque', share: '6%', amount: '₹51,510', color: '#64748B' }
              ].map((pm) => (
                <div key={pm.mode} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <span style={{ width: 10, height: 10, borderRadius: 'var(--radius-full)', backgroundColor: pm.color }} />
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{pm.mode}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{pm.share}</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{pm.amount}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      {/* Top Welcome & Institutional Workspace Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        marginBottom: '1rem'
      }}>
        <div className="hide-mobile">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem', flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>
              {branding?.institution_name || 'Navodaya Educational Academy'}
            </h2>
            <span style={{
              backgroundColor: 'var(--primary-50)',
              color: 'var(--primary-700)',
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '0.2rem 0.6rem',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--primary-200)',
              whiteSpace: 'nowrap'
            }}>
              Academic Year: {branding?.current_academic_year || '2026 - 2027'}
            </span>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
            Institutional Financial Overview & Student Cohort Tracking
          </p>
        </div>

        {/* Quick Action: Collect Fee */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <button
            type="button"
            onClick={onOpenCollectPayment}
            className="btn btn-primary btn-sm"
            style={{ fontSize: '0.84rem', padding: '0.5rem 1rem', gap: '0.45rem' }}
          >
            <CreditCard size={15} />
            <span>+ Collect Fee</span>
          </button>
        </div>
      </div>

      {/* Active Dedicated Batch Workspace Card */}
      {academicWorkspace !== 'all' && activeCohort && (
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: `2px solid ${activeCohort.accent}`,
          padding: '1.25rem 1.5rem',
          marginBottom: '1.25rem',
          boxShadow: 'var(--shadow-sm)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            backgroundColor: activeCohort.accent
          }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 'var(--radius-md)',
                backgroundColor: `${activeCohort.accent}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.6rem',
                border: `1px solid ${activeCohort.accent}30`
              }}>
                {activeCohort.icon}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    {activeCohort.title} • {activeCohort.batchName}
                  </h3>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.5rem',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: `${activeCohort.accent}20`,
                    color: activeCohort.accent
                  }}>
                    Active Workspace
                  </span>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
                  {activeCohort.courses} • {activeCohort.students} Enrolled Students • {activeCohort.collection}% Fee Target Realized
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setAcademicWorkspace('all')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.78rem', padding: '0.45rem 0.85rem' }}
              >
                View All Batches
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onNavigateToStudents) onNavigateToStudents();
                }}
                className="btn btn-primary btn-sm"
                style={{ fontSize: '0.78rem', padding: '0.45rem 0.95rem', gap: '0.4rem' }}
              >
                <span>Explore Batch Students</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Executive Financial & Academic Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {renderSectionContent('kpi_metrics')}
        {renderSectionContent('cohort_journey')}
        {renderSectionContent('velocity_chart')}
        {renderSectionContent('channel_breakdown')}
      </div>
    </div>
  );
}
