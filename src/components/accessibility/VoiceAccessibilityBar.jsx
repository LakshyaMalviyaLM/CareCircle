import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Volume2,
  Mic,
  X,
  Sparkles,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { useCare } from '../../context/CareContext';
import voiceService from '../../services/voiceService';
import VoiceAssistantModal from './VoiceAssistantModal';

export default function VoiceAccessibilityBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    preferredLanguage,
    setPreferredLanguage,
    isLargeText,
    setIsLargeText,
    activePatient,
    medications,
    appointments,
    vitalsLogs
  } = useCare();

  const [isExpanded, setIsExpanded] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcriptNotice, setTranscriptNotice] = useState('');
  const [isAssistantModalOpen, setIsAssistantModalOpen] = useState(false);

  // Toggle Voice-based Navigation
  const handleToggleVoiceNav = () => {
    if (isListening) {
      voiceService.stopVoiceNavigation();
      setIsListening(false);
      setTranscriptNotice('');
      return;
    }

    if (!voiceService.isRecognitionSupported()) {
      setTranscriptNotice('Speech recognition not available on this browser.');
      setTimeout(() => setTranscriptNotice(''), 4000);
      return;
    }

    setTranscriptNotice('Listening... Say: "Dashboard", "Medications", "Vitals", "Doctor", "SOS"');

    voiceService.startVoiceNavigation({
      language: preferredLanguage === 'hi-IN' ? 'hi-IN' : 'en-US',
      onListeningChange: (status) => setIsListening(status),
      onCommand: (route, recognizedText) => {
        if (route) {
          setTranscriptNotice(`Heard: "${recognizedText}" ➔ Navigating...`);
          const confirmText =
            preferredLanguage === 'hi-IN'
              ? `${recognizedText} पर ले जा रहे हैं`
              : `Navigating to ${recognizedText}`;
          voiceService.speak(confirmText, { lang: preferredLanguage, rate: 0.95 });
          setTimeout(() => {
            navigate(route);
            setTranscriptNotice('');
          }, 800);
        } else {
          setTranscriptNotice(`Heard: "${recognizedText}". Try saying "Vitals" or "Medications".`);
          setTimeout(() => setTranscriptNotice(''), 4000);
        }
      },
      onError: (err) => {
        setTranscriptNotice(`Mic error: ${err}`);
        setIsListening(false);
        setTimeout(() => setTranscriptNotice(''), 4000);
      }
    });
  };

  // Read current screen overview aloud
  const handleReadCurrentScreen = () => {
    const path = location.pathname;
    let spokenText;

    if (path === '/' || path === '/overview') {
      const pendingMeds = medications.filter((m) => m.status === 'pending').length;
      if (preferredLanguage === 'hi-IN') {
        spokenText = `नमस्ते। आप मुख्य डैशबोर्ड पर हैं। ${activePatient.name} के आज ${pendingMeds} दवाइयां लेना बाकी हैं।`;
      } else {
        spokenText = `Hello. You are on the main dashboard for ${activePatient.name}. There are ${pendingMeds} medication doses pending today.`;
      }
    } else if (path === '/medications') {
      const pendingMeds = medications.filter((m) => m.status === 'pending').length;
      if (preferredLanguage === 'hi-IN') {
        spokenText = `दवाई प्रबंधन पृष्ठ। कुल ${medications.length} दवाएं हैं और ${pendingMeds} खुराकें बाकी हैं।`;
      } else {
        spokenText = `Medication management page. You have ${medications.length} active prescriptions and ${pendingMeds} doses scheduled today.`;
      }
    } else if (path === '/vitals') {
      const latest = vitalsLogs[0] || {};
      if (preferredLanguage === 'hi-IN') {
        spokenText = `स्वास्थ्य विटल्स पृष्ठ। रक्तचाप ${latest.systolic_bp || 120} बटे ${latest.diastolic_bp || 80} और पल्स ${latest.heart_rate || 72} है।`;
      } else {
        spokenText = `Health vitals page. Latest blood pressure is ${latest.systolic_bp || 120} over ${latest.diastolic_bp || 80}, and heart rate is ${latest.heart_rate || 72} beats per minute.`;
      }
    } else if (path === '/appointments') {
      const upcoming = appointments.filter((a) => a.status === 'Upcoming').length;
      if (preferredLanguage === 'hi-IN') {
        spokenText = `डॉक्टर अपॉइंटमेंट्स। आपके पास ${upcoming} आने वाली मुलाक़ातें हैं।`;
      } else {
        spokenText = `Doctor appointments page. You have ${upcoming} upcoming doctor visits scheduled.`;
      }
    } else {
      spokenText =
        preferredLanguage === 'hi-IN'
          ? `केयर सर्कल में आपका स्वागत है।`
          : `Welcome to CareCircle senior care portal.`;
    }

    voiceService.speak(spokenText, { lang: preferredLanguage, rate: 0.88 });
  };

  return (
    <>
      {/* Expanded Floating Assistant Panel: Docked neatly in the bottom-right corner without blocking central content */}
      {isExpanded && (
        <div className="fixed bottom-20 right-4 sm:right-6 z-40 w-[calc(100vw-2rem)] sm:w-88 bg-[#142B4A] text-white rounded-2xl p-4 shadow-2xl border border-white/15 animate-in fade-in slide-in-from-bottom-2 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#13A89E] flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Voice & Accessibility</h4>
                <p className="text-[10px] text-slate-300">Hands-free senior controls</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Senior Language Switch */}
              <div className="flex items-center bg-white/10 p-0.5 rounded-lg border border-white/10">
                <button
                  onClick={() => setPreferredLanguage('en-US')}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded transition-all cursor-pointer ${
                    preferredLanguage === 'en-US'
                      ? 'bg-[#13A89E] text-white shadow-2xs'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => setPreferredLanguage('hi-IN')}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded transition-all cursor-pointer ${
                    preferredLanguage === 'hi-IN'
                      ? 'bg-[#13A89E] text-white shadow-2xs'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  हिन्दी
                </button>
              </div>

              {/* Large Typography Toggle */}
              <button
                onClick={() => setIsLargeText(!isLargeText)}
                title={isLargeText ? 'Standard Font' : 'Large Accessible Font'}
                className={`px-2 py-0.5 rounded-lg border text-[10px] font-bold transition-all cursor-pointer ${
                  isLargeText
                    ? 'bg-amber-400 text-slate-900 border-amber-300'
                    : 'bg-white/10 text-white border-white/10 hover:bg-white/20'
                }`}
              >
                A+
              </button>

              {/* Close Button */}
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Close assistant panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Voice Actions Grid */}
          <div className="grid grid-cols-2 gap-2 pt-3">
            {/* Read Aloud Button */}
            <button
              onClick={handleReadCurrentScreen}
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/10 transition-all cursor-pointer active:scale-95"
            >
              <Volume2 className="w-4 h-4 text-[#13A89E]" />
              <span>Read Aloud</span>
            </button>

            {/* Quick Voice Nav Button */}
            <button
              onClick={handleToggleVoiceNav}
              className={`flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95 ${
                isListening
                  ? 'bg-[#DC5555] text-white ring-2 ring-rose-400 animate-pulse'
                  : 'bg-[#13A89E] hover:bg-[#0F8C83] text-white'
              }`}
            >
              <Mic className="w-4 h-4" />
              <span>{isListening ? 'Listening...' : 'Quick Voice Nav'}</span>
            </button>
          </div>

          {/* Full Voice Assistant Launcher */}
          <button
            onClick={() => {
              setIsAssistantModalOpen(true);
              setIsExpanded(false);
            }}
            className="w-full mt-2.5 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Open Interactive Voice Dialog</span>
          </button>

          {/* Transcript / Feedback Notification */}
          {transcriptNotice && (
            <div className="mt-2.5 pt-2 border-t border-white/10 text-[11px] text-teal-200 font-medium flex items-center gap-2 animate-in fade-in">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping shrink-0" />
              <span className="truncate">{transcriptNotice}</span>
            </div>
          )}
        </div>
      )}

      {/* Sleek Floating Action Button (FAB) at Bottom-Right: Never blocks cards */}
      <div className="fixed bottom-5 right-5 z-40">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-full shadow-lg border transition-all cursor-pointer hover:scale-105 active:scale-95 ${
            isExpanded
              ? 'bg-[#13A89E] text-white border-teal-300 ring-2 ring-teal-300/40'
              : isListening
              ? 'bg-[#DC5555] text-white border-white animate-pulse'
              : 'bg-[#142B4A] hover:bg-[#1E3E6B] text-white border-white/20'
          }`}
          title="Voice Accessibility Assistant"
          aria-expanded={isExpanded}
          aria-label="Toggle Voice Assistant"
        >
          {isListening ? (
            <Mic className="w-4 h-4 animate-bounce text-white" />
          ) : (
            <Mic className="w-4 h-4 text-[#13A89E]" />
          )}
          <span className="text-xs font-bold">
            {isListening ? 'Listening...' : 'Voice Assistant'}
          </span>
          {isExpanded ? (
            <ChevronDown className="w-3.5 h-3.5 text-white/80" />
          ) : (
            <ChevronUp className="w-3.5 h-3.5 text-white/80" />
          )}
        </button>
      </div>

      {/* Voice Assistant Modal */}
      <VoiceAssistantModal
        isOpen={isAssistantModalOpen}
        onClose={() => setIsAssistantModalOpen(false)}
      />
    </>
  );
}
