import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap, Shield, UserCheck, PhoneCall, ArrowRight,
  Lock, Mail, Key, CheckCircle2, AlertCircle, X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useBranding } from '../../context/BrandingContext';
import { api } from '../../services/api';

export default function LoginView() {
  const { login } = useAuth();
  const { branding } = useBranding();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState('ADMIN');
  const [email, setEmail] = useState('admin@navodaya.edu');
  const [password, setPassword] = useState('••••••••••••');

  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: Email, 2: OTP & New Password, 3: Done
  const [forgotEmail, setForgotEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [demoOtpHint, setDemoOtpHint] = useState('');

  const handleRoleSelect = (r) => {
    setSelectedRole(r);
    if (r === 'ADMIN') setEmail('admin@navodaya.edu');
    else if (r === 'PRINCIPAL') setEmail('principal@navodaya.edu');
    else setEmail('anitha@navodaya.edu');
  };

  const handleSignIn = (e) => {
    e.preventDefault();
    login(selectedRole);
    navigate('/dashboard');
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setForgotError('Please enter your institutional email address.');
      return;
    }

    setForgotLoading(true);
    setForgotError('');
    setDemoOtpHint('');

    try {
      const res = await api.forgotPassword(forgotEmail.trim());
      if (res.demo_code) {
        setDemoOtpHint(res.demo_code);
      }
      setForgotStep(2);
    } catch (err) {
      setForgotError(err.message || 'Error sending password reset OTP.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otpCode.trim() || otpCode.trim().length !== 6) {
      setForgotError('Please enter the 6-digit OTP code.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setForgotError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setForgotError('Passwords do not match.');
      return;
    }

    setForgotLoading(true);
    setForgotError('');

    try {
      await api.resetPassword({
        email: forgotEmail.trim(),
        otp_code: otpCode.trim(),
        new_password: newPassword
      });
      setForgotStep(3);
    } catch (err) {
      setForgotError(err.message || 'Invalid or expired OTP code.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleCloseForgotModal = () => {
    setShowForgotModal(false);
    setForgotStep(1);
    setForgotEmail('');
    setOtpCode('');
    setNewPassword('');
    setConfirmPassword('');
    setForgotError('');
    setDemoOtpHint('');
  };

  const instTitle = branding?.institution_name || 'Navodaya Educational Academy';
  const instTagline = branding?.tagline || 'School & Colleges • Fee Management System';

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-app)',
      padding: '1.5rem'
    }}>
      <div style={{
        maxWidth: 440,
        width: '100%',
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-xl)',
        padding: '2.25rem',
        boxShadow: 'var(--shadow-xl)',
        border: '1px solid var(--border-light)'
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            width: 54,
            height: 54,
            borderRadius: 'var(--radius-md)',
            backgroundColor: branding?.primary_color || 'var(--primary-600)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            boxShadow: '0 4px 12px var(--primary-shadow)',
            marginBottom: '0.75rem',
            overflow: 'hidden'
          }}>
            {branding?.logo_url ? (
              <img src={branding.logo_url} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
            ) : (
              <GraduationCap size={30} />
            )}
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>
            {instTitle}
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            {instTagline}
          </p>
        </div>

        {/* Demo Role Switcher */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            Select Institutional Account Role:
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
            {[
              { id: 'ADMIN', label: 'Admin', icon: Shield, desc: 'Full System' },
              { id: 'PRINCIPAL', label: 'Principal', icon: UserCheck, desc: 'Oversight' },
              { id: 'TEACHER_CALLER', label: 'Staff / Caller', icon: PhoneCall, desc: 'Masked View' }
            ].map((item) => {
              const Icon = item.icon;
              const isSelected = selectedRole === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleRoleSelect(item.id)}
                  style={{
                    padding: '0.65rem 0.4rem',
                    borderRadius: 'var(--radius-sm)',
                    border: isSelected ? '1.5px solid var(--primary-600)' : '1px solid var(--border-light)',
                    backgroundColor: isSelected ? 'var(--primary-50)' : 'var(--bg-subtle)',
                    color: isSelected ? 'var(--primary-700)' : 'var(--text-secondary)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.25rem',
                    cursor: 'pointer',
                    transition: 'var(--transition)'
                  }}
                >
                  <Icon size={16} />
                  <span style={{ fontSize: '0.78rem', fontWeight: 700 }}>{item.label}</span>
                  <span style={{ fontSize: '0.65rem', opacity: 0.8 }}>{item.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleSignIn}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
              Email or Username:
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-light)',
                backgroundColor: 'var(--bg-subtle)',
                fontSize: '0.88rem',
                color: 'var(--text-primary)',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Password:
              </label>
              <button
                type="button"
                onClick={() => {
                  setForgotEmail(email);
                  setShowForgotModal(true);
                }}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--primary-600)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                Forgot Password?
              </button>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-light)',
                backgroundColor: 'var(--bg-subtle)',
                fontSize: '0.88rem',
                color: 'var(--text-primary)',
                outline: 'none'
              }}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.75rem', fontSize: '0.92rem', marginTop: '1.25rem' }}
          >
            <span>Sign In to {branding?.short_name || 'Navodaya'} Portal</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {instTitle} • Secure Institutional Access
        </div>
      </div>

      {/* Forgot Password OTP Modal */}
      {showForgotModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 120,
          padding: '1rem',
          animation: 'fadeIn 0.2s ease'
        }}>
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            width: '100%',
            maxWidth: 440,
            boxShadow: 'var(--shadow-xl)',
            border: '1px solid var(--border-light)',
            overflow: 'hidden'
          }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Key size={18} style={{ color: 'var(--primary-600)' }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Reset Account Password
                </h3>
              </div>
              <button
                onClick={handleCloseForgotModal}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              {forgotError && (
                <div style={{
                  padding: '0.75rem',
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #FECACA',
                  borderRadius: 'var(--radius-md)',
                  color: '#B91C1C',
                  fontSize: '0.82rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <AlertCircle size={16} />
                  <span>{forgotError}</span>
                </div>
              )}

              {/* Step 1: Send OTP */}
              {forgotStep === 1 && (
                <form onSubmit={handleSendOtp}>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    Enter your registered email address. We will dispatch a 6-digit verification OTP code through the institution SMTP mailer.
                  </p>

                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      Registered Institutional Email *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={16} style={{ position: 'absolute', left: 10, top: 11, color: 'var(--text-muted)' }} />
                      <input
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        required
                        placeholder="e.g. admin@navodaya.edu"
                        style={{
                          width: '100%',
                          padding: '0.55rem 0.75rem 0.55rem 2rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-light)',
                          fontSize: '0.85rem',
                          outline: 'none'
                        }}
                      />
                    </div>
                  </div>

                  <div className="modal-footer" style={{ padding: 0, border: 'none' }}>
                    <button type="button" onClick={handleCloseForgotModal} className="btn btn-secondary">
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="btn btn-primary"
                    >
                      {forgotLoading ? 'Dispatching OTP...' : 'Send Verification OTP'}
                    </button>
                  </div>
                </form>
              )}

              {/* Step 2: Validate OTP & Set New Password */}
              {forgotStep === 2 && (
                <form onSubmit={handleResetPassword}>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    A 6-digit OTP code was generated for <strong>{forgotEmail}</strong>. Enter it below along with your new password.
                  </p>

                  {demoOtpHint && (
                    <div style={{
                      padding: '0.65rem 0.85rem',
                      backgroundColor: '#EFF6FF',
                      border: '1px solid #BFDBFE',
                      borderRadius: 'var(--radius-sm)',
                      color: '#1D4ED8',
                      fontSize: '0.82rem',
                      marginBottom: '1rem'
                    }}>
                      ⚡ <strong>Verification OTP:</strong> <code style={{ fontSize: '1rem', fontWeight: 800 }}>{demoOtpHint}</code>
                    </div>
                  )}

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      6-Digit OTP Code *
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      required
                      placeholder="e.g. 123456"
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-light)',
                        fontSize: '1rem',
                        fontWeight: 700,
                        letterSpacing: '0.2em',
                        textAlign: 'center',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      New Password *
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      placeholder="Minimum 6 characters"
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-light)',
                        fontSize: '0.85rem',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      Confirm New Password *
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="Re-enter new password"
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-light)',
                        fontSize: '0.85rem',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div className="modal-footer" style={{ padding: 0, border: 'none' }}>
                    <button type="button" onClick={() => setForgotStep(1)} className="btn btn-secondary">
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="btn btn-primary"
                    >
                      {forgotLoading ? 'Verifying...' : 'Set New Password'}
                    </button>
                  </div>
                </form>
              )}

              {/* Step 3: Success */}
              {forgotStep === 3 && (
                <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                  <div style={{
                    width: 52,
                    height: 52,
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: '#ECFDF5',
                    color: '#059669',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1rem'
                  }}>
                    <CheckCircle2 size={32} />
                  </div>
                  <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                    Password Successfully Reset!
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                    Your password has been updated. You can now sign in using your new credentials.
                  </p>
                  <button
                    onClick={handleCloseForgotModal}
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                  >
                    Proceed to Sign In
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
