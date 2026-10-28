import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const BrandingContext = createContext(null);

export function BrandingProvider({ children }) {
  const [branding, setBranding] = useState({
    institution_name: 'Navodaya Educational Academy',
    tagline: 'School & Colleges • Fee Management System',
    short_name: 'Navodaya',
    logo_url: '',
    primary_color: '#1E3A8A',
    accent_color: '#2563EB',
    support_phone: '+91 98494 60071',
    support_email: 'support@navodaya.edu',
    address: 'D.No: 12-4-5, Main Road, Tuni & Kakinada Campuses, Andhra Pradesh',
    receipt_header: 'NAVODAYA EDUCATIONAL ACADEMY - OFFICIAL FEE RECEIPT',
    receipt_footer: 'Thank you for your payment. This is a computer generated receipt.',
    current_academic_year: '2026-2027',
    smtp_host: 'smtp.gmail.com',
    smtp_port: 587,
    smtp_username: 'notifications@navodaya.edu',
    smtp_from_email: 'noreply@navodaya.edu',
    smtp_from_name: 'Navodaya Academy Administration',
    smtp_use_tls: true,
  });
  const [loading, setLoading] = useState(true);

  const loadBranding = async () => {
    try {
      const data = await api.getInstitutionSettings();
      if (data && data.institution_name) {
        setBranding(data);
        if (typeof document !== 'undefined') {
          document.title = `${data.institution_name} • Fee Management Portal`;
        }
      }
    } catch (e) {
      console.warn('Could not load institution settings, using defaults.', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof process !== 'undefined' && (process.env?.NODE_ENV === 'test' || process.env?.VITEST)) {
      setLoading(false);
      return;
    }
    loadBranding();
  }, []);

  const updateBranding = async (newSettings) => {
    const res = await api.updateInstitutionSettings(newSettings);
    if (res && res.settings) {
      setBranding(res.settings);
      if (typeof document !== 'undefined') {
        document.title = `${res.settings.institution_name} • Fee Management Portal`;
      }
    }
    return res;
  };

  return (
    <BrandingContext.Provider value={{ branding, updateBranding, refreshBranding: loadBranding, loading }}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  const ctx = useContext(BrandingContext);
  if (!ctx) {
    return {
      branding: {
        institution_name: 'Navodaya Educational Academy',
        tagline: 'School & Colleges • Fee Management System',
        short_name: 'Navodaya',
        primary_color: '#1E3A8A',
        accent_color: '#2563EB',
        support_phone: '+91 98494 60071',
        support_email: 'support@navodaya.edu',
        address: 'D.No: 12-4-5, Main Road, Tuni & Kakinada Campuses, Andhra Pradesh',
        receipt_header: 'NAVODAYA EDUCATIONAL ACADEMY - OFFICIAL FEE RECEIPT',
        receipt_footer: 'Thank you for your payment. This is a computer generated receipt.',
        current_academic_year: '2026-2027'
      },
      updateBranding: async () => {},
      refreshBranding: async () => {},
      loading: false
    };
  }
  return ctx;
}
