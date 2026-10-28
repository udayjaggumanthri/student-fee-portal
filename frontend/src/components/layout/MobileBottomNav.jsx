import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Plus, CreditCard, Menu } from 'lucide-react';

export default function MobileBottomNav({ onOpenDrawer }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isHomeActive = location.pathname === '/' || location.pathname === '/dashboard';
  const isStudentsActive = location.pathname.startsWith('/students');
  const isCounterActive = location.pathname.startsWith('/fee-collection');

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: 64,
      backgroundColor: 'var(--bg-surface)',
      borderTop: '1px solid var(--border-light)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      zIndex: 50,
      boxShadow: '0 -4px 14px rgba(0, 0, 0, 0.08)',
      paddingBottom: 'env(safe-area-inset-bottom, 0px)'
    }} className="mobile-bottom-nav show-mobile-only">
      {/* Tab 1: Home / Dashboard */}
      <button
        onClick={() => navigate('/dashboard')}
        style={{
          background: 'transparent',
          border: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2px',
          color: isHomeActive ? 'var(--primary-600)' : 'var(--text-muted)',
          fontSize: '0.68rem',
          fontWeight: isHomeActive ? 700 : 500,
          cursor: 'pointer',
          flex: 1,
          padding: '6px 0'
        }}
      >
        <LayoutDashboard size={20} />
        <span>Home</span>
      </button>

      {/* Tab 2: Students */}
      <button
        onClick={() => navigate('/students')}
        style={{
          background: 'transparent',
          border: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2px',
          color: isStudentsActive ? 'var(--primary-600)' : 'var(--text-muted)',
          fontSize: '0.68rem',
          fontWeight: isStudentsActive ? 700 : 500,
          cursor: 'pointer',
          flex: 1,
          padding: '6px 0'
        }}
      >
        <Users size={20} />
        <span>Students</span>
      </button>

      {/* Center Elevated FAB: Collect Payment */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <button
          onClick={() => navigate('/fee-collection')}
          style={{
            width: 48,
            height: 48,
            borderRadius: 'var(--radius-full)',
            backgroundColor: '#2563EB',
            color: '#FFFFFF',
            border: '3px solid var(--bg-surface)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
            transform: 'translateY(-14px)',
            cursor: 'pointer'
          }}
          title="Collect Fee Payment"
        >
          <Plus size={24} strokeWidth={2.8} />
        </button>
      </div>

      {/* Tab 3: Collection Counter */}
      <button
        onClick={() => navigate('/fee-collection')}
        style={{
          background: 'transparent',
          border: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2px',
          color: isCounterActive ? 'var(--primary-600)' : 'var(--text-muted)',
          fontSize: '0.68rem',
          fontWeight: isCounterActive ? 700 : 500,
          cursor: 'pointer',
          flex: 1,
          padding: '6px 0'
        }}
      >
        <CreditCard size={20} />
        <span>Counter</span>
      </button>

      {/* Tab 4: Drawer Menu Button */}
      <button
        onClick={onOpenDrawer}
        style={{
          background: 'transparent',
          border: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2px',
          color: 'var(--text-muted)',
          fontSize: '0.68rem',
          fontWeight: 500,
          cursor: 'pointer',
          flex: 1,
          padding: '6px 0'
        }}
      >
        <Menu size={20} />
        <span>Menu</span>
      </button>
    </nav>
  );
}
