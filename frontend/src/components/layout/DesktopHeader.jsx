import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Search, Bell, Sun, Moon, ChevronDown, Shield,
  UserCheck, PhoneCall, LogOut, Check, Building2, School,
  User as UserIcon, CheckCheck, Clock, CreditCard, Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useBranding } from '../../context/BrandingContext';
import UserProfileModal from '../UserProfileModal';

export default function DesktopHeader({
  search,
  setSearch,
  academicWorkspace,
  setAcademicWorkspace,
  programs = []
}) {
  const { user, role, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { branding } = useBranding();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Payment Received',
      desc: '₹10,000 recorded via PhonePe for Dalli Srinivas Reddy (26A106BA058)',
      time: '10m ago',
      unread: true,
      icon: CreditCard,
      color: '#059669'
    },
    {
      id: 2,
      title: 'Batch 26A Milestones',
      desc: 'Degree 2026-27 cohort reached 56% fee collection target',
      time: '1h ago',
      unread: true,
      icon: Sparkles,
      color: '#2563EB'
    },
    {
      id: 3,
      title: 'Pending Due Notice',
      desc: '12 reminder drafts prepared for upcoming semester installments',
      time: '3h ago',
      unread: true,
      icon: Clock,
      color: '#F59E0B'
    }
  ]);

  const profileRef = useRef(null);
  const notifRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Click outside listener to automatically close dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  return (
    <>
      <header style={{
        height: 56,
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-light)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.25rem',
        position: 'sticky',
        top: 0,
        zIndex: 30
      }} className="hide-mobile">
        {/* Left: Academic Workspace Selector & Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          {/* Workspace Dropdown */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            backgroundColor: 'var(--bg-subtle)',
            padding: '0.3rem 0.6rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-light)'
          }}>
            <School size={14} style={{ color: 'var(--primary-600)' }} />
            <select
              value={academicWorkspace}
              onChange={(e) => setAcademicWorkspace(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="all">🏢 All Academic Programs</option>
              {programs.length > 0 ? (
                programs.map((p) => {
                  const icon = p.code === 'DEGREE' ? '🎓' : p.code === 'PG' ? '🏛️' : p.code === 'INTER' ? '🏫' : '🎒';
                  return (
                    <option key={p.id} value={p.code ? p.code.toLowerCase() : String(p.id)}>
                      {icon} {p.name}
                    </option>
                  );
                })
              ) : (
                <>
                  <option value="degree">🎓 Degree Programs</option>
                  <option value="pg">🏛️ Post-Graduate</option>
                  <option value="inter">🏫 Intermediate College</option>
                  <option value="ssc">🎒 Secondary School</option>
                </>
              )}
            </select>
          </div>

          {/* Global Search Bar */}
          <div className="tablet-compact-search" style={{ position: 'relative', width: 'clamp(140px, 20vw, 280px)', minWidth: 120 }}>
            <Search size={15} style={{
              position: 'absolute',
              left: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)'
            }} />
            <input
              type="text"
              placeholder="Search student, Roll (26A...), SDE..."
              value={search}
              onChange={(e) => {
                const val = e.target.value;
                setSearch(val);
                if (val.trim() && location.pathname !== '/students' && location.pathname !== '/fee-collection') {
                  navigate('/students');
                }
              }}
              style={{
                width: '100%',
                padding: '0.45rem 0.75rem 0.45rem 2.2rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-light)',
                backgroundColor: 'var(--bg-subtle)',
                fontSize: '0.82rem',
                color: 'var(--text-primary)',
                outline: 'none',
                transition: 'var(--transition)'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--primary-600)';
                e.target.style.backgroundColor = 'var(--bg-surface)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--border-light)';
                e.target.style.backgroundColor = 'var(--bg-subtle)';
              }}
            />
          </div>
        </div>

        {/* Right Controls: Caller badge, Notifications, Theme switch, Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          {/* Caller Masking Badge if active */}
          {role === 'TEACHER_CALLER' && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.25rem 0.65rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: '#FEF3C7',
              color: '#92400E',
              fontSize: '0.74rem',
              fontWeight: 700,
              border: '1px solid #FDE68A'
            }}>
              <PhoneCall size={13} />
              <span>Staff Caller Mode (Margins Masked)</span>
            </div>
          )}

          {/* Interactive Notifications Popover */}
          <div ref={notifRef} style={{ position: 'relative' }}>
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfileMenu(false);
              }}
              title="Notifications & Activity"
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: unreadCount > 0 ? 'var(--text-primary)' : 'var(--text-secondary)',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.35rem',
                borderRadius: 'var(--radius-full)'
              }}
            >
              <Bell size={19} />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: 16,
                  height: 16,
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--rose-500)',
                  color: '#FFFFFF',
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 0 2px var(--bg-surface)'
                }}>
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown Panel */}
            {showNotifications && (
              <div style={{
                position: 'absolute',
                right: -60,
                top: '130%',
                width: 320,
                backgroundColor: 'var(--bg-surface)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-xl)',
                border: '1px solid var(--border-light)',
                zIndex: 60,
                overflow: 'hidden',
                animation: 'fadeIn 0.15s ease'
              }}>
                <div style={{
                  padding: '0.75rem 1rem',
                  borderBottom: '1px solid var(--border-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: 'var(--bg-subtle)'
                }}>
                  <div style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    Notifications & Alerts
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--primary-600)',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}
                    >
                      <CheckCheck size={13} />
                      <span>Mark all read</span>
                    </button>
                  )}
                </div>

                <div style={{ maxHeight: 280, overflowY: 'auto' }}>
                  {notifications.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.id}
                        style={{
                          padding: '0.75rem 1rem',
                          borderBottom: '1px solid var(--border-light)',
                          backgroundColor: item.unread ? 'var(--bg-surface)' : 'var(--bg-subtle)',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '0.65rem'
                        }}
                      >
                        <div style={{
                          width: 28,
                          height: 28,
                          borderRadius: 'var(--radius-full)',
                          backgroundColor: `${item.color}15`,
                          color: item.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          marginTop: 2
                        }}>
                          <Icon size={14} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: item.unread ? 800 : 600, color: 'var(--text-primary)' }}>
                              {item.title}
                            </div>
                            <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>{item.time}</span>
                          </div>
                          <div style={{ fontSize: '0.73rem', color: 'var(--text-secondary)', marginTop: '0.15rem', lineHeight: 1.3 }}>
                            {item.desc}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Light / Dark Mode Toggle Switch */}
          <button
            onClick={toggleTheme}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            style={{
              width: 50,
              height: 26,
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border-light)',
              display: 'flex',
              alignItems: 'center',
              padding: '2px',
              cursor: 'pointer',
              position: 'relative'
            }}
          >
            <div style={{
              width: 20,
              height: 20,
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--bg-surface)',
              boxShadow: 'var(--shadow-xs)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isDark ? 'var(--amber-500)' : 'var(--text-secondary)',
              transform: isDark ? 'translateX(24px)' : 'translateX(0)',
              transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
              {isDark ? <Moon size={12} /> : <Sun size={12} />}
            </div>
          </button>

          {/* User Profile Menu with Click-Outside Auto-Close */}
          <div ref={profileRef} style={{ position: 'relative' }}>
            <button
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                setShowNotifications(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.55rem',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '0.25rem 0.5rem',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              <img
                src={user.avatar}
                alt={user.name}
                style={{ width: 34, height: 34, borderRadius: 'var(--radius-full)', objectFit: 'cover', border: '1.5px solid var(--border-light)' }}
              />
              <div className="hide-tablet" style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                  {user.name}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                  {user.roleLabel}
                </div>
              </div>
              <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
            </button>

            {/* Profile Dropdown Card */}
            {showProfileMenu && (
              <div style={{
                position: 'absolute',
                right: 0,
                top: '120%',
                width: 260,
                backgroundColor: 'var(--bg-surface)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-xl)',
                border: '1px solid var(--border-light)',
                padding: '1rem',
                zIndex: 60,
                animation: 'fadeIn 0.15s ease'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.85rem' }}>
                  <img
                    src={user.avatar}
                    alt={user.name}
                    style={{ width: 42, height: 42, borderRadius: 'var(--radius-full)', objectFit: 'cover' }}
                  />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user.name}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user.email}
                    </div>
                  </div>
                </div>

                <div style={{
                  padding: '0.5rem 0.65rem',
                  backgroundColor: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-xs)',
                  marginBottom: '0.85rem',
                  fontSize: '0.74rem'
                }}>
                  <div style={{ color: 'var(--text-muted)', fontWeight: 600 }}>AUTHENTICATED ROLE</div>
                  <div style={{ fontWeight: 800, color: 'var(--primary-700)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.15rem' }}>
                    {role === 'ADMIN' && <Shield size={13} />}
                    {role === 'PRINCIPAL' && <UserCheck size={13} />}
                    {role === 'TEACHER_CALLER' && <PhoneCall size={13} />}
                    <span>{user.roleLabel}</span>
                  </div>
                  {role === 'TEACHER_CALLER' && (
                    <div style={{ marginTop: '0.35rem', color: '#92400E', fontWeight: 600, fontSize: '0.7rem' }}>
                      Assigned Cohort: <strong>Batch 26A</strong>
                    </div>
                  )}
                </div>

                {/* My Profile Button */}
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    setShowProfileModal(true);
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.45rem',
                    padding: '0.55rem',
                    borderRadius: 'var(--radius-xs)',
                    border: '1px solid var(--border-light)',
                    backgroundColor: 'var(--bg-subtle)',
                    color: 'var(--text-primary)',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    marginBottom: '0.5rem'
                  }}
                >
                  <UserIcon size={14} />
                  <span>My Profile & Security</span>
                </button>

                <button
                  onClick={() => {
                    logout();
                    setShowProfileMenu(false);
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '0.55rem',
                    borderRadius: 'var(--radius-xs)',
                    border: '1px solid #FEE2E2',
                    backgroundColor: '#FEF2F2',
                    color: '#DC2626',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <LogOut size={14} />
                  <span>Sign Out / Switch Account</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </>
  );
}
