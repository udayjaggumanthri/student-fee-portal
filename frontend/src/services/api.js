const getApiBase = () => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // In browser, relative '/api' leverages Vite dev proxy and production reverse proxies
  if (typeof window !== 'undefined' && window.location) {
    return '/api';
  }
  return 'http://127.0.0.1:8000/api';
};

const API_BASE = getApiBase();

const extractErrorMessage = async (res, fallbackMsg) => {
  try {
    const err = await res.json();
    if (err && typeof err === 'object') {
      if (err.error) return err.error;
      if (err.detail) return err.detail;
      const entries = Object.entries(err);
      if (entries.length > 0) {
        return entries
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
          .join(' | ');
      }
    }
  } catch {
    // Ignore JSON parse failure
  }
  return fallbackMsg;
};

export const api = {
  // -------------------------------------------------------------
  // Analytics & KPIs
  // -------------------------------------------------------------
  async getKPIs(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/kpis/?${query}`);
    if (!res.ok) {
      throw new Error(await extractErrorMessage(res, 'Failed to fetch KPIs'));
    }
    return res.json();
  },

  // -------------------------------------------------------------
  // Batches
  // -------------------------------------------------------------
  async getBatches() {
    const res = await fetch(`${API_BASE}/batches/`);
    if (!res.ok) {
      throw new Error(await extractErrorMessage(res, 'Failed to fetch batches'));
    }
    return res.json();
  },

  async createBatch(batchData) {
    const res = await fetch(`${API_BASE}/batches/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(batchData),
    });
    if (!res.ok) {
      throw new Error(await extractErrorMessage(res, 'Failed to create batch'));
    }
    return res.json();
  },

  async updateBatch(batchId, batchData) {
    const res = await fetch(`${API_BASE}/batches/${batchId}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(batchData),
    });
    if (!res.ok) {
      throw new Error(await extractErrorMessage(res, 'Failed to update batch'));
    }
    return res.json();
  },

  async deleteBatch(batchId, force = false) {
    const res = await fetch(`${API_BASE}/batches/${batchId}/?force=${force}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      throw new Error(await extractErrorMessage(res, 'Failed to delete batch'));
    }
    return res.json().catch(() => ({ success: true }));
  },

  // -------------------------------------------------------------
  // Programs
  // -------------------------------------------------------------
  async getPrograms() {
    const res = await fetch(`${API_BASE}/programs/`);
    if (!res.ok) {
      throw new Error(await extractErrorMessage(res, 'Failed to fetch programs'));
    }
    return res.json();
  },

  async createProgram(programData) {
    const res = await fetch(`${API_BASE}/programs/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(programData),
    });
    if (!res.ok) {
      throw new Error(await extractErrorMessage(res, 'Failed to create program'));
    }
    return res.json();
  },

  async updateProgram(id, data) {
    const res = await fetch(`${API_BASE}/programs/${id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      throw new Error(await extractErrorMessage(res, 'Failed to update program'));
    }
    return res.json();
  },

  async deleteProgram(id) {
    const res = await fetch(`${API_BASE}/programs/${id}/`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      throw new Error(await extractErrorMessage(res, 'Failed to delete program'));
    }
    return true;
  },

  // -------------------------------------------------------------
  // Study Centers
  // -------------------------------------------------------------
  async getCenters() {
    const res = await fetch(`${API_BASE}/centers/`);
    if (!res.ok) {
      throw new Error(await extractErrorMessage(res, 'Failed to fetch centers'));
    }
    return res.json();
  },

  async createCenter(centerData) {
    const res = await fetch(`${API_BASE}/centers/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(centerData),
    });
    if (!res.ok) {
      throw new Error(await extractErrorMessage(res, 'Failed to create center'));
    }
    return res.json();
  },

  async updateCenter(id, data) {
    const res = await fetch(`${API_BASE}/centers/${id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      throw new Error(await extractErrorMessage(res, 'Failed to update center'));
    }
    return res.json();
  },

  async deleteCenter(id) {
    const res = await fetch(`${API_BASE}/centers/${id}/`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      throw new Error(await extractErrorMessage(res, 'Failed to delete center'));
    }
    return true;
  },

  // -------------------------------------------------------------
  // Students
  // -------------------------------------------------------------
  async getStudents(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/students/?${query}`);
    if (!res.ok) {
      throw new Error(await extractErrorMessage(res, 'Failed to fetch students'));
    }
    return res.json();
  },

  async getStudent(id, params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/students/${id}/?${query}`);
    if (!res.ok) {
      throw new Error(await extractErrorMessage(res, 'Failed to fetch student profile'));
    }
    return res.json();
  },

  async createStudent(studentData) {
    const res = await fetch(`${API_BASE}/students/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(studentData),
    });
    if (!res.ok) {
      throw new Error(await extractErrorMessage(res, 'Failed to enroll student'));
    }
    return res.json();
  },

  async updateStudent(studentId, data) {
    const res = await fetch(`${API_BASE}/students/${studentId}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      throw new Error(await extractErrorMessage(res, 'Failed to update student'));
    }
    return res.json();
  },

  async deleteStudent(studentId) {
    const res = await fetch(`${API_BASE}/students/${studentId}/`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      throw new Error(await extractErrorMessage(res, 'Failed to delete student'));
    }
    return res.json().catch(() => ({ success: true }));
  },

  // -------------------------------------------------------------
  // Payments
  // -------------------------------------------------------------
  async getPayments(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/payments/?${query}`);
    if (!res.ok) {
      throw new Error(await extractErrorMessage(res, 'Failed to fetch payments'));
    }
    return res.json();
  },

  async recordPayment(studentId, formData) {
    const isFormData = typeof FormData !== 'undefined' && formData instanceof FormData;
    const res = await fetch(`${API_BASE}/students/${studentId}/record_payment/`, {
      method: 'POST',
      headers: isFormData ? {} : { 'Content-Type': 'application/json' },
      body: isFormData ? formData : JSON.stringify(formData),
    });
    if (!res.ok) {
      throw new Error(await extractErrorMessage(res, 'Failed to record payment'));
    }
    return res.json();
  },

  async updatePayment(paymentId, data) {
    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
    const res = await fetch(`${API_BASE}/payments/${paymentId}/`, {
      method: 'PATCH',
      headers: isFormData ? {} : { 'Content-Type': 'application/json' },
      body: isFormData ? data : JSON.stringify(data),
    });
    if (!res.ok) {
      throw new Error(await extractErrorMessage(res, 'Failed to update payment'));
    }
    return res.json();
  },

  async deletePayment(paymentId) {
    const res = await fetch(`${API_BASE}/payments/${paymentId}/`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      throw new Error(await extractErrorMessage(res, 'Failed to delete payment'));
    }
    return res.json().catch(() => ({ success: true }));
  },

  // -------------------------------------------------------------
  // Fee Structure, Line Items & Academic Years
  // -------------------------------------------------------------
  async addLineItem(studentId, data) {
    const res = await fetch(`${API_BASE}/students/${studentId}/add_line_item/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      throw new Error(await extractErrorMessage(res, 'Failed to add line item'));
    }
    return res.json();
  },

  async updateLineItem(lineItemId, data) {
    const res = await fetch(`${API_BASE}/line-items/${lineItemId}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      throw new Error(await extractErrorMessage(res, 'Failed to update fee line item'));
    }
    return res.json();
  },

  async deleteLineItem(lineItemId) {
    const res = await fetch(`${API_BASE}/line-items/${lineItemId}/`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      throw new Error(await extractErrorMessage(res, 'Failed to delete fee line item'));
    }
    return res.json().catch(() => ({ success: true }));
  },

  async updateYearFee(yearFeeId, data) {
    const res = await fetch(`${API_BASE}/year-fees/${yearFeeId}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      throw new Error(await extractErrorMessage(res, 'Failed to update year fee'));
    }
    return res.json();
  },

  // -------------------------------------------------------------
  // WhatsApp Communication
  // -------------------------------------------------------------
  async getWhatsAppLink(studentId) {
    const res = await fetch(`${API_BASE}/students/${studentId}/whatsapp_link/`);
    if (!res.ok) {
      throw new Error(await extractErrorMessage(res, 'Failed to generate WhatsApp link'));
    }
    return res.json();
  },

  async getWhatsAppTemplates() {
    const res = await fetch(`${API_BASE}/whatsapp-templates/`);
    if (!res.ok) {
      throw new Error(await extractErrorMessage(res, 'Failed to fetch WhatsApp templates'));
    }
    return res.json();
  },

  // -------------------------------------------------------------
  // References / Agents
  // -------------------------------------------------------------
  async getReferences() {
    const res = await fetch(`${API_BASE}/references/`);
    if (!res.ok) {
      throw new Error(await extractErrorMessage(res, 'Failed to fetch references'));
    }
    return res.json();
  },

  async createReference(data) {
    const res = await fetch(`${API_BASE}/references/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      throw new Error(await extractErrorMessage(res, 'Failed to save reference person'));
    }
    return res.json();
  },

  async updateReference(referenceId, data) {
    const res = await fetch(`${API_BASE}/references/${referenceId}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      throw new Error(await extractErrorMessage(res, 'Failed to update reference person'));
    }
    return res.json();
  },

  async deleteReference(referenceId) {
    const res = await fetch(`${API_BASE}/references/${referenceId}/`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      throw new Error(await extractErrorMessage(res, 'Failed to delete reference person'));
    }
    return res.json().catch(() => ({ success: true }));
  },

  // -------------------------------------------------------------
  // Custom Fields
  // -------------------------------------------------------------
  async getCustomFields() {
    const res = await fetch(`${API_BASE}/custom-fields/`);
    if (!res.ok) {
      throw new Error(await extractErrorMessage(res, 'Failed to fetch custom fields'));
    }
    return res.json();
  },

  async addCustomField(fieldData) {
    const res = await fetch(`${API_BASE}/custom-fields/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fieldData),
    });
    if (!res.ok) {
      throw new Error(await extractErrorMessage(res, 'Failed to add custom field'));
    }
    return res.json();
  },

  // -------------------------------------------------------------
  // Staff Roles & User Profiles
  // -------------------------------------------------------------
  async getRoles() {
    const res = await fetch(`${API_BASE}/roles/`);
    if (!res.ok) {
      throw new Error(await extractErrorMessage(res, 'Failed to fetch user roles'));
    }
    return res.json();
  },

  async createStaff(data) {
    const res = await fetch(`${API_BASE}/roles/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      throw new Error(await extractErrorMessage(res, 'Failed to create staff user'));
    }
    return res.json();
  },

  async updateStaff(id, data) {
    const res = await fetch(`${API_BASE}/roles/${id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      throw new Error(await extractErrorMessage(res, 'Failed to update staff user'));
    }
    return res.json();
  },

  async deleteStaff(id) {
    const res = await fetch(`${API_BASE}/roles/${id}/`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      throw new Error(await extractErrorMessage(res, 'Failed to delete staff user'));
    }
    return true;
  },

  async getMyProfile() {
    const res = await fetch(`${API_BASE}/roles/me/`);
    if (!res.ok) {
      throw new Error(await extractErrorMessage(res, 'Failed to fetch current user profile'));
    }
    return res.json();
  },

  async updateMyProfile(data) {
    const res = await fetch(`${API_BASE}/roles/me/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      throw new Error(await extractErrorMessage(res, 'Failed to update profile'));
    }
    return res.json();
  },

  // -------------------------------------------------------------
  // White-label Institution Settings & SMTP
  // -------------------------------------------------------------
  async getInstitutionSettings() {
    const res = await fetch(`${API_BASE}/settings/institution/`);
    if (!res.ok) {
      throw new Error(await extractErrorMessage(res, 'Failed to fetch institution settings'));
    }
    return res.json();
  },

  async updateInstitutionSettings(data) {
    const res = await fetch(`${API_BASE}/settings/institution/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      throw new Error(await extractErrorMessage(res, 'Failed to update institution settings'));
    }
    return res.json();
  },

  async testSMTPEmail(data) {
    const res = await fetch(`${API_BASE}/settings/test-smtp/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      throw new Error(await extractErrorMessage(res, 'Failed to test SMTP email configuration'));
    }
    return res.json();
  },

  // -------------------------------------------------------------
  // Authentication & Password Recovery
  // -------------------------------------------------------------
  async forgotPassword(email) {
    const res = await fetch(`${API_BASE}/auth/forgot-password/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      throw new Error(await extractErrorMessage(res, 'Failed to send password reset code'));
    }
    return res.json();
  },

  async resetPassword(data) {
    const res = await fetch(`${API_BASE}/auth/reset-password/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      throw new Error(await extractErrorMessage(res, 'Failed to reset password'));
    }
    return res.json();
  },

  // -------------------------------------------------------------
  // Data Import & Excel Export
  // -------------------------------------------------------------
  async ingestResources() {
    const res = await fetch(`${API_BASE}/ingest-resources/`, {
      method: 'POST',
    });
    if (!res.ok) {
      throw new Error(await extractErrorMessage(res, 'Failed to ingest resources'));
    }
    return res.json();
  },

  getExportExcelUrl(params = {}) {
    const query = new URLSearchParams(params).toString();
    return `${API_BASE}/export-excel/?${query}`;
  },
};
