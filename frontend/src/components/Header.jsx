import React from 'react';
import { 
  GraduationCap, Search, Shield, UserCheck, PhoneCall, 
  Download, PlusCircle, RefreshCw, Eye, EyeOff 
} from 'lucide-react';

export default function Header({ 
  search, 
  setSearch, 
  roleView, 
  setRoleView, 
  onExportExcel, 
  onOpenCustomFields, 
  onIngestData, 
  loading 
}) {
  return (
    <header style={{
      backgroundColor: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border-light)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      boxShadow: 'var(--shadow-xs)'
    }}>
      <div style={{
        maxWidth: 1440,
        margin: '0 auto',
        padding: '0.85rem 1rem',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.85rem'
      }}>
        {/* Brand & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--primary-600)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            boxShadow: '0 4px 8px var(--primary-shadow)'
          }}>
            <GraduationCap size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                NovaFee
              </h1>
              <span className="badge badge-primary" style={{ fontSize: '0.68rem', padding: '0.15rem 0.45rem' }}>
                Multi-Tier v2.6
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Degree (3-Yr) • PG (2-Yr) • Open School (Inter / SSC)
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{
          position: 'relative',
          flex: '1 1 240px',
          maxWidth: 420
        }}>
          <Search size={16} style={{
            position: 'absolute',
            left: '0.85rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)'
          }} />
          <input
            type="text"
            placeholder="Search student, phone, reg no, group..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '0.55rem 0.85rem 0.55rem 2.35rem',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-light)',
              backgroundColor: 'var(--bg-subtle)',
              fontSize: '0.85rem',
              color: 'var(--text-primary)',
              outline: 'none',
              transition: 'var(--transition)'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--primary-500)';
              e.target.style.backgroundColor = '#FFFFFF';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--border-light)';
              e.target.style.backgroundColor = 'var(--bg-subtle)';
            }}
          />
        </div>

        {/* Role Switcher & Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          {/* Role Preview Switcher */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '0.2rem',
            border: '1px solid var(--border-light)'
          }}>
            <button
              onClick={() => setRoleView('ADMIN')}
              className="btn btn-sm"
              style={{
                backgroundColor: roleView === 'ADMIN' ? 'var(--bg-surface)' : 'transparent',
                color: roleView === 'ADMIN' ? 'var(--primary-700)' : 'var(--text-secondary)',
                boxShadow: roleView === 'ADMIN' ? 'var(--shadow-xs)' : 'none',
                fontWeight: roleView === 'ADMIN' ? 700 : 500,
                border: 'none',
                gap: '0.35rem'
              }}
              title="Admin: Full System & Financial Visibility"
            >
              <Shield size={14} />
              <span>Admin</span>
            </button>

            <button
              onClick={() => setRoleView('PRINCIPAL')}
              className="btn btn-sm"
              style={{
                backgroundColor: roleView === 'PRINCIPAL' ? 'var(--bg-surface)' : 'transparent',
                color: roleView === 'PRINCIPAL' ? 'var(--primary-700)' : 'var(--text-secondary)',
                boxShadow: roleView === 'PRINCIPAL' ? 'var(--shadow-xs)' : 'none',
                fontWeight: roleView === 'PRINCIPAL' ? 700 : 500,
                border: 'none',
                gap: '0.35rem'
              }}
              title="Principal: Academic & Batch Oversight"
            >
              <UserCheck size={14} />
              <span>Principal</span>
            </button>

            <button
              onClick={() => setRoleView('TEACHER_CALLER')}
              className="btn btn-sm"
              style={{
                backgroundColor: roleView === 'TEACHER_CALLER' ? '#FEF3C7' : 'transparent',
                color: roleView === 'TEACHER_CALLER' ? '#92400E' : 'var(--text-secondary)',
                boxShadow: roleView === 'TEACHER_CALLER' ? 'var(--shadow-xs)' : 'none',
                fontWeight: roleView === 'TEACHER_CALLER' ? 700 : 500,
                border: 'none',
                gap: '0.35rem'
              }}
              title="Teacher/Caller: Total Fee Masked, Balance Highlighted"
            >
              <PhoneCall size={14} />
              <span>Caller Mode</span>
            </button>
          </div>

          {/* Custom Fields Manager */}
          {roleView !== 'TEACHER_CALLER' && (
            <button 
              onClick={onOpenCustomFields}
              className="btn btn-secondary btn-sm"
              style={{ gap: '0.4rem' }}
              title="Configure Dynamic Fields (e.g. Contact 3, Address, etc.)"
            >
              <PlusCircle size={15} />
              <span className="hide-mobile">Custom Fields</span>
            </button>
          )}

          {/* Export Excel */}
          <button
            onClick={onExportExcel}
            className="btn btn-secondary btn-sm"
            style={{ gap: '0.4rem' }}
            title="Export filtered dues report to Excel"
          >
            <Download size={15} />
            <span className="hide-mobile">Export Excel</span>
          </button>
        </div>
      </div>

      {/* Role Banner Notification if Caller Mode is active */}
      {roleView === 'TEACHER_CALLER' && (
        <div style={{
          backgroundColor: '#FFFBEB',
          borderTop: '1px solid #FEF3C7',
          padding: '0.35rem 1rem',
          fontSize: '0.78rem',
          color: '#92400E',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem'
        }}>
          <EyeOff size={14} />
          <span><strong>Caller Privacy Active:</strong> Total institutional margins are hidden. Outstanding balances and calling contacts are prioritized.</span>
        </div>
      )}
    </header>
  );
}
