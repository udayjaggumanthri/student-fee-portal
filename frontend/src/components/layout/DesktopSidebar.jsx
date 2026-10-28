import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  GraduationCap, LayoutDashboard, Users, CreditCard,
  Layers, Receipt, BarChart3, MessageSquare,
  ShieldCheck, Settings, UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useBranding } from '../../context/BrandingContext';

export default function DesktopSidebar() {
  const { user } = useAuth();
  const { branding } = useBranding();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { id: 'dashboard', path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'students', path: '/students', label: 'Students', icon: Users },
    { id: 'fee_collection', path: '/fee-collection', label: 'Fee Collection', icon: CreditCard, highlight: true },
    { id: 'batches', path: '/batches', label: 'Batches', icon: Layers },
    { id: 'reference_contacts', path: '/reference-contacts', label: 'Reference Contacts', icon: UserCheck },
    { id: 'payments', path: '/payments', label: 'Payments Ledger', icon: Receipt },
    { id: 'reports', path: '/reports', label: 'Reports & Audit', icon: BarChart3 },
    { id: 'communications', path: '/communications', label: 'Communications', icon: MessageSquare },
    { id: 'users_roles', path: '/users-roles', label: 'Users & Roles', icon: ShieldCheck },
    { id: 'settings', path: '/settings', label: 'Settings', icon: Settings },
  ];

  const isItemActive = (item) => {
    if (item.path === '/dashboard') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(item.path);
  };

  return (
    <aside style={{
      width: 'var(--sidebar-width)',
      backgroundColor: 'var(--bg-surface)',
      borderRight: '1px solid var(--border-light)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      height: '100vh',
      zIndex: 40,
      flexShrink: 0
    }} className="hide-mobile">
      {/* Brand Header */}
      <div>
        <div
          onClick={() => navigate('/dashboard')}
          style={{
            padding: '1.2rem 1.15rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            borderBottom: '1px solid var(--border-light)',
            cursor: 'pointer'
          }}
        >
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 'var(--radius-sm)',
            backgroundColor: branding.primary_color || '#1E3A8A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            boxShadow: '0 2px 6px rgba(30, 58, 138, 0.35)',
            flexShrink: 0
          }}>
            {branding.logo_url ? (
              <img src={branding.logo_url} alt="Logo" style={{ width: 26, height: 26, objectFit: 'contain' }} />
            ) : (
              <GraduationCap size={22} />
            )}
          </div>
          <div style={{ minWidth: 0, overflow: 'hidden' }}>
            <div style={{ fontSize: '0.96rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {branding.short_name || branding.institution_name}
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--primary-600)', fontWeight: 600, letterSpacing: '0.02em' }}>
              Fee Management
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <nav style={{ padding: '0.85rem 0.65rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = isItemActive(item);

              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    backgroundColor: isActive ? 'var(--primary-50)' : 'transparent',
                    color: isActive ? 'var(--primary-700)' : 'var(--text-secondary)',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '0.86rem',
                    cursor: 'pointer',
                    transition: 'var(--transition)',
                    textAlign: 'left',
                    width: '100%'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'var(--bg-subtle)';
                      e.currentTarget.style.color = 'var(--text-primary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Icon
                      size={18}
                      style={{
                        color: isActive ? 'var(--primary-600)' : 'var(--text-muted)',
                        strokeWidth: isActive ? 2.5 : 2
                      }}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.highlight && !isActive && (
                    <span style={{ fontSize: '0.65rem', backgroundColor: '#ECFDF5', color: '#065F46', padding: '0.1rem 0.4rem', borderRadius: 4, fontWeight: 700 }}>
                      New
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Institutional Academic Year & Status Footer (Removed redundant bottom logout) */}
      <div style={{
        padding: '0.85rem 1.15rem',
        borderTop: '1px solid var(--border-light)',
        backgroundColor: 'var(--bg-subtle)',
        fontSize: '0.74rem',
        color: 'var(--text-muted)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Academic Year:</span> {branding.current_academic_year || '2026-2027'}
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          color: 'var(--emerald-600)',
          fontWeight: 700,
          fontSize: '0.7rem'
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--emerald-500)', display: 'inline-block' }}></span>
          <span>Online</span>
        </div>
      </div>
    </aside>
  );
}
