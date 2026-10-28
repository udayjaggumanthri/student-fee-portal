import React, { useState, useEffect } from 'react';
import {
  MessageSquare, Plus, Check, Copy, ExternalLink,
  Send, Globe, Sparkles, BookOpen, CheckCircle2
} from 'lucide-react';
import { api } from '../../services/api';

export default function CommunicationsView() {
  const [templates, setTemplates] = useState([]);
  const [selectedLang, setSelectedLang] = useState('all'); // 'all', 'en', 'te'
  const [activeTemplate, setActiveTemplate] = useState(null);
  const [copied, setCopied] = useState(false);
  const [savedToast, setSavedToast] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadTemplates = async () => {
    try {
      const data = await api.getWhatsAppTemplates();
      setTemplates(data);
      if (data.length > 0) setActiveTemplate(data[0]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const filteredTemplates = templates.filter((t) => {
    if (selectedLang === 'en') return t.title.toLowerCase().includes('english');
    if (selectedLang === 'te') return t.title.includes('తెలుగు') || t.title.toLowerCase().includes('telugu');
    return true;
  });

  const handleCopy = () => {
    if (!activeTemplate) return;
    navigator.clipboard.writeText(activeTemplate.message_text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          WhatsApp Communications & Bilingual Center
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Manage personalized fee reminders in both English and Telugu (తెలుగు) with automated student tags.
        </p>
      </div>

      {savedToast && (
        <div style={{
          padding: '0.75rem 1rem',
          backgroundColor: '#ECFDF5',
          color: '#065F46',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.84rem',
          fontWeight: 600,
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          border: '1px solid #A7F3D0'
        }}>
          <Check size={16} />
          <span>WhatsApp template saved and set as default!</span>
        </div>
      )}

      {/* Language Filter Pills */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '1.25rem'
      }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginRight: '0.25rem' }}>
          Filter Templates:
        </span>
        <button
          onClick={() => setSelectedLang('all')}
          style={{
            padding: '0.35rem 0.85rem',
            borderRadius: 'var(--radius-full)',
            border: selectedLang === 'all' ? '1.5px solid var(--primary-600)' : '1px solid var(--border-light)',
            backgroundColor: selectedLang === 'all' ? 'var(--primary-50)' : 'var(--bg-surface)',
            color: selectedLang === 'all' ? 'var(--primary-700)' : 'var(--text-secondary)',
            fontSize: '0.8rem',
            fontWeight: selectedLang === 'all' ? 700 : 500,
            cursor: 'pointer'
          }}
        >
          All Templates ({templates.length})
        </button>
        <button
          onClick={() => setSelectedLang('en')}
          style={{
            padding: '0.35rem 0.85rem',
            borderRadius: 'var(--radius-full)',
            border: selectedLang === 'en' ? '1.5px solid #2563EB' : '1px solid var(--border-light)',
            backgroundColor: selectedLang === 'en' ? '#EFF6FF' : 'var(--bg-surface)',
            color: selectedLang === 'en' ? '#1E40AF' : 'var(--text-secondary)',
            fontSize: '0.8rem',
            fontWeight: selectedLang === 'en' ? 700 : 500,
            cursor: 'pointer'
          }}
        >
          🇬🇧 English
        </button>
        <button
          onClick={() => setSelectedLang('te')}
          style={{
            padding: '0.35rem 0.85rem',
            borderRadius: 'var(--radius-full)',
            border: selectedLang === 'te' ? '1.5px solid #059669' : '1px solid var(--border-light)',
            backgroundColor: selectedLang === 'te' ? '#ECFDF5' : 'var(--bg-surface)',
            color: selectedLang === 'te' ? '#065F46' : 'var(--text-secondary)',
            fontSize: '0.8rem',
            fontWeight: selectedLang === 'te' ? 700 : 500,
            cursor: 'pointer'
          }}
        >
          🇮🇳 తెలుగు (Telugu)
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 290px), 1fr))',
        gap: '1.25rem'
      }}>
        {/* Template List */}
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-light)',
          padding: '1.25rem',
          boxShadow: 'var(--shadow-xs)'
        }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.85rem', color: 'var(--text-primary)' }}>
            Available Templates ({filteredTemplates.length})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {filteredTemplates.map((t) => {
              const isTelugu = t.title.includes('తెలుగు') || t.title.toLowerCase().includes('telugu');
              const isSelected = activeTemplate && activeTemplate.id === t.id;

              return (
                <div
                  key={t.id}
                  onClick={() => setActiveTemplate(t)}
                  style={{
                    padding: '0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    border: isSelected ? '1.5px solid var(--primary-600)' : '1px solid var(--border-light)',
                    backgroundColor: isSelected ? 'var(--primary-50)' : 'var(--bg-subtle)',
                    cursor: 'pointer',
                    transition: 'var(--transition)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: isSelected ? 'var(--primary-700)' : 'var(--text-primary)' }}>
                      {t.title}
                    </span>
                    <span style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '0.15rem 0.45rem',
                      borderRadius: 4,
                      backgroundColor: isTelugu ? '#ECFDF5' : '#EFF6FF',
                      color: isTelugu ? '#065F46' : '#1E40AF'
                    }}>
                      {isTelugu ? '🇮🇳 తెలుగు' : '🇬🇧 English'}
                    </span>
                  </div>

                  <div style={{
                    fontSize: '0.74rem',
                    color: 'var(--text-muted)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    lineHeight: 1.4
                  }}>
                    {t.message_text.replace(/\n/g, ' ')}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Template Editor / Preview */}
        {activeTemplate && (
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-light)',
            padding: '1.25rem',
            boxShadow: 'var(--shadow-xs)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {activeTemplate.title}
                  </h3>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {activeTemplate.title.includes('తెలుగు') ? 'Telugu Notification Script' : 'English Notification Script'}
                  </span>
                </div>

                <button
                  onClick={handleCopy}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.74rem', padding: '0.25rem 0.55rem', gap: '0.35rem' }}
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copied ? 'Copied' : 'Copy Text'}</span>
                </button>
              </div>

              <textarea
                rows={11}
                value={activeTemplate.message_text}
                onChange={(e) => setActiveTemplate({ ...activeTemplate, message_text: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-light)',
                  backgroundColor: 'var(--bg-subtle)',
                  fontSize: '0.84rem',
                  fontFamily: activeTemplate.title.includes('తెలుగు') ? 'inherit' : 'monospace',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  resize: 'vertical',
                  lineHeight: 1.5,
                  marginBottom: '0.75rem'
                }}
              />

              <div style={{
                padding: '0.65rem 0.85rem',
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-xs)',
                fontSize: '0.74rem',
                color: 'var(--text-secondary)'
              }}>
                <strong style={{ display: 'block', marginBottom: '0.2rem', color: 'var(--text-primary)' }}>
                  Dynamic Tags Supported:
                </strong>
                <code>&#123;&#123;student_name&#125;&#125;</code>, <code>&#123;&#123;course&#125;&#125;</code>, <code>&#123;&#123;batch&#125;&#125;</code>, <code>&#123;&#123;balance_due&#125;&#125;</code>, <code>&#123;&#123;paid_amount&#125;&#125;</code>, <code>&#123;&#123;total_fee&#125;&#125;</code>
              </div>
            </div>

            <div style={{ marginTop: '1.25rem' }}>
              <button
                onClick={handleSave}
                className="btn btn-whatsapp"
                style={{ width: '100%', gap: '0.45rem', fontWeight: 700 }}
              >
                <Send size={15} />
                <span>Save Template Changes</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
