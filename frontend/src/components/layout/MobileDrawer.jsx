import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  X, LayoutDashboard, Users, CreditCard, Layers,
  Receipt, BarChart3, MessageSquare, ShieldCheck,
  Settings, LogOut, ChevronRight, GraduationCap, UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useBranding } from '../../context/BrandingContext';

export default function MobileDrawer({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const { branding } = useBranding();
  const navigate = useNavigate();
  const location = useLocation();

  if (!isOpen) return null;

  const navItems = [
    { id: 'dashboard', path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'students', path: '/students', label: 'Students', icon: Users },
    { id: 'fee_collection', path: '/fee-collection', label: 'Fee Collection Counter', icon: CreditCard, highlight: true },
    { id: 'batches', path: '/batches', label: 'Batches & Courses', icon: Layers },
    { id: 'reference_contacts', path: '/reference-contacts', label: 'Reference Contacts', icon: UserCheck },
    { id: 'payments', path: '/payments', label: 'Payments Ledger', icon: Receipt },
    { id: 'reports', path: '/reports', label: 'Reports & Audit', icon: BarChart3 },
    { id: 'communications', path: '/communications', label: 'WhatsApp (Telugu & Eng)', icon: MessageSquare },
    { id: 'users_roles', path: '/users-roles', label: 'Users & Staff Management', icon: ShieldCheck },
    { id: 'settings', path: '/settings', label: 'Settings', icon: Settings },
  ];

  const handleSelect = (path) => {
    navigate(path);
    onClose();
  };

  const isItemActive = (item) => {
    if (item.path === '/dashboard') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(item.path);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      display: 'flex'
    }}>
      {/* Dark Backdrop Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(3px)',
          animation: 'fadeIn 0.2s ease'
        }}
      />

      {/* Drawer Panel */}
      <div style={{
        position: 'relative',
        width: '82%',
        maxWidth: 320,
        height: '100%',
        backgroundColor: 'var(--bg-surface)',
        boxShadow: 'var(--shadow-xl)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        zIndex: 101,
        animation: 'slideRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        overflowY: 'auto'
      }}>
        {/* Drawer Header */}
        <div>
          <div style={{
            padding: '1.25rem 1rem',
            borderBottom: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 'var(--radius-sm)',
                backgroundColor: branding?.primary_color || '#1E3A8A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF'
              }}>
                {branding?.logo_url ? (
                  <img src={branding.logo_url} alt="Logo" style={{ width: 24, height: 24, objectFit: 'contain' }} />
                ) : (
                  <GraduationCap size={20} />
                )}
              </div>
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                  {branding?.short_name || branding?.institution_name || 'Navodaya Academy'}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--primary-600)', fontWeight: 600 }}>
                  Fee Management Portal
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              style={{
                border: 'none',
                background: 'var(--bg-subtle)',
                width: 32,
                height: 32,
                borderRadius: 'var(--radius-full)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--text-secondary)'
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* User Profile Card */}
          <div style={{
            padding: '0.85rem 1rem',
            backgroundColor: 'var(--bg-subtle)',
            borderBottom: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem'
          }}>
            <img
              src={user.avatar}
              alt={user.name}
              style={{ width: 38, height: 38, borderRadius: 'var(--radius-full)', objectFit: 'cover' }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.name}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--primary-700)', fontWeight: 600 }}>
                {user.roleLabel}
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav style={{ padding: '0.75rem 0.65rem' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '0.35rem 0.65rem' }}>
              Main Navigation
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = isItemActive(item);
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.path)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    backgroundColor: isActive ? 'var(--primary-50)' : 'transparent',
                    color: isActive ? 'var(--primary-700)' : 'var(--text-primary)',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    marginBottom: '2px',
                    transition: 'var(--transition)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <Icon size={18} style={{ color: isActive ? 'var(--primary-600)' : item.highlight ? '#059669' : 'var(--text-secondary)' }} />
                    <span>{item.label}</span>
                  </div>
                  {item.highlight && !isActive && (
                    <span style={{ fontSize: '0.65rem', backgroundColor: '#ECFDF5', color: '#065F46', padding: '0.1rem 0.4rem', borderRadius: 4, fontWeight: 700 }}>
                      New
                    </span>
                  )}
                  {isActive && <ChevronRight size={14} />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Drawer Footer with Logout */}
        <div style={{
          padding: '1rem',
          borderTop: '1px solid var(--border-light)',
          backgroundColor: 'var(--bg-subtle)'
        }}>
          <button
            onClick={() => {
              logout();
              navigate('/login');
              onClose();
            }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.65rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid #FEE2E2',
              backgroundColor: '#FEF2F2',
              color: '#DC2626',
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
