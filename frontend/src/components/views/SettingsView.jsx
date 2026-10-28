import React, { useState, useEffect } from 'react';
import {
  Settings, Building2, Mail, ShieldAlert, Check,
  Palette, Phone, MapPin, FileText, Send, AlertCircle,
  Tag, Plus, Lock, Globe, Server, CheckCircle2
} from 'lucide-react';
import { api } from '../../services/api';
import { useBranding } from '../../context/BrandingContext';

export default function SettingsView() {
  const { branding, updateBranding, refreshBranding } = useBranding();
  const [activeTab, setActiveTab] = useState('branding'); // 'branding' | 'smtp' | 'custom_fields'

  // Branding Form State
  const [instName, setInstName] = useState(branding?.institution_name || '');
  const [tagline, setTagline] = useState(branding?.tagline || '');
  const [shortName, setShortName] = useState(branding?.short_name || '');
  const [logoUrl, setLogoUrl] = useState(branding?.logo_url || '');
  const [primaryColor, setPrimaryColor] = useState(branding?.primary_color || '#1E3A8A');
  const [accentColor, setAccentColor] = useState(branding?.accent_color || '#2563EB');
  const [supportPhone, setSupportPhone] = useState(branding?.support_phone || '');
  const [supportEmail, setSupportEmail] = useState(branding?.support_email || '');
  const [address, setAddress] = useState(branding?.address || '');
  const [receiptHeader, setReceiptHeader] = useState(branding?.receipt_header || '');
  const [receiptFooter, setReceiptFooter] = useState(branding?.receipt_footer || '');
  const [academicYear, setAcademicYear] = useState(branding?.current_academic_year || '2026-2027');

  // SMTP Form State
  const [smtpHost, setSmtpHost] = useState(branding?.smtp_host || 'smtp.gmail.com');
  const [smtpPort, setSmtpPort] = useState(branding?.smtp_port || 587);
  const [smtpUser, setSmtpUser] = useState(branding?.smtp_username || '');
  const [smtpPass, setSmtpPass] = useState(branding?.smtp_password || '');
  const [smtpFromEmail, setSmtpFromEmail] = useState(branding?.smtp_from_email || '');
  const [smtpFromName, setSmtpFromName] = useState(branding?.smtp_from_name || '');
  const [smtpUseTls, setSmtpUseTls] = useState(branding?.smtp_use_tls ?? true);
  const [testEmailTarget, setTestEmailTarget] = useState('');
  const [testingSmtp, setTestingSmtp] = useState(false);
  const [smtpTestResult, setSmtpTestResult] = useState(null);

  // Custom Fields State
  const [fields, setFields] = useState([]);
  const [label, setLabel] = useState('');
  const [key, setKey] = useState('');
  const [fieldType, setFieldType] = useState('text');
  const [isMasked, setIsMasked] = useState(false);
  const [fieldLoading, setFieldLoading] = useState(false);

  // UI state
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (branding) {
      setInstName(branding.institution_name || '');
      setTagline(branding.tagline || '');
      setShortName(branding.short_name || '');
      setLogoUrl(branding.logo_url || '');
      setPrimaryColor(branding.primary_color || '#1E3A8A');
      setAccentColor(branding.accent_color || '#2563EB');
      setSupportPhone(branding.support_phone || '');
      setSupportEmail(branding.support_email || '');
      setAddress(branding.address || '');
      setReceiptHeader(branding.receipt_header || '');
      setReceiptFooter(branding.receipt_footer || '');
      setAcademicYear(branding.current_academic_year || '2026-2027');

      setSmtpHost(branding.smtp_host || 'smtp.gmail.com');
      setSmtpPort(branding.smtp_port || 587);
      setSmtpUser(branding.smtp_username || '');
      setSmtpPass(branding.smtp_password || '');
      setSmtpFromEmail(branding.smtp_from_email || '');
      setSmtpFromName(branding.smtp_from_name || '');
      setSmtpUseTls(branding.smtp_use_tls ?? true);
    }
  }, [branding]);

  const loadFields = async () => {
    try {
      const data = await api.getCustomFields();
      setFields(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadFields();
  }, []);

  const handleSaveBranding = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      await updateBranding({
        institution_name: instName,
        tagline: tagline,
        short_name: shortName,
        logo_url: logoUrl,
        primary_color: primaryColor,
        accent_color: accentColor,
        support_phone: supportPhone,
        support_email: supportEmail,
        address: address,
        receipt_header: receiptHeader,
        receipt_footer: receiptFooter,
        current_academic_year: academicYear
      });
      setFeedback({ type: 'success', message: 'Institution white-label branding updated and applied across the entire portal!' });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to save branding settings.' });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSmtp = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      await updateBranding({
        smtp_host: smtpHost,
        smtp_port: Number(smtpPort),
        smtp_username: smtpUser,
        smtp_password: smtpPass,
        smtp_from_email: smtpFromEmail,
        smtp_from_name: smtpFromName,
        smtp_use_tls: smtpUseTls
      });
      setFeedback({ type: 'success', message: 'SMTP email server settings saved successfully!' });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to save SMTP settings.' });
    } finally {
      setSaving(false);
    }
  };

  const handleTestSmtp = async () => {
    if (!testEmailTarget.trim()) {
      alert('Please enter a destination email address to send the test message.');
      return;
    }

    setTestingSmtp(true);
    setSmtpTestResult(null);
    try {
      const res = await api.testSMTPEmail({
        test_email: testEmailTarget.trim(),
        smtp_host: smtpHost,
        smtp_port: Number(smtpPort),
        smtp_username: smtpUser,
        smtp_password: smtpPass,
        smtp_from_email: smtpFromEmail,
        smtp_use_tls: smtpUseTls
      });
      setSmtpTestResult(res);
    } catch (err) {
      setSmtpTestResult({
        success: false,
        message: err.message || 'Connection test failed.'
      });
    } finally {
      setTestingSmtp(false);
    }
  };

  const handleLabelChange = (e) => {
    const val = e.target.value;
    setLabel(val);
    const slug = val.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').slice(0, 30);
    setKey(slug);
  };

  const handleCreateField = async (e) => {
    e.preventDefault();
    if (!label.trim() || !key.trim()) return;

    setFieldLoading(true);
    try {
      await api.addCustomField({
        field_label: label.trim(),
        field_key: key.trim(),
        field_type: fieldType,
        is_masked_for_callers: isMasked
      });
      setFeedback({ type: 'success', message: `Added dynamic field "${label}" successfully!` });
      setLabel('');
      setKey('');
      setIsMasked(false);
      await loadFields();
      setTimeout(() => setFeedback(null), 4000);
    } catch (e) {
      setFeedback({ type: 'error', message: 'Error adding custom field' });
    } finally {
      setFieldLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 1040, margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '1.25rem' }}>
        <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Institution Configuration & White-Label Settings
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Configure institution identity, custom branding logos, SMTP password reset mail server, and student custom fields.
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        borderBottom: '1px solid var(--border-light)',
        marginBottom: '1.5rem',
        overflowX: 'auto'
      }}>
        {[
          { id: 'branding', label: 'White-Label Branding & Identity', icon: Building2 },
          { id: 'smtp', label: 'SMTP Email & Password Reset', icon: Mail },
          { id: 'custom_fields', label: 'Dynamic Custom Fields Builder', icon: Tag }
        ].map(t => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                padding: '0.65rem 0.25rem',
                border: 'none',
                background: 'transparent',
                fontSize: '0.9rem',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? 'var(--primary-600)' : 'var(--text-secondary)',
                borderBottom: isActive ? '2px solid var(--primary-600)' : '2px solid transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                whiteSpace: 'nowrap'
              }}
            >
              <Icon size={16} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {feedback && (
        <div style={{
          padding: '0.85rem 1.15rem',
          backgroundColor: feedback.type === 'success' ? '#ECFDF5' : '#FEF2F2',
          color: feedback.type === 'success' ? '#065F46' : '#991B1B',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.86rem',
          fontWeight: 600,
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          border: `1px solid ${feedback.type === 'success' ? '#A7F3D0' : '#FECACA'}`,
          animation: 'fadeIn 0.2s ease'
        }}>
          {feedback.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* TAB 1: WHITE-LABEL BRANDING */}
      {activeTab === 'branding' && (
        <form onSubmit={handleSaveBranding}>
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-light)',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-xs)',
            marginBottom: '1.5rem'
          }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
              Institution Profile & Visual Theme
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Institution Full Legal Name *
                </label>
                <input
                  type="text"
                  value={instName}
                  onChange={(e) => setInstName(e.target.value)}
                  required
                  placeholder="e.g. Navodaya Educational Academy"
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

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Tagline / Subtitle
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="e.g. Center for Higher Education & Professional Excellence"
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

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Short Brand Code / Acronym
                </label>
                <input
                  type="text"
                  value={shortName}
                  onChange={(e) => setShortName(e.target.value)}
                  placeholder="e.g. Navodaya or NEA"
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

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Current Academic Year
                </label>
                <input
                  type="text"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  placeholder="e.g. 2026-2027"
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
            </div>

            {/* Logo & Colors */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginTop: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Custom Logo URL (PNG/SVG)
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="url"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://example.com/logo.png"
                    style={{
                      flex: 1,
                      padding: '0.55rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-light)',
                      fontSize: '0.85rem',
                      outline: 'none'
                    }}
                  />
                  {logoUrl && (
                    <div style={{
                      width: 36,
                      height: 36,
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      backgroundColor: 'var(--bg-subtle)'
                    }}>
                      <img src={logoUrl} alt="Logo Preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Primary Brand Color
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    style={{ width: 44, height: 38, padding: 0, border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    style={{
                      width: 110,
                      padding: '0.55rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-light)',
                      fontSize: '0.85rem'
                    }}
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Theme accent & buttons</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Details & Official Receipt Format */}
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-light)',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-xs)',
            marginBottom: '1.5rem'
          }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
              Institutional Contact Details & Receipt Format
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Campus Support Phone
                </label>
                <input
                  type="text"
                  value={supportPhone}
                  onChange={(e) => setSupportPhone(e.target.value)}
                  placeholder="+91 98494 60071"
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

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Support Email Address
                </label>
                <input
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  placeholder="support@navodaya.edu"
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
            </div>

            <div style={{ marginTop: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Campus Physical Address (Printed on Receipts)
              </label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="D.No: 12-4-5, Main Road, Tuni & Kakinada Campuses, Andhra Pradesh"
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-light)',
                  fontSize: '0.85rem',
                  outline: 'none',
                  resize: 'none'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginTop: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Official Receipt Header Title
                </label>
                <input
                  type="text"
                  value={receiptHeader}
                  onChange={(e) => setReceiptHeader(e.target.value)}
                  placeholder="NAVODAYA EDUCATIONAL ACADEMY - OFFICIAL FEE RECEIPT"
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

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Official Receipt Footer Note
                </label>
                <input
                  type="text"
                  value={receiptFooter}
                  onChange={(e) => setReceiptFooter(e.target.value)}
                  placeholder="Thank you for your payment. This is a computer generated receipt."
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
            </div>

            <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
              <button
                type="submit"
                disabled={saving}
                className="btn btn-primary"
                style={{ gap: '0.4rem' }}
              >
                <Check size={16} />
                <span>{saving ? 'Saving...' : 'Save White-Label Branding'}</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 2: SMTP CONFIGURATION */}
      {activeTab === 'smtp' && (
        <div>
          <form onSubmit={handleSaveSmtp}>
            <div style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-light)',
              padding: '1.5rem',
              boxShadow: 'var(--shadow-xs)',
              marginBottom: '1.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <Server size={20} style={{ color: 'var(--primary-600)' }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  SMTP Mail Server (Forgot Password & Password Reset OTP Dispatch)
                </h3>
              </div>

              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                When users click "Forgot Password?", the portal sends an official 6-digit verification OTP code through this SMTP server.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                    SMTP Host *
                  </label>
                  <input
                    type="text"
                    value={smtpHost}
                    onChange={(e) => setSmtpHost(e.target.value)}
                    required
                    placeholder="e.g. smtp.gmail.com or mail.yourinstitution.edu"
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

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                    SMTP Port *
                  </label>
                  <input
                    type="number"
                    value={smtpPort}
                    onChange={(e) => setSmtpPort(e.target.value)}
                    required
                    placeholder="587 (TLS) or 465 (SSL)"
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

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                    SMTP Username / Login Account
                  </label>
                  <input
                    type="text"
                    value={smtpUser}
                    onChange={(e) => setSmtpUser(e.target.value)}
                    placeholder="notifications@navodaya.edu"
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

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                    SMTP Password / App Password
                  </label>
                  <input
                    type="password"
                    value={smtpPass}
                    onChange={(e) => setSmtpPass(e.target.value)}
                    placeholder="••••••••••••"
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

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                    Sender "From" Email Address
                  </label>
                  <input
                    type="email"
                    value={smtpFromEmail}
                    onChange={(e) => setSmtpFromEmail(e.target.value)}
                    placeholder="noreply@navodaya.edu"
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

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                    Sender "From" Display Name
                  </label>
                  <input
                    type="text"
                    value={smtpFromName}
                    onChange={(e) => setSmtpFromName(e.target.value)}
                    placeholder="Navodaya Academy Administration"
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
              </div>

              <div style={{ marginTop: '1.25rem' }}>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={smtpUseTls}
                    onChange={(e) => setSmtpUseTls(e.target.checked)}
                    style={{ accentColor: 'var(--primary-600)' }}
                  />
                  <span>Enable TLS / STARTTLS Encryption (Recommended)</span>
                </label>
              </div>

              <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary"
                  style={{ gap: '0.4rem' }}
                >
                  <Check size={16} />
                  <span>{saving ? 'Saving...' : 'Save SMTP Configuration'}</span>
                </button>
              </div>
            </div>
          </form>

          {/* Test Email Dispatch Card */}
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-light)',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-xs)'
          }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Test SMTP Connection & Mail Delivery
            </h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.15rem' }}>
              Dispatch a test verification email to confirm firewall ports and SMTP credentials.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', maxWidth: 500 }}>
              <input
                type="email"
                placeholder="Enter test recipient email (e.g. yourname@gmail.com)"
                value={testEmailTarget}
                onChange={(e) => setTestEmailTarget(e.target.value)}
                style={{
                  flex: 1,
                  padding: '0.55rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-light)',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              />
              <button
                type="button"
                onClick={handleTestSmtp}
                disabled={testingSmtp}
                className="btn btn-primary btn-sm"
                style={{ gap: '0.4rem', whiteSpace: 'nowrap' }}
              >
                <Send size={14} />
                <span>{testingSmtp ? 'Testing...' : 'Send Test Email'}</span>
              </button>
            </div>

            {smtpTestResult && (
              <div style={{
                marginTop: '1rem',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: smtpTestResult.success ? '#ECFDF5' : '#FEF2F2',
                border: `1px solid ${smtpTestResult.success ? '#A7F3D0' : '#FECACA'}`,
                color: smtpTestResult.success ? '#065F46' : '#991B1B',
                fontSize: '0.82rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, marginBottom: '0.2rem' }}>
                  {smtpTestResult.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  <span>{smtpTestResult.success ? 'SMTP Connection Succeeded!' : 'SMTP Connection Diagnostic:'}</span>
                </div>
                <div>{smtpTestResult.message}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: DYNAMIC CUSTOM FIELDS */}
      {activeTab === 'custom_fields' && (
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-light)',
          padding: '1.5rem',
          boxShadow: 'var(--shadow-xs)'
        }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.15rem' }}>
            Dynamic Custom Field Builder (Zero DB Migration)
          </h3>

          <form onSubmit={handleCreateField} style={{
            backgroundColor: 'var(--bg-subtle)',
            padding: '1.25rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-light)',
            marginBottom: '1.5rem'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Field Label *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Hostel Room No"
                  value={label}
                  onChange={handleLabelChange}
                  required
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

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Field Key (Auto-slug)
                </label>
                <input
                  type="text"
                  value={key}
                  readOnly
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-light)',
                    backgroundColor: 'var(--bg-surface)',
                    fontSize: '0.85rem',
                    color: 'var(--text-muted)'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Data Type
                </label>
                <select
                  value={fieldType}
                  onChange={(e) => setFieldType(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-light)',
                    backgroundColor: 'var(--bg-surface)',
                    fontSize: '0.85rem',
                    outline: 'none'
                  }}
                >
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="date">Date</option>
                  <option value="boolean">Yes/No</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.82rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={isMasked}
                  onChange={(e) => setIsMasked(e.target.checked)}
                />
                <span>Mask for caller / staff role</span>
              </label>

              <button
                type="submit"
                disabled={fieldLoading}
                className="btn btn-primary btn-sm"
                style={{ gap: '0.4rem' }}
              >
                <Plus size={15} />
                <span>{fieldLoading ? 'Creating...' : 'Create Field'}</span>
              </button>
            </div>
          </form>

          {/* List of Custom Fields */}
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            Registered Dynamic Fields ({fields.length})
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.75rem' }}>
            {fields.map((f) => (
              <div
                key={f.id}
                style={{
                  padding: '0.85rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-light)',
                  backgroundColor: 'var(--bg-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                    {f.field_label}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    key: <code>{f.field_key}</code> ({f.field_type})
                  </div>
                </div>

                {f.is_masked_for_callers && (
                  <span style={{
                    padding: '0.15rem 0.45rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    backgroundColor: '#FEF3C7',
                    color: '#92400E'
                  }}>
                    Masked
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
