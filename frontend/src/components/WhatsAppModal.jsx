import React, { useState, useEffect } from 'react';
import { X, MessageSquare, Copy, ExternalLink, Check, Phone, Globe } from 'lucide-react';

export default function WhatsAppModal({ student, onClose }) {
  const [phone, setPhone] = useState('');
  const [selectedLang, setSelectedLang] = useState('en'); // 'en' or 'te'
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);

  // Build templates for current student
  const getEnglishText = (s) => {
    const course = s.group || s.program_name || 'Degree';
    const batch = s.batch_name || '26A';
    const roll = s.student_id || s.registration_no || `STD#${s.id}`;
    const paid = Number(s.total_paid_amount || 0).toLocaleString('en-IN');
    const due = Number(s.total_balance_due || 0).toLocaleString('en-IN');
    const total = Number(s.total_fee_amount || (Number(s.total_paid_amount || 0) + Number(s.total_balance_due || 0))).toLocaleString('en-IN');

    return (
      `Dear ${s.name},\n\n` +
      `Greetings from Navodaya Educational Academy.\n` +
      `This is a gentle reminder regarding your fee dues for ${course} (Batch: ${batch}).\n\n` +
      `📊 Fee Statement:\n` +
      `• Student / Roll ID: ${roll}\n` +
      `• Total Fee Assessed: ₹${total}\n` +
      `• Total Amount Paid: ₹${paid}\n` +
      `• Outstanding Balance Due: ₹${due}\n\n` +
      `Kindly clear the pending balance at your earliest convenience via PhonePe / Google Pay or directly at the Navodaya Office counter.\n` +
      `For any questions or payment confirmations, please contact our accounts desk.\n\n` +
      `Thank you,\n` +
      `Navodaya Educational Academy\n` +
      `Helpline: +91 98765 43210`
    );
  };

  const getTeluguText = (s) => {
    const course = s.group || s.program_name || 'డిగ్రీ';
    const batch = s.batch_name || '26A';
    const roll = s.student_id || s.registration_no || `STD#${s.id}`;
    const paid = Number(s.total_paid_amount || 0).toLocaleString('en-IN');
    const due = Number(s.total_balance_due || 0).toLocaleString('en-IN');
    const total = Number(s.total_fee_amount || (Number(s.total_paid_amount || 0) + Number(s.total_balance_due || 0))).toLocaleString('en-IN');

    return (
      `నమస్కారం ${s.name} గారు,\n\n` +
      `నవోదయ విద్యా సంస్థల (Navodaya Educational Academy) నుండి ఫీజు రిమైండర్ సందేశం.\n` +
      `మీ ${course} కోర్సు (బ్యాచ్: ${batch}) కు సంబంధించి ఫీజు వివరాలు క్రింది విధంగా ఉన్నాయి:\n\n` +
      `📊 ఫీజు వివరాలు:\n` +
      `• విద్యార్థి రోల్ నంబర్: ${roll}\n` +
      `• మొత్తం కోర్సు ఫీజు: ₹${total}\n` +
      `• ఇప్పటివరకు చెల్లించిన మొత్తం: ₹${paid}\n` +
      `• మిగిలిన బకాయి ఫీజు: ₹${due}\n\n` +
      `దయచేసి మిగిలిన బకాయి మొత్తాన్ని సత్వరమే నవోదయ విద్యా సంస్థల కార్యాలయ కౌంటర్ వద్ద లేదా PhonePe / Google Pay ద్వారా చెల్లించగలరు.\n` +
      `ఏవైనా సందేహాలు ఉంటే మా అకౌంట్స్ కార్యాలయాన్ని సంప్రదించండి.\n\n` +
      `ధన్యవాదములు,\n` +
      `నవోదయ ఎడ్యుకేషనల్ అకాడమీ (స్కూల్ & కాలేజెస్)\n` +
      `హెల్ప్‌లైన్: +91 98765 43210`
    );
  };

  useEffect(() => {
    if (student) {
      const initialPhone = student.primary_contact || student.secondary_contact || '';
      setPhone(initialPhone);
      if (selectedLang === 'te') {
        setMessage(getTeluguText(student));
      } else {
        setMessage(getEnglishText(student));
      }
    }
  }, [student, selectedLang]);

  if (!student) return null;

  const handleLangToggle = (lang) => {
    setSelectedLang(lang);
    if (lang === 'te') {
      setMessage(getTeluguText(student));
    } else {
      setMessage(getEnglishText(student));
    }
  };

  const handleLaunchWhatsApp = () => {
    let cleanPhone = phone.replace(/[^\d+]/g, '');
    if (cleanPhone.length === 10 && !cleanPhone.startsWith('91')) {
      cleanPhone = `91${cleanPhone}`;
    }
    const encoded = encodeURIComponent(message);
    const url = `https://wa.me/${cleanPhone}?text=${encoded}`;
    window.open(url, '_blank');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 580 }}>
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#25D366',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <MessageSquare size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                WhatsApp Fee Reminder
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {student.name} • Batch: {student.batch_name} • Balance: ₹{Number(student.total_balance_due || 0).toLocaleString('en-IN')}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-icon" style={{ border: 'none' }}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Bilingual Language Selector Pills */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--bg-subtle)',
            padding: '0.45rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.15rem',
            border: '1px solid var(--border-light)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', paddingLeft: '0.35rem' }}>
              <Globe size={15} style={{ color: 'var(--primary-600)' }} />
              <span>Message Language:</span>
            </div>

            <div style={{ display: 'flex', gap: '0.35rem' }}>
              <button
                type="button"
                onClick={() => handleLangToggle('en')}
                style={{
                  padding: '0.35rem 0.85rem',
                  borderRadius: 'var(--radius-xs)',
                  border: 'none',
                  backgroundColor: selectedLang === 'en' ? '#2563EB' : 'transparent',
                  color: selectedLang === 'en' ? '#FFFFFF' : 'var(--text-secondary)',
                  fontWeight: selectedLang === 'en' ? 700 : 500,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  transition: 'var(--transition)'
                }}
              >
                🇬🇧 English
              </button>
              <button
                type="button"
                onClick={() => handleLangToggle('te')}
                style={{
                  padding: '0.35rem 0.85rem',
                  borderRadius: 'var(--radius-xs)',
                  border: 'none',
                  backgroundColor: selectedLang === 'te' ? '#059669' : 'transparent',
                  color: selectedLang === 'te' ? '#FFFFFF' : 'var(--text-secondary)',
                  fontWeight: selectedLang === 'te' ? 700 : 500,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  transition: 'var(--transition)'
                }}
              >
                🇮🇳 తెలుగు (Telugu)
              </button>
            </div>
          </div>

          {/* Quick Contact Selector Buttons */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              Select Destination Contact Number:
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {student.primary_contact && (
                <button
                  type="button"
                  onClick={() => setPhone(student.primary_contact)}
                  style={{
                    padding: '0.4rem 0.7rem',
                    borderRadius: 'var(--radius-xs)',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    border: phone === student.primary_contact ? '1.5px solid #059669' : '1px solid var(--border-light)',
                    backgroundColor: phone === student.primary_contact ? '#ECFDF5' : 'var(--bg-surface)',
                    color: phone === student.primary_contact ? '#065F46' : 'var(--text-secondary)',
                    cursor: 'pointer'
                  }}
                >
                  Primary: {student.primary_contact}
                </button>
              )}

              {student.secondary_contact && (
                <button
                  type="button"
                  onClick={() => setPhone(student.secondary_contact)}
                  style={{
                    padding: '0.4rem 0.7rem',
                    borderRadius: 'var(--radius-xs)',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    border: phone === student.secondary_contact ? '1.5px solid #059669' : '1px solid var(--border-light)',
                    backgroundColor: phone === student.secondary_contact ? '#ECFDF5' : 'var(--bg-surface)',
                    color: phone === student.secondary_contact ? '#065F46' : 'var(--text-secondary)',
                    cursor: 'pointer'
                  }}
                >
                  Alt: {student.secondary_contact}
                </button>
              )}

              {student.reference_phone && (
                <button
                  type="button"
                  onClick={() => setPhone(student.reference_phone)}
                  style={{
                    padding: '0.4rem 0.7rem',
                    borderRadius: 'var(--radius-xs)',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    border: phone === student.reference_phone ? '1.5px solid #059669' : '1px solid var(--border-light)',
                    backgroundColor: phone === student.reference_phone ? '#ECFDF5' : 'var(--bg-surface)',
                    color: phone === student.reference_phone ? '#065F46' : 'var(--text-secondary)',
                    cursor: 'pointer'
                  }}
                >
                  Ref ({student.reference_name || 'Guardian'}): {student.reference_phone}
                </button>
              )}
            </div>
          </div>

          {/* Target Phone Input */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
              Recipient Mobile Number:
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 9876543210"
              style={{
                width: '100%',
                padding: '0.55rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-light)',
                backgroundColor: 'var(--bg-subtle)',
                fontSize: '0.88rem',
                color: 'var(--text-primary)',
                outline: 'none'
              }}
            />
          </div>

          {/* Message Textarea */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                Message Content ({selectedLang === 'te' ? 'తెలుగు' : 'English'}):
              </label>
              <button
                type="button"
                onClick={handleCopy}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                <span>{copied ? 'Copied!' : 'Copy Text'}</span>
              </button>
            </div>
            <textarea
              rows={9}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-light)',
                fontSize: '0.84rem',
                fontFamily: selectedLang === 'te' ? 'inherit' : 'monospace',
                backgroundColor: 'var(--bg-subtle)',
                color: 'var(--text-primary)',
                outline: 'none',
                resize: 'vertical',
                lineHeight: 1.5
              }}
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Close
          </button>
          <button
            type="button"
            onClick={handleLaunchWhatsApp}
            className="btn btn-whatsapp"
            style={{ fontWeight: 700, gap: '0.45rem' }}
          >
            <ExternalLink size={16} />
            <span>Launch WhatsApp Now</span>
          </button>
        </div>
      </div>
    </div>
  );
}
