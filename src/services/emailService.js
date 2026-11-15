import emailjs from '@emailjs/browser';

const STORAGE_KEY_PREFS = 'carecircle_email_preferences';
const STORAGE_KEY_HISTORY = 'carecircle_email_history';

// Default preferences
const DEFAULT_PREFERENCES = {
  enabled: true,
  recipientEmail: '',
  upcomingMeds: true,
  missedDoses: true,
  upcomingAppointments: true,
  dailyDigest: false
};

// Safe credentials getter
export const getEmailConfig = () => {
  const serviceId =
    import.meta.env.VITE_EMAILJS_SERVICE_ID ||
    localStorage.getItem('emailjs_service_id') ||
    '';
  const templateId =
    import.meta.env.VITE_EMAILJS_TEMPLATE_ID ||
    localStorage.getItem('emailjs_template_id') ||
    '';
  const publicKey =
    import.meta.env.VITE_EMAILJS_PUBLIC_KEY ||
    localStorage.getItem('emailjs_public_key') ||
    '';

  return {
    serviceId: serviceId.trim(),
    templateId: templateId.trim(),
    publicKey: publicKey.trim(),
    isConfigured: Boolean(serviceId.trim() && publicKey.trim())
  };
};

/**
 * Saves custom EmailJS credentials to local storage for testing in dev.
 */
export const saveEmailConfig = ({ serviceId, templateId, publicKey }) => {
  if (serviceId) localStorage.setItem('emailjs_service_id', serviceId.trim());
  if (templateId) localStorage.setItem('emailjs_template_id', templateId.trim());
  if (publicKey) localStorage.setItem('emailjs_public_key', publicKey.trim());
};

/**
 * Core send handler that guarantees no false delivery claims.
 */
const sendEmail = async ({ type, subject, templateParams, toEmail }) => {
  const config = getEmailConfig();
  const timestamp = new Date().toISOString();
  const historyItem = {
    id: `email-${Date.now()}`,
    type,
    subject,
    recipientEmail: toEmail || templateParams.to_email || templateParams.email || 'Recipient',
    sentAt: timestamp,
    status: 'failed',
    error: null
  };

  // 1. Guard: If credentials are not configured, reject immediately
  if (!config.isConfigured) {
    const errorMsg = 'EmailJS not configured. Please supply VITE_EMAILJS_SERVICE_ID and VITE_EMAILJS_PUBLIC_KEY in .env or Settings.';
    historyItem.status = 'failed';
    historyItem.error = errorMsg;
    recordEmailHistory(historyItem);
    return {
      success: false,
      status: 'unconfigured',
      error: errorMsg,
      historyItem
    };
  }

  // 2. Transmit via EmailJS SDK / API
  try {
    const targetTemplateId = config.templateId || 'template_carecircle';

    // Call official EmailJS client
    const response = await emailjs.send(
      config.serviceId,
      targetTemplateId,
      {
        ...templateParams,
        to_email: toEmail || templateParams.to_email,
        subject,
        sent_at: timestamp
      },
      config.publicKey
    );

    // 3. Verify exact response from EmailJS (must be 200 / OK)
    if (response && (response.status === 200 || response.text === 'OK')) {
      historyItem.status = 'delivered';
      historyItem.error = null;
      recordEmailHistory(historyItem);
      return {
        success: true,
        status: 'delivered',
        response,
        historyItem
      };
    } else {
      throw new Error(`EmailJS responded with status ${response?.status || 'Unknown'}`);
    }
  } catch (err) {
    console.error('EmailJS delivery error:', err);
    historyItem.status = 'failed';
    historyItem.error = err.text || err.message || 'Transmission failed to EmailJS server.';
    recordEmailHistory(historyItem);
    return {
      success: false,
      status: 'failed',
      error: historyItem.error,
      historyItem
    };
  }
};

/**
 * Audit log persistence for delivery statuses and failures
 */
const recordEmailHistory = (item) => {
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY_HISTORY) || '[]');
    existing.unshift(item);
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(existing.slice(0, 50)));
  } catch (err) {
    console.warn('Could not store email history:', err);
  }
};

export const emailService = {
  /**
   * Check if EmailJS environment variables are set
   */
  isConfigured() {
    return getEmailConfig().isConfigured;
  },

  /**
   * 1. Send Test Email
   * Clearly identified with [TEST EMAIL] tag
   */
  async sendTestEmail({ toEmail, toName = 'Caregiver' }) {
    return sendEmail({
      type: 'test',
      subject: '[TEST EMAIL] CareCircle Notification System Check',
      toEmail,
      templateParams: {
        to_name: toName,
        to_email: toEmail,
        email_type: 'TEST EMAIL (Verification)',
        headline: 'CareCircle Email Integration Verified',
        message: 'This is a test notification confirming that your EmailJS integration and notification preferences are active. No medical action is required.',
        action_note: 'Verified transmission via CareCircle Hackathon MVP Platform.'
      }
    });
  },

  /**
   * 2. Send Upcoming Medication Reminder
   */
  async sendUpcomingMedicationReminder({
    toEmail,
    toName = 'Caregiver',
    patientName,
    medicationName,
    dosage,
    scheduledTime,
    timeSlot = 'Morning',
    instructions = 'Take as prescribed'
  }) {
    return sendEmail({
      type: 'upcoming_medication',
      subject: `[UPCOMING MEDICATION] Dose Reminder: ${medicationName} (${scheduledTime})`,
      toEmail,
      templateParams: {
        to_name: toName,
        to_email: toEmail,
        patient_name: patientName,
        email_type: 'UPCOMING MEDICATION REMINDER',
        headline: `Scheduled Dose for ${patientName}`,
        message: `${medicationName} ${dosage} is scheduled for ${timeSlot} at ${scheduledTime}.`,
        instructions,
        action_note: 'Please verify dose administration in the CareCircle Medication Schedule.'
      }
    });
  },

  /**
   * 3. Send Missed Medication Notification (High Priority)
   */
  async sendMissedMedicationAlert({
    toEmail,
    toName = 'Caregiver',
    patientName,
    medicationName,
    dosage,
    scheduledTime,
    instructions
  }) {
    return sendEmail({
      type: 'missed_medication',
      subject: `[MISSED DOSE ALERT] ${medicationName} Flagged Missed for ${patientName}`,
      toEmail,
      templateParams: {
        to_name: toName,
        to_email: toEmail,
        patient_name: patientName,
        email_type: 'CRITICAL: MISSED DOSE ALERT',
        headline: `Action Required: Missed Dose for ${patientName}`,
        message: `${patientName} did not record administration of ${medicationName} ${dosage} (scheduled for ${scheduledTime}).`,
        instructions: instructions || 'Check on the patient or contact the attending clinician if dose was skipped intentionally.',
        action_note: 'Log into CareCircle to mark the dose or review patient vitals.'
      }
    });
  },

  /**
   * 4. Send Upcoming Doctor Appointment Reminder
   */
  async sendUpcomingAppointmentReminder({
    toEmail,
    toName = 'Caregiver',
    patientName,
    doctorName,
    specialty,
    date,
    time,
    facility,
    notes
  }) {
    return sendEmail({
      type: 'appointment_reminder',
      subject: `[DOCTOR APPOINTMENT] Upcoming Visit: ${doctorName} on ${date}`,
      toEmail,
      templateParams: {
        to_name: toName,
        to_email: toEmail,
        patient_name: patientName,
        email_type: 'DOCTOR APPOINTMENT REMINDER',
        headline: `Clinical Consultation Scheduled for ${patientName}`,
        message: `Appointment with ${doctorName} (${specialty}) is scheduled for ${date} at ${time}.`,
        facility: facility || 'Medical Clinic',
        prep_notes: notes || 'Bring current blood pressure logs and list of active medications.',
        action_note: 'Check transportation arrangements and arrive 15 minutes early.'
      }
    });
  },

  /**
   * 5. Get and Save Email Preferences
   */
  getPreferences() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PREFS);
      return stored ? { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) } : DEFAULT_PREFERENCES;
    } catch {
      return DEFAULT_PREFERENCES;
    }
  },

  savePreferences(prefs) {
    try {
      localStorage.setItem(STORAGE_KEY_PREFS, JSON.stringify(prefs));
    } catch (err) {
      console.warn('Could not save email preferences:', err);
    }
  },

  /**
   * 6. Get Audit Log History of Delivered & Failed Emails
   */
  getHistory() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY_HISTORY) || '[]');
    } catch {
      return [];
    }
  },

  clearHistory() {
    try {
      localStorage.removeItem(STORAGE_KEY_HISTORY);
    } catch (err) {
      console.warn('Could not clear history:', err);
    }
  }
};

export default emailService;
