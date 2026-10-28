import React from 'react';
import { Menu, GraduationCap, Bell, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useBranding } from '../../context/BrandingContext';

export default function MobileHeader({ onOpenDrawer }) {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { branding } = useBranding();

  return (
    <header
      className="mobile-top-header"
      style={{
        height: 56,
        minHeight: 56,
        maxHeight: 56,
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-light)',
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'nowrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 0.75rem',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        boxShadow: 'var(--shadow-xs)',
        boxSizing: 'border-box',
        width: '100%'
      }}
    >
      {/* Left: Hamburger Drawer Trigger + Brand Logo & Title */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'nowrap',
          alignItems: 'center',
          gap: '0.45rem',
          minWidth: 0,
          flex: 1,
          overflow: 'hidden'
        }}
      >
        <button
          type="button"
          onClick={onOpenDrawer}
          aria-label="Open Navigation Drawer"
          style={{
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            color: 'var(--text-primary)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 36,
            height: 36,
            minWidth: 36,
            padding: 0,
            borderRadius: 'var(--radius-sm)',
            flexShrink: 0
          }}
        >
          <Menu size={22} />
        </button>

        <div
          style={{
            width: 32,
            height: 32,
            minWidth: 32,
            borderRadius: 'var(--radius-sm)',
            backgroundColor: branding?.primary_color || '#1E3A8A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            boxShadow: '0 2px 4px rgba(0,0,0,0.12)',
            flexShrink: 0
          }}
        >
          {branding?.logo_url ? (
            <img src={branding.logo_url} alt="Logo" style={{ width: 20, height: 20, objectFit: 'contain' }} />
          ) : (
            <GraduationCap size={18} />
          )}
        </div>

        <div
          style={{
            minWidth: 0,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}
        >
          <div
            style={{
              fontSize: '0.92rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
              lineHeight: 1.15,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {branding?.short_name || branding?.institution_name || 'Navodaya'}
          </div>
          <div
            style={{
              fontSize: '0.62rem',
              color: 'var(--primary-600)',
              fontWeight: 600,
              lineHeight: 1.1,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            Fee Management
          </div>
        </div>
      </div>

      {/* Right: Theme switch, Bell Notification, and Profile Avatar */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'nowrap',
          alignItems: 'center',
          gap: '0.4rem',
          flexShrink: 0
        }}
      >
        <button
          type="button"
          onClick={toggleTheme}
          style={{
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            color: 'var(--text-secondary)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 34,
            height: 34,
            minWidth: 34,
            padding: 0,
            borderRadius: 'var(--radius-full)'
          }}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div
          style={{
            position: 'relative',
            cursor: 'pointer',
            color: 'var(--text-secondary)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 34,
            height: 34,
            minWidth: 34
          }}
          title="Notifications"
        >
          <Bell size={18} />
          <span
            style={{
              position: 'absolute',
              top: 2,
              right: 2,
              minWidth: 14,
              height: 14,
              padding: '0 3px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--rose-500)',
              color: '#FFFFFF',
              fontSize: '0.58rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 0 1.5px var(--bg-surface)',
              lineHeight: 1
            }}
          >
            3
          </span>
        </div>

        <button
          type="button"
          onClick={onOpenDrawer}
          style={{
            border: 'none',
            background: 'transparent',
            padding: 0,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 34,
            height: 34,
            minWidth: 34,
            flexShrink: 0,
            marginLeft: '0.1rem'
          }}
          title="Account Menu"
        >
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
            alt={user?.name || 'User'}
            style={{
              width: 30,
              height: 30,
              borderRadius: 'var(--radius-full)',
              objectFit: 'cover',
              border: '1.5px solid var(--border-light)'
            }}
          />
        </button>
      </div>
    </header>
  );
}
