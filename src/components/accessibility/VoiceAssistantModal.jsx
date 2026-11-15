import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Languages,
  CheckCircle2,
  Clock,
  Calendar,
  HeartPulse,
  ShoppingBag,
  AlertTriangle,
  Send,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCare } from '../../context/CareContext';
import voiceService from '../../services/voiceService';

export default function VoiceAssistantModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const {
    activePatient,
    medications,
    appointments,
    vitalsLogs,
    toggleMedicationStatus,
    preferredLanguage,
    setPreferredLanguage
  } = useCare();

  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [typedInput, setTypedInput] = useState('');
  const [micError, setMicError] = useState(null);
  const [assistantResult, setAssistantResult] = useState(null);
  const [pendingConfirmation, setPendingConfirmation] = useState(null);

  const isRecognitionAvailable = voiceService.isRecognitionSupported();

  // Handle command execution
  const executeCommand = (text) => {
    if (!text || !text.trim()) return;

    setTranscript(text);
    const result = voiceService.processAssistantCommand({
      transcript: text,
      language: preferredLanguage,
      contextData: {
        activePatient,
        medications,
        appointments,
        vitalsLogs
      }
    });

    setAssistantResult(result);

    // If confirmation is needed for a data mutation
    if (result.actionRequired) {
      setPendingConfirmation(result.actionRequired);
    } else {
      setPendingConfirmation(null);
    }

    // Speak response aloud via SpeechSynthesis
    if (result.spokenResponse) {
      voiceService.speak(result.spokenResponse, {
        lang: preferredLanguage,
        rate: 0.88,
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false)
      });
    }
  };

  // Start or Stop Voice Recognition
  const handleToggleListening = () => {
    if (isListening) {
      voiceService.stopListening();
      setIsListening(false);
      return;
    }

    setMicError(null);
    setTranscript('');

    if (!isRecognitionAvailable) {
      setMicError('Speech recognition is not supported in this browser. Please use the quick command buttons below.');
      return;
    }

    voiceService.startListening({
      language: preferredLanguage,
      onStart: () => {
        setIsListening(true);
        setMicError(null);
      },
      onResult: (spokenText) => {
        setIsListening(false);
        executeCommand(spokenText);
      },
      onError: (err) => {
        setIsListening(false);
        const errMsg =
          err === 'not-allowed'
            ? 'Microphone permission was denied. You can still use the quick command buttons below.'
            : `Microphone issue: ${err}. Please try again or tap a command below.`;
        setMicError(errMsg);
      },
      onEnd: () => {
        setIsListening(false);
      }
    });
  };

  // Stop TTS speech
  const handleStopSpeaking = () => {
    voiceService.stopSpeaking();
    setIsSpeaking(false);
  };

  // Confirm data change
  const handleConfirmAction = async () => {
    if (!pendingConfirmation) return;

    if (pendingConfirmation.type === 'toggle_medication_status') {
      await toggleMedicationStatus(pendingConfirmation.targetId, pendingConfirmation.status);
      const successMsg =
        preferredLanguage === 'hi-IN'
          ? `${pendingConfirmation.targetName} को ली गई मार्क कर दिया गया है।`
          : `Successfully recorded ${pendingConfirmation.targetName} as taken.`;

      setAssistantResult({
        intent: 'confirmed',
        displayTitle: preferredLanguage === 'hi-IN' ? 'पुष्टि संपन्न' : 'Action Completed',
        displayContent: successMsg,
        spokenResponse: successMsg
      });

      voiceService.speak(successMsg, {
        lang: preferredLanguage,
        rate: 0.88,
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false)
      });
    }

    setPendingConfirmation(null);
  };

  // Cancel data change
  const handleCancelAction = () => {
    const cancelMsg =
      preferredLanguage === 'hi-IN' ? 'कार्रवाई रद्द कर दी गई।' : 'Action cancelled.';
    setPendingConfirmation(null);
    setAssistantResult(prev => ({
      ...prev,
      displayContent: cancelMsg
    }));
    voiceService.speak(cancelMsg, { lang: preferredLanguage, rate: 0.9 });
  };

  // Reset when opened
  useEffect(() => {
    if (isOpen) {
      // Auto-start listening on open if recognition is available
      if (voiceService.isRecognitionSupported()) {
        const timer = setTimeout(() => {
          handleToggleListening();
        }, 300);
        return () => clearTimeout(timer);
      }
    } else {
      voiceService.stopListening();
      voiceService.stopSpeaking();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Quick Command Preset Chips
  const quickCommands = [
    {
      en: "Show today's medicines",
      hi: "आज की दवाइयाँ दिखाओ",
      icon: CheckCircle2
    },
    {
      en: "Read my medication schedule",
      hi: "दवाइयों का समय बताओ",
      icon: Clock
    },
    {
      en: "Show my upcoming appointments",
      hi: "डॉक्टर के अपॉइंटमेंट दिखाओ",
      icon: Calendar
    },
    {
      en: "Show my health vitals",
      hi: "मेरे वाइटल्स बताओ",
      icon: HeartPulse
    },
    {
      en: "Show my remaining medicine stock",
      hi: "बची हुई दवाइयों का स्टॉक दिखाओ",
      icon: ShoppingBag
    }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        handleStopSpeaking();
        voiceService.stopListening();
        setIsListening(false);
        setIsSpeaking(false);
        onClose();
      }}
      title="CareCircle Voice Assistant"
      subtitle="Accessible voice guidance in English and Hindi powered by clinical records"
      maxWidth="max-w-xl"
    >
      <div className="space-y-5">
        {/* Top Header Controls: Language Selector & Audio Indicator */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200">
          {/* Language Selection Option (Requirement 9) */}
          <div className="flex items-center gap-2">
            <Languages className="w-4 h-4 text-[#13A89E]" />
            <span className="text-xs font-bold text-slate-700">Language:</span>
            <div className="flex items-center bg-white p-0.5 rounded-xl border border-slate-200 shadow-2xs">
              <button
                type="button"
                onClick={() => setPreferredLanguage('en-US')}
                className={`px-3 py-1 text-xs font-black rounded-lg transition-all cursor-pointer ${
                  preferredLanguage === 'en-US'
                    ? 'bg-[#142B4A] text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setPreferredLanguage('hi-IN')}
                className={`px-3 py-1 text-xs font-black rounded-lg transition-all cursor-pointer ${
                  preferredLanguage === 'hi-IN'
                    ? 'bg-[#13A89E] text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                हिन्दी
              </button>
            </div>
          </div>

          {/* Stop Speaking Button (Requirement 5) */}
          <div className="flex items-center gap-2">
            {isSpeaking ? (
              <button
                type="button"
                onClick={handleStopSpeaking}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold cursor-pointer transition-all animate-pulse shadow-xs"
                title="Stop Speaking Immediately"
              >
                <VolumeX className="w-4 h-4" />
                <span>Stop Speaking</span>
              </button>
            ) : (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                <Volume2 className="w-3.5 h-3.5 text-slate-400" />
                Speech Synthesis Active
              </span>
            )}
          </div>
        </div>

        {/* Large Accessible Microphone Section */}
        <div className="flex flex-col items-center justify-center py-4 px-3 rounded-3xl bg-gradient-to-b from-[#EAF3FC]/60 to-[#F7F9FC] border border-blue-100 text-center relative overflow-hidden">
          {/* Animated Wave Rings when listening */}
          {isListening && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-32 h-32 rounded-full bg-rose-400/20 animate-ping" />
              <div className="w-48 h-48 rounded-full bg-[#13A89E]/10 animate-pulse" />
            </div>
          )}

          {/* Large Microphone Button (Requirement 1) */}
          <button
            type="button"
            onClick={handleToggleListening}
            className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center text-white transition-all transform active:scale-95 cursor-pointer shadow-lg z-10 ${
              isListening
                ? 'bg-rose-600 ring-8 ring-rose-200 animate-pulse shadow-rose-900/30'
                : 'bg-gradient-to-br from-[#13A89E] to-[#0F8C83] hover:from-[#0F8C83] hover:to-[#0C736C] ring-4 ring-teal-100 shadow-teal-900/20'
            }`}
            title={isListening ? 'Tap to stop listening' : 'Tap to speak voice command'}
          >
            {isListening ? (
              <MicOff className="w-10 h-10 sm:w-12 sm:h-12" />
            ) : (
              <Mic className="w-10 h-10 sm:w-12 sm:h-12" />
            )}
          </button>

          {/* Clear Listening Indicator (Design requirement) */}
          <div className="mt-4 z-10">
            {isListening ? (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-100 text-rose-900 text-xs font-black">
                <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
                <span>
                  {preferredLanguage === 'hi-IN' ? 'सुन रहे हैं... कृपया बोलें' : 'Listening... Speak now'}
                </span>
              </div>
            ) : (
              <p className="text-xs font-bold text-slate-600">
                {preferredLanguage === 'hi-IN'
                  ? 'बोलने के लिए माइक बटन दबाएं'
                  : 'Tap microphone to speak command'}
              </p>
            )}
          </div>

          {/* Real-Time Transcript Display (Requirement 6) */}
          {transcript && (
            <div className="mt-3.5 max-w-md w-full bg-white/90 backdrop-blur-xs p-3 rounded-2xl border border-slate-200 text-xs text-slate-800 shadow-2xs z-10 animate-in fade-in">
              <span className="text-[10px] font-bold text-[#13A89E] uppercase tracking-wider block mb-0.5">
                Recognized Spoken Text
              </span>
              <p className="font-extrabold text-[#142B4A] text-sm">“{transcript}”</p>
            </div>
          )}
        </div>

        {/* Graceful Fallback if Speech Recognition is Unavailable / Mic Error (Requirement 10) */}
        {micError && (
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">Microphone Status</p>
              <p className="text-[11px] text-amber-800 leading-relaxed">{micError}</p>
            </div>
          </div>
        )}

        {/* Voice Assistant Response Panel (Design requirement) */}
        {assistantResult && (
          <div className="p-4 rounded-2xl bg-white border-2 border-teal-200 shadow-sm space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-teal-50 text-[#13A89E]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-black text-[#142B4A]">
                  {assistantResult.displayTitle}
                </h4>
              </div>

              {assistantResult.route && (
                <button
                  type="button"
                  onClick={() => {
                    navigate(assistantResult.route);
                    onClose();
                  }}
                  className="text-xs font-bold text-[#13A89E] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Open Page</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <p className="text-sm text-slate-700 leading-relaxed font-medium bg-slate-50 p-3 rounded-xl border border-slate-100">
              {assistantResult.displayContent}
            </p>

            {/* Confirmation Dialog for Data Mutation (Requirement 7) */}
            {pendingConfirmation && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-950">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  <span>
                    {preferredLanguage === 'hi-IN'
                      ? 'डेटा परिवर्तन से पहले पुष्टि आवश्यक है'
                      : 'Confirmation Required Before Updating Record'}
                  </span>
                </div>
                <p className="text-xs text-amber-900">
                  {pendingConfirmation.confirmMessage}
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <Button
                    type="button"
                    variant="accent"
                    size="sm"
                    onClick={handleConfirmAction}
                    className="font-bold text-xs"
                  >
                    {preferredLanguage === 'hi-IN' ? 'हाँ, पुष्टि करें' : 'Yes, Confirm'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleCancelAction}
                    className="text-xs text-slate-600"
                  >
                    {preferredLanguage === 'hi-IN' ? 'रद्द करें' : 'Cancel'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quick Voice Command Chips (Requirement 3 & 10 Fallback) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              {preferredLanguage === 'hi-IN' ? 'त्वरित वॉयस कमांड्स' : 'Supported Voice Commands'}
            </span>
            <span className="text-[10px] text-slate-400">Tap any to run</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {quickCommands.map((cmd, idx) => {
              const Icon = cmd.icon;
              const label = preferredLanguage === 'hi-IN' ? cmd.hi : cmd.en;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => executeCommand(label)}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-[#13A89E] text-left text-xs font-semibold text-slate-700 transition-all cursor-pointer group shadow-2xs"
                >
                  <span className="p-1.5 rounded-lg bg-teal-50 text-[#13A89E] group-hover:bg-[#13A89E] group-hover:text-white transition-colors shrink-0">
                    <Icon className="w-3.5 h-3.5" />
                  </span>
                  <span className="truncate">{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Text Input Command Fallback (Requirement 10) */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (typedInput.trim()) {
              executeCommand(typedInput.trim());
              setTypedInput('');
            }
          }}
          className="flex items-center gap-2 pt-2 border-t border-slate-100"
        >
          <input
            type="text"
            value={typedInput}
            onChange={(e) => setTypedInput(e.target.value)}
            placeholder={
              preferredLanguage === 'hi-IN'
                ? 'कमांड लिखें (जैसे: दवाइयाँ दिखाओ)...'
                : 'Type a command (e.g. show health vitals)...'
            }
            className="flex-1 px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#13A89E] focus:outline-none bg-slate-50"
          />
          <Button
            type="submit"
            variant="accent"
            size="sm"
            icon={Send}
            disabled={!typedInput.trim()}
            className="text-xs font-bold"
          >
            Run
          </Button>
        </form>

        {/* Clinical Disclaimer & Non-AI Distinction Notice */}
        <div className="p-3 rounded-xl bg-slate-100 text-slate-500 text-[11px] flex items-start gap-2 border border-slate-200/70">
          <Info className="w-3.5 h-3.5 text-[#13A89E] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Clinical & Privacy Notice:</strong> This assistant executes deterministic clinical routines based directly on {activePatient.name}’s authenticated records (not generated by open-ended generative AI). Commands cannot alter prescribed dosages or provide medical diagnoses.
          </p>
        </div>
      </div>
    </Modal>
  );
}
