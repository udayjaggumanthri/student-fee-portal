import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layers, CreditCard, ShieldCheck, MessageSquare,
  Settings, BarChart3, Receipt, LogOut, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function MobileMoreMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { id: 'fee_collection', path: '/fee-collection', label: 'Fee Collection Counter', icon: CreditCard, color: '#059669' },
    { id: 'batches', path: '/batches', label: 'Batches (26A, PG, Inter, SSC)', icon: Layers, color: '#2563EB' },
    { id: 'payments', path: '/payments', label: 'Payments Ledger', icon: Receipt, color: '#8B5CF6' },
    { id: 'reports', path: '/reports', label: 'Reports & Audit', icon: BarChart3, color: '#0EA5E9' },
    { id: 'communications', path: '/communications', label: 'WhatsApp (Telugu & Eng)', icon: MessageSquare, color: '#10B981' },
    { id: 'users_roles', path: '/users-roles', label: 'Users & Staff Management', icon: ShieldCheck, color: '#6366F1' },
    { id: 'settings', path: '/settings', label: 'Settings', icon: Settings, color: '#475569' },
  ];

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      {/* User Header */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-light)',
        padding: '1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.85rem',
        marginBottom: '1rem',
        boxShadow: 'var(--shadow-xs)'
      }}>
        <img
          src={user.avatar}
          alt={user.name}
          style={{ width: 44, height: 44, borderRadius: 'var(--radius-full)', objectFit: 'cover' }}
        />
        <div>
          <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {user.name}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {user.email} • {user.roleLabel}
          </div>
        </div>
      </div>

      {/* Nav List */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-light)',
        boxShadow: 'var(--shadow-xs)',
        overflow: 'hidden',
        marginBottom: '1rem'
      }}>
        {menuItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              onClick={() => navigate(item.path)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem 1.25rem',
                borderBottom: idx < menuItems.length - 1 ? '1px solid var(--border-light)' : 'none',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Icon size={19} style={{ color: item.color }} />
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {item.label}
                </span>
              </div>
              <ChevronRight size={17} style={{ color: 'var(--text-muted)' }} />
            </div>
          );
        })}
      </div>

      {/* Logout */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-light)',
        boxShadow: 'var(--shadow-xs)',
        overflow: 'hidden'
      }}>
        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '1rem 1.25rem',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            color: 'var(--rose-600)',
            fontSize: '0.9rem',
            fontWeight: 700
          }}
        >
          <LogOut size={19} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
