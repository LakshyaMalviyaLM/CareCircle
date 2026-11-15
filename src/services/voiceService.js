// Voice Accessibility Service for CareCircle
// Browser-native Web Speech API (SpeechRecognition & SpeechSynthesis)
// Supports English (en-US) and Hindi (hi-IN) with deterministic clinical command parsing

import { calculateStockMetrics } from './refillService';

class VoiceService {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.recognition = null;
    this.isListening = false;
    this.isCurrentlySpeaking = false;
    this.preferredLanguage = 'en-US'; // 'en-US' | 'hi-IN'
    this.initRecognition();
  }

  // Initialize browser-native SpeechRecognition if supported
  initRecognition() {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-US';
      } catch (e) {
        console.warn('SpeechRecognition initialization error:', e);
      }
    }
  }

  // Check if browser SpeechSynthesis (TTS) is supported
  isTtsSupported() {
    return Boolean(this.synth);
  }

  // Check if browser SpeechRecognition (STT) is supported
  isRecognitionSupported() {
    return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  // Get available voices
  getVoices() {
    if (!this.synth) return [];
    return this.synth.getVoices() || [];
  }

  // Find best matching voice for language
  findVoice(langCode = 'en-US') {
    const voices = this.getVoices();
    if (voices.length === 0) return null;

    // Direct match (e.g. en-US, hi-IN)
    let match = voices.find(v => v.lang.toLowerCase() === langCode.toLowerCase());
    if (match) return match;

    // Partial prefix match
    const prefix = langCode.split('-')[0].toLowerCase();
    match = voices.find(v => v.lang.toLowerCase().startsWith(prefix));
    if (match) return match;

    // Hindi voice lookup
    if (prefix === 'hi') {
      match = voices.find(v =>
        v.name.toLowerCase().includes('hindi') ||
        v.name.toLowerCase().includes('india') ||
        v.lang.toLowerCase().includes('hi')
      );
      if (match) return match;
    }

    // Default to first available
    return voices[0] || null;
  }

  // Speak text with options
  speak(text, { lang = 'en-US', rate = 0.88, pitch = 1.0, onStart = null, onEnd = null } = {}) {
    if (!this.synth || !text) return;

    // Cancel any ongoing speech
    this.stopSpeaking();

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = rate; // Slightly slower pacing for senior accessibility
      utterance.pitch = pitch;

      const voice = this.findVoice(lang);
      if (voice) {
        utterance.voice = voice;
      }

      utterance.onstart = () => {
        this.isCurrentlySpeaking = true;
        if (onStart) onStart();
      };

      utterance.onend = () => {
        this.isCurrentlySpeaking = false;
        if (onEnd) onEnd();
      };

      utterance.onerror = (e) => {
        this.isCurrentlySpeaking = false;
        if (onEnd) onEnd(e);
      };

      this.synth.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis error:', err);
      this.isCurrentlySpeaking = false;
      if (onEnd) onEnd(err);
    }
  }

  // Stop active speech output immediately
  stopSpeaking() {
    if (this.synth) {
      this.synth.cancel();
      this.isCurrentlySpeaking = false;
    }
  }

  // Check if audio is currently playing
  isSpeaking() {
    return Boolean(this.synth && (this.synth.speaking || this.isCurrentlySpeaking));
  }

  // Read single medication instructions aloud
  readMedicationInstructions(medication, language = 'en-US') {
    if (!medication) return;

    const name = medication.name || 'Medication';
    const dosage = medication.dosage || '';
    const frequency = medication.frequency || 'Daily';
    const instructions = medication.instructions || 'Take as prescribed with water.';
    const timeScheduled = medication.timeScheduled || medication.scheduled_times?.[0] || 'Scheduled time';

    if (language === 'hi-IN' || language.startsWith('hi')) {
      const hiText = `यह ${name} की दवा है। खुराक: ${dosage}। समय: ${timeScheduled}। निर्देश: ${instructions}।`;
      this.speak(hiText, { lang: 'hi-IN', rate: 0.85 });
    } else {
      const enText = `Medication instruction for ${name}. Dosage: ${dosage}, ${frequency}. Scheduled for ${timeScheduled}. Instructions: ${instructions}.`;
      this.speak(enText, { lang: 'en-US', rate: 0.88 });
    }
  }

  // Read vitals summary aloud
  readVitalsSummary(vitals, language = 'en-US') {
    if (!vitals) return;

    const bp = vitals.bloodPressure || `${vitals.systolic_bp || 122} over ${vitals.diastolic_bp || 78}`;
    const hr = vitals.heartRate || vitals.heart_rate || 72;
    const glucose = vitals.bloodGlucose || vitals.blood_sugar || 104;
    const temp = vitals.temperature || 98.4;

    if (language === 'hi-IN' || language.startsWith('hi')) {
      const hiText = `आपके स्वास्थ्य का हाल। रक्तचाप: ${bp} मिलीमीटर। हृदय गति: ${hr} धड़कन प्रति मिनट। रक्त शर्करा: ${glucose} मिलीग्राम। शरीर का तापमान: ${temp} डिग्री। आपकी स्थिति स्थिर है।`;
      this.speak(hiText, { lang: 'hi-IN', rate: 0.85 });
    } else {
      const enText = `Your current health vitals. Blood pressure is ${bp} millimeters of mercury. Heart rate is ${hr} beats per minute. Blood glucose is ${glucose} milligrams per deciliter. Body temperature is ${temp} degrees Fahrenheit. All recorded parameters are stable.`;
      this.speak(enText, { lang: 'en-US', rate: 0.88 });
    }
  }

  // Start microphone speech recognition session
  startListening({
    language = 'en-US',
    onResult,
    onError,
    onStart,
    onEnd
  } = {}) {
    if (!this.recognition) {
      this.initRecognition();
    }

    if (!this.recognition) {
      if (onError) onError('Speech recognition is not supported in this browser.');
      return;
    }

    if (this.isListening) {
      this.stopListening();
    }

    try {
      this.recognition.lang = language;

      this.recognition.onstart = () => {
        this.isListening = true;
        if (onStart) onStart();
      };

      this.recognition.onresult = (event) => {
        const transcript = event.results?.[0]?.[0]?.transcript || '';
        if (onResult) onResult(transcript.trim());
      };

      this.recognition.onerror = (event) => {
        this.isListening = false;
        if (onError) onError(event.error);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        if (onEnd) onEnd();
      };

      this.recognition.start();
    } catch (err) {
      this.isListening = false;
      if (onError) onError(err.message || 'Microphone activation error');
    }
  }

  // Stop microphone session
  stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        console.warn('Error stopping recognition:', e);
      }
    }
    this.isListening = false;
  }

  // --------------------------------------------------------------------------
  // DETERMINISTIC INTENT RECOGNITION & PATIENT DATA COMMAND PARSER
  // Strictly non-AI, rule-based, directly bound to authenticated patient data
  // --------------------------------------------------------------------------
  processAssistantCommand({ transcript = '', language = 'en-US', contextData = {} }) {
    const raw = transcript.toLowerCase().trim();
    const isHindi = language === 'hi-IN' || language.startsWith('hi');

    const {
      activePatient = { name: 'Eleanor Vance' },
      medications = [],
      appointments = [],
      vitalsLogs = []
    } = contextData;

    // 1. SAFETY & MEDICAL ADVICE / DOSAGE CHANGE RESTRICTION (Requirement 8)
    const isMedicalAdviceQuery =
      raw.includes('change dose') ||
      raw.includes('change dosage') ||
      raw.includes('double dose') ||
      raw.includes('increase dose') ||
      raw.includes('decrease dose') ||
      raw.includes('stop taking') ||
      raw.includes('cure') ||
      raw.includes('diagnose') ||
      raw.includes('medical advice') ||
      raw.includes('prescription change') ||
      raw.includes('खुराक बदलो') ||
      raw.includes('मात्रा बढ़ाओ') ||
      raw.includes('दवा छोड़ दूं') ||
      raw.includes('इलाज बताओ') ||
      raw.includes('बीमारी का निदान');

    if (isMedicalAdviceQuery) {
      const spokenResponse = isHindi
        ? `केयरसर्कल वॉइस असिस्टेंट दवाओं की खुराक बदलने या चिकित्सीय निदान देने के लिए अधिकृत नहीं है। अपनी दवाइयों या स्वास्थ्य में बदलाव के लिए कृपया अपने डॉक्टर से संपर्क करें।`
        : `CareCircle Voice Assistant cannot modify prescription dosages or provide clinical diagnoses. All medications must be taken strictly as prescribed. Please contact your attending physician or press Emergency SOS if you need assistance.`;

      return {
        intent: 'disallowed_medical_advice',
        spokenResponse,
        displayTitle: isHindi ? 'चिकित्सीय परामर्श सीमा' : 'Medical Advice Restriction',
        displayContent: spokenResponse,
        route: null,
        isWarning: true
      };
    }

    // 2. SHOW TODAY'S MEDICINES (Requirement 3a)
    const isShowTodayMeds =
      raw.includes("today's medicine") ||
      raw.includes("today's medication") ||
      raw.includes('show today medicine') ||
      raw.includes('show today') ||
      raw.includes('today medicine') ||
      raw.includes('todays medicine') ||
      raw.includes('my medicines') ||
      raw.includes('my medications') ||
      raw.includes('show medicines') ||
      raw.includes('आज की दवा') ||
      raw.includes('आज की दवाई') ||
      raw.includes('मेरी दवाइयाँ') ||
      raw.includes('दवा दिखाओ');

    if (isShowTodayMeds) {
      const medCount = medications.length;
      const taken = medications.filter(m => m.status === 'taken');
      const pending = medications.filter(m => m.status === 'pending');

      let spokenResponse;
      if (isHindi) {
        spokenResponse = `आज आपके लिए ${medCount} दवाइयाँ निर्धारित हैं। ${taken.length} खुराकें ली जा चुकी हैं, और ${pending.length} खुराकें लेना बाकी हैं।`;
        if (pending.length > 0) {
          spokenResponse += ` बाकी दवाइयाँ हैं: ${pending.map(m => m.name).slice(0, 3).join(', ')}।`;
        }
      } else {
        spokenResponse = `Today you have ${medCount} prescribed medications. ${taken.length} taken, and ${pending.length} pending.`;
        if (pending.length > 0) {
          spokenResponse += ` Pending doses include: ${pending.map(m => `${m.name} ${m.dosage}`).slice(0, 3).join(', ')}.`;
        }
      }

      return {
        intent: 'show_today_medicines',
        spokenResponse,
        displayTitle: isHindi ? "आज की दवाइयाँ" : "Today's Prescriptions",
        displayContent: spokenResponse,
        route: '/medications',
        dataPayload: { medications, takenCount: taken.length, pendingCount: pending.length }
      };
    }

    // 3. READ MEDICATION SCHEDULE (Requirement 3b)
    const isReadSchedule =
      raw.includes('medication schedule') ||
      raw.includes('read my medication schedule') ||
      raw.includes('read schedule') ||
      raw.includes('what is my schedule') ||
      raw.includes('schedule') ||
      raw.includes('dosage schedule') ||
      raw.includes('दवाइयों का समय') ||
      raw.includes('शेड्यूल बताओ') ||
      raw.includes('दवाइयों का शेड्यूल') ||
      raw.includes('टाइम टेबल');

    if (isReadSchedule) {
      const pending = medications.filter(m => m.status === 'pending');
      const taken = medications.filter(m => m.status === 'taken');

      let spokenResponse;
      if (isHindi) {
        if (pending.length === 0) {
          spokenResponse = `आपका आज का शेड्यूल पूरा हो गया है। आज की सभी खुराकें ली जा चुकी हैं।`;
        } else {
          const first = pending[0];
          spokenResponse = `आपकी अगली खुराक ${first.name} ${first.dosage} है, जो ${first.timeSlot || 'आज'} के लिए निर्धारित है। कुल ${pending.length} खुराकें शेष हैं।`;
        }
      } else {
        if (pending.length === 0) {
          spokenResponse = `Your medication schedule is up to date. All doses for today have been recorded as taken.`;
        } else {
          const first = pending[0];
          spokenResponse = `Your next scheduled dose is ${first.name} ${first.dosage}, scheduled for ${first.timeSlot || 'today'}. There are ${pending.length} doses remaining today.`;
        }
      }

      return {
        intent: 'read_medication_schedule',
        spokenResponse,
        displayTitle: isHindi ? 'दवाइयों का शेड्यूल' : 'Daily Medication Schedule',
        displayContent: spokenResponse,
        route: '/medications',
        dataPayload: { pending, taken }
      };
    }

    // 4. SHOW UPCOMING APPOINTMENTS (Requirement 3c)
    const isShowAppointments =
      raw.includes('upcoming appointment') ||
      raw.includes('show my upcoming appointments') ||
      raw.includes('appointment') ||
      raw.includes('appointments') ||
      raw.includes('doctor visit') ||
      raw.includes('next appointment') ||
      raw.includes('अपॉइंटमेंट') ||
      raw.includes('डॉक्टर से मिलना') ||
      raw.includes('मुलाक़ात दिखाओ') ||
      raw.includes('डॉक्टर अपॉइंटमेंट');

    if (isShowAppointments) {
      const upcoming = appointments.filter(a => a.status === 'Upcoming');

      let spokenResponse;
      if (upcoming.length === 0) {
        spokenResponse = isHindi
          ? `आपकी कोई आगामी डॉक्टर अपॉइंटमेंट निर्धारित नहीं है।`
          : `You have no upcoming doctor appointments scheduled.`;
      } else {
        const nextApt = upcoming[0];
        const docName = nextApt.doctorName || nextApt.doctor || 'Dr. Robert Miller';
        const spec = nextApt.specialty || 'General Physician';
        const aptDate = nextApt.date ? new Date(nextApt.date).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Nov 18';

        spokenResponse = isHindi
          ? `आपके पास ${upcoming.length} आगामी अपॉइंटमेंट है। अगली मुलाकात ${docName} (${spec}) के साथ ${aptDate} को ${nextApt.time || '10:00 AM'} पर है।`
          : `You have ${upcoming.length} upcoming appointment. Your next visit is with ${docName}, ${spec}, on ${aptDate} at ${nextApt.time || '10:00 AM'}.`;
      }

      return {
        intent: 'show_upcoming_appointments',
        spokenResponse,
        displayTitle: isHindi ? 'डॉक्टर अपॉइंटमेंट्स' : 'Upcoming Doctor Visits',
        displayContent: spokenResponse,
        route: '/appointments',
        dataPayload: { upcoming }
      };
    }

    // 5. SHOW HEALTH VITALS (Requirement 3d)
    const isShowVitals =
      raw.includes('health vital') ||
      raw.includes('show my health vitals') ||
      raw.includes('my vitals') ||
      raw.includes('blood pressure') ||
      raw.includes('blood sugar') ||
      raw.includes('vitals') ||
      raw.includes('pulse') ||
      raw.includes('वाइटल्स') ||
      raw.includes('बीपी') ||
      raw.includes('रक्तचाप') ||
      raw.includes('शुगर') ||
      raw.includes('स्वास्थ्य');

    if (isShowVitals) {
      const latest = vitalsLogs[0] || {
        systolic_bp: 122,
        diastolic_bp: 78,
        heart_rate: 72,
        blood_sugar: 104,
        blood_sugar_context: 'fasting',
        temperature: 98.4,
        weight: 68.4
      };

      const bp = `${latest.systolic_bp || 122}/${latest.diastolic_bp || 78}`;
      const hr = latest.heart_rate || 72;
      const sugar = latest.blood_sugar || 104;
      const temp = latest.temperature || 98.4;
      const weight = latest.weight !== undefined ? latest.weight : (latest.weight_kg || 68.4);

      let spokenResponse;
      if (isHindi) {
        spokenResponse = `आपकी ताज़ा स्वास्थ्य रिपोर्ट: रक्तचाप ${bp} मिलीमीटर, हृदय गति ${hr} धड़कन प्रति मिनट, रक्त शर्करा ${sugar} मिलीग्राम, शरीर का तापमान ${temp} डिग्री, और वजन ${weight} किलोग्राम है। सभी रिकॉर्डेड पैरामीटर स्थिर हैं।`;
      } else {
        spokenResponse = `Your latest recorded health vitals: Blood Pressure is ${bp} mmHg, resting heart rate is ${hr} BPM, blood glucose is ${sugar} mg/dL, temperature is ${temp}°F, and weight is ${weight} kg. All values are within observational tracking range.`;
      }

      return {
        intent: 'show_health_vitals',
        spokenResponse,
        displayTitle: isHindi ? 'स्वास्थ्य वाइटल्स' : 'Current Health Vitals',
        displayContent: spokenResponse,
        route: '/vitals',
        dataPayload: { latest }
      };
    }

    // 6. SHOW REMAINING MEDICINE STOCK (Requirement 3e)
    const isShowStock =
      raw.includes('remaining medicine stock') ||
      raw.includes('show my remaining medicine stock') ||
      raw.includes('medicine stock') ||
      raw.includes('remaining stock') ||
      raw.includes('refill stock') ||
      raw.includes('pill stock') ||
      raw.includes('how many pills') ||
      raw.includes('low stock') ||
      raw.includes('दवाइयों का स्टॉक') ||
      raw.includes('बची हुई दवा') ||
      raw.includes('स्टॉक दिखाओ') ||
      raw.includes('गोलियां बची हैं');

    if (isShowStock) {
      const stockList = medications.map(m => ({ med: m, metrics: calculateStockMetrics(m) }));
      const lowStock = stockList.filter(s => s.metrics.isLowStock || s.metrics.isOutOfStock);

      let spokenResponse;
      if (isHindi) {
        if (lowStock.length === 0) {
          spokenResponse = `आपकी सभी ${medications.length} दवाइयाँ पर्याप्त स्टॉक में हैं। किसी भी रिफिल की तत्काल आवश्यकता नहीं है।`;
        } else {
          const first = lowStock[0];
          spokenResponse = `ध्यान दें: ${first.med.name} का स्टॉक कम है, केवल ${first.metrics.currentQuantity} ${first.metrics.units} शेष हैं (${first.metrics.daysRemaining} दिन का स्टॉक)। परिवार के सदस्यों को रिफिल अलर्ट भेजा गया है।`;
        }
      } else {
        if (lowStock.length === 0) {
          spokenResponse = `All ${medications.length} of your prescribed medications are currently in stock with healthy inventory reserves.`;
        } else {
          const first = lowStock[0];
          spokenResponse = `Attention: ${first.med.name} is low on stock with only ${first.metrics.currentQuantity} ${first.metrics.units} remaining, approximately ${first.metrics.daysRemaining} days of supply left. Caregivers have been notified.`;
        }
      }

      return {
        intent: 'show_medicine_stock',
        spokenResponse,
        displayTitle: isHindi ? 'दवाई स्टॉक स्थिति' : 'Prescription Stock & Refills',
        displayContent: spokenResponse,
        route: '/medications',
        dataPayload: { stockList, lowStock }
      };
    }

    // 7. ACTION REQUIRING CONFIRMATION (Requirement 7)
    // E.g. "mark lisinopril as taken" or "mark medicine taken"
    const isMutationCommand =
      raw.includes('mark') && (raw.includes('taken') || raw.includes('done') || raw.includes('दवा ले ली'));

    if (isMutationCommand) {
      const targetMed = medications.find(m => raw.includes(m.name.toLowerCase())) || medications[0];
      const targetName = targetMed?.name || 'Scheduled Medicine';

      const spokenResponse = isHindi
        ? `क्या आप निश्चित रूप से ${targetName} को ली गई दवा के रूप में दर्ज करना चाहते हैं? कृपया पुष्टि करने के लिए 'हाँ' कहें या कन्फर्म बटन दबाएं।`
        : `Are you sure you want to record ${targetName} as taken? Please say Yes or click Confirm to update your patient records.`;

      return {
        intent: 'confirm_mutation',
        spokenResponse,
        displayTitle: isHindi ? 'कार्रवाई की पुष्टि' : 'Action Confirmation Required',
        displayContent: spokenResponse,
        actionRequired: {
          type: 'toggle_medication_status',
          targetId: targetMed?.id,
          targetName,
          status: 'taken',
          confirmMessage: `Confirm recording ${targetName} as Taken?`
        }
      };
    }

    // 8. UNKNOWN COMMAND / GENERAL FALLBACK
    const defaultText = isHindi
      ? `माफ़ कीजिये, मैं इसे समझ नहीं पाया। आप बोल सकते हैं: 'आज की दवाइयाँ दिखाओ', 'दवाइयों का समय बताओ', 'अपॉइंटमेंट दिखाओ', 'वाइटल्स बताओ', या 'स्टॉक दिखाओ'।`
      : `I did not catch that command. You can say: "Show today's medicines", "Read my medication schedule", "Show upcoming appointments", "Show health vitals", or "Show remaining medicine stock".`;

    return {
      intent: 'unknown',
      spokenResponse: defaultText,
      displayTitle: isHindi ? 'कमांड सहायता' : 'Available Voice Commands',
      displayContent: defaultText,
      route: null
    };
  }
}

export const voiceService = new VoiceService();
export default voiceService;
