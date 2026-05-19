import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { interviewService } from '../services/interviewService';
import CategorySelector from '../components/interview/CategorySelector';
import ChatMessage from '../components/chat/ChatMessage';
import TypingIndicator from '../components/chat/TypingIndicator';
import { useTimer } from '../hooks/useTimer';
import {
  Send, StopCircle, Clock, MessageSquare, Zap,
  AlertTriangle, ChevronRight, Terminal, Keyboard, Mic, MicOff, Volume2
} from 'lucide-react';

const STAGES = { SELECT: 'select', ACTIVE: 'active', ENDING: 'ending' };
const MODES = { TEXT: 'text', VOICE: 'voice' };

const oopsConcepts = [
  ['Class & Object', 'Blueprint versus real instance created from that blueprint.'],
  ['Encapsulation', 'Keep data and behavior together, expose controlled access.'],
  ['Abstraction', 'Hide implementation details behind a simple contract.'],
  ['Inheritance', 'Reuse and extend behavior from a parent type carefully.'],
  ['Polymorphism', 'Same interface, different runtime behavior.'],
  ['SOLID', 'Five design principles for maintainable object-oriented code.'],
];

const getApiErrorMessage = (err, fallback) => {
  const message = err.response?.data?.message;

  if (err.response?.status === 503 && message?.includes('Groq API key')) {
    return `${message} Restart the backend after saving the new key.`;
  }

  return message || fallback;
};

const InterviewPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category');

  const [stage, setStage] = useState(STAGES.SELECT);
  const [category, setCategory] = useState(initialCategory || 'dsa');
  const [interviewMode, setInterviewMode] = useState(MODES.TEXT);
  const [interviewId, setInterviewId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState('');
  const [voiceRate, setVoiceRate] = useState(0.95);
  const [voicePitch, setVoicePitch] = useState(0.9);
  const [autoVoiceConversation, setAutoVoiceConversation] = useState(true);
  const [error, setError] = useState('');
  const [userMessageCount, setUserMessageCount] = useState(0);
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);
  const finalSpeechRef = useRef('');
  const recognitionAutoSubmitRef = useRef(false);
  const sendMessageRef = useRef(null);
  const timer = useTimer(0, false);

  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      window.speechSynthesis?.cancel();
    };
  }, []);

  useEffect(() => {
    if (!('speechSynthesis' in window)) return;

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);

      if (!selectedVoice && voices.length > 0) {
        const preferredVoice =
          voices.find((voice) => voice.lang?.startsWith('en') && voice.name.toLowerCase().includes('male')) ||
          voices.find((voice) => voice.lang?.startsWith('en')) ||
          voices[0];

        setSelectedVoice(preferredVoice.voiceURI);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [selectedVoice]);

  const speak = useCallback((text, options = {}) => {
    if (interviewMode !== MODES.VOICE || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.replace(/```[\s\S]*?```/g, 'code block omitted'));
    const voice = availableVoices.find((item) => item.voiceURI === selectedVoice);

    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    }

    utterance.rate = voiceRate;
    utterance.pitch = voicePitch;
    utterance.onend = () => {
      if (options.listenAfter && autoVoiceConversation) {
        setTimeout(() => startListening(true), 250);
      }
    };
    window.speechSynthesis.speak(utterance);
  }, [autoVoiceConversation, availableVoices, interviewMode, selectedVoice, voicePitch, voiceRate]);

  const stopListening = useCallback((cancelAutoSubmit = true) => {
    if (cancelAutoSubmit) {
      recognitionAutoSubmitRef.current = false;
    }
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const startListening = useCallback((autoSubmit = false) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceSupported(false);
      setError('Voice mode is not supported in this browser. Use Chrome or switch to text mode.');
      return;
    }

    window.speechSynthesis?.cancel();
    recognitionRef.current?.abort();
    finalSpeechRef.current = '';
    recognitionAutoSubmitRef.current = autoSubmit;

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onresult = (event) => {
      let transcript = '';

      for (let i = 0; i < event.results.length; i += 1) {
        transcript += event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalSpeechRef.current += `${event.results[i][0].transcript} `;
        }
      }

      transcript = transcript.trim();
      setInput(transcript);
    };

    recognition.onerror = () => {
      setIsListening(false);
      setError('Voice capture stopped. Check microphone permission and try again.');
    };

    recognition.onend = () => {
      setIsListening(false);
      const finalTranscript = finalSpeechRef.current.trim();

      if (recognitionAutoSubmitRef.current && finalTranscript) {
        recognitionAutoSubmitRef.current = false;
        sendMessageRef.current?.(false, finalTranscript);
      }
    };

    recognitionRef.current = recognition;
    setError('');
    setIsListening(true);
    recognition.start();
  }, []);

  const startInterview = async () => {
    setIsLoading(true);
    setError('');
    try {
      const { data } = await interviewService.start(category);
      setInterviewId(data.interview._id);
      setMessages(data.interview.messages);
      setStage(STAGES.ACTIVE);
      timer.start();
      speak(data.interview.messages[0]?.content || '', { listenAfter: true });
      setTimeout(() => inputRef.current?.focus(), 100);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to start interview. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (endInterview = false, overrideMessage = '') => {
    const userMessage = (overrideMessage || input).trim();
    if (!userMessage || isTyping) return;

    stopListening();
    setInput('');
    const newCount = userMessageCount + 1;
    setUserMessageCount(newCount);

    // Optimistic UI
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: userMessage, timestamp: new Date().toISOString() },
    ]);
    setIsTyping(true);
    setError('');

    try {
      const shouldEnd = endInterview || newCount >= 7;
      const { data } = await interviewService.sendMessage(interviewId, userMessage, shouldEnd);

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.message, timestamp: new Date().toISOString() },
      ]);
      speak(data.message, { listenAfter: !data.isCompleted });

      if (data.isCompleted) {
        timer.pause();
        setStage(STAGES.ENDING);
        setTimeout(() => {
          navigate(`/results/${interviewId}`);
        }, 3000);
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to send message.'));
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsTyping(false);
    }
  };

  sendMessageRef.current = sendMessage;

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleEndInterview = async () => {
    if (!input.trim()) {
      setShowEndConfirm(false);
      sendMessage(true, "I think I've covered the main points. Can we wrap up?");
      return;
    }
    sendMessage(true);
    setShowEndConfirm(false);
  };

  const abandonInterview = async () => {
    try {
      await interviewService.abandon(interviewId);
    } catch {}
    navigate('/dashboard');
  };

  // Select stage
  if (stage === STAGES.SELECT) {
    return (
      <div className="p-6 max-w-3xl mx-auto animate-fade-in">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-500 font-mono mb-2">
            <Terminal className="w-4 h-4 text-accent-cyan" />
            <span>New Session</span>
          </div>
          <h1 className="text-2xl font-display font-bold text-white mb-2">Choose Interview Type</h1>
          <p className="text-gray-400 text-sm font-mono">
            Alex will interview you based on the selected category.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-accent-red/10 border border-accent-red/20 mb-5 text-sm text-accent-red">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <CategorySelector selected={category} onSelect={setCategory} />

        {category === 'oops' && (
          <div className="mt-6 p-4 rounded-xl bg-dark-800 border border-accent-green/20">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-accent-green" />
              <h2 className="text-sm font-semibold text-white">OOP quick revision</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {oopsConcepts.map(([title, description]) => (
                <div key={title} className="p-3 rounded-lg bg-dark-700/70 border border-dark-600">
                  <p className="text-xs font-semibold text-accent-green mb-1">{title}</p>
                  <p className="text-xs text-gray-400 leading-relaxed">{description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6">
          <p className="label">Interview mode</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => setInterviewMode(MODES.TEXT)}
              className={`p-4 rounded-xl border text-left transition-all ${
                interviewMode === MODES.TEXT
                  ? 'bg-accent-cyan/5 border-accent-cyan/50'
                  : 'bg-dark-800 border-dark-600 hover:border-accent-cyan/40'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-lg bg-accent-cyan/10 flex items-center justify-center">
                  <Keyboard className="w-4 h-4 text-accent-cyan" />
                </div>
                <span className="text-sm font-semibold text-white">Text mode</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Type answers manually and send with Enter.
              </p>
            </button>
            <button
              onClick={() => setInterviewMode(MODES.VOICE)}
              className={`p-4 rounded-xl border text-left transition-all ${
                interviewMode === MODES.VOICE
                  ? 'bg-accent-green/5 border-accent-green/50'
                  : 'bg-dark-800 border-dark-600 hover:border-accent-green/40'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-lg bg-accent-green/10 flex items-center justify-center">
                  <Mic className="w-4 h-4 text-accent-green" />
                </div>
                <span className="text-sm font-semibold text-white">Voice mode</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Speak your answers. Alex replies aloud and in chat.
              </p>
            </button>
          </div>
        </div>

        {interviewMode === MODES.VOICE && (
          <div className="mt-6 p-4 rounded-xl bg-dark-800 border border-dark-600">
            <div className="flex items-center gap-2 mb-4">
              <Volume2 className="w-4 h-4 text-accent-green" />
              <h2 className="text-sm font-semibold text-white">Voice type</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="label" htmlFor="voice-select">Alex voice</label>
                <select
                  id="voice-select"
                  value={selectedVoice}
                  onChange={(event) => setSelectedVoice(event.target.value)}
                  className="input-field"
                  disabled={availableVoices.length === 0}
                >
                  {availableVoices.length === 0 ? (
                    <option value="">Browser voices loading...</option>
                  ) : (
                    availableVoices.map((voice) => (
                      <option key={voice.voiceURI} value={voice.voiceURI}>
                        {voice.name} ({voice.lang})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className="label">Speed: {voiceRate.toFixed(2)}x</span>
                  <input
                    type="range"
                    min="0.7"
                    max="1.25"
                    step="0.05"
                    value={voiceRate}
                    onChange={(event) => setVoiceRate(Number(event.target.value))}
                    className="w-full accent-cyan-400"
                  />
                </label>
                <label className="block">
                  <span className="label">Pitch: {voicePitch.toFixed(2)}</span>
                  <input
                    type="range"
                    min="0.6"
                    max="1.4"
                    step="0.05"
                    value={voicePitch}
                    onChange={(event) => setVoicePitch(Number(event.target.value))}
                    className="w-full accent-cyan-400"
                  />
                </label>
              </div>

              <button
                type="button"
                onClick={() => speak('This is Alex. I will conduct your interview in this voice.')}
                className="btn-ghost text-xs"
              >
                <Volume2 className="w-3.5 h-3.5" />
                Test voice
              </button>
            </div>
          </div>
        )}

        <div className="mt-8 p-4 rounded-xl bg-dark-800 border border-dark-600">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-accent-cyan/10 border border-accent-cyan/30 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-xs font-mono font-bold text-accent-cyan">A</span>
            </div>
            <div>
              <p className="text-xs text-accent-cyan/60 font-mono mb-1">Alex · Senior Engineer</p>
              <p className="text-sm text-gray-300">
                Ready when you are. I'll start with an introduction then dive straight into the interview.
                {interviewMode === MODES.VOICE
                  ? ' Use the mic button to record each answer.'
                  : ' Answer clearly. I\'ll challenge anything vague.'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-ghost"
          >
            Cancel
          </button>
          <button
            onClick={startInterview}
            disabled={isLoading}
            className="btn-primary flex-1 justify-center"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-dark-950/50 border-t-dark-950 rounded-full animate-spin" />
                Preparing interview...
              </>
            ) : (
              <>
                Begin Interview <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // Active interview stage
  const categoryLabels = {
    dsa: 'DSA & Algorithms',
    'system-design': 'System Design',
    oops: 'OOP Concepts',
    'computer-network': 'Computer Networks',
    dbms: 'DBMS',
    'operating-system': 'Operating Systems',
    behavioral: 'Behavioral',
    mixed: 'Mixed',
  };

  return (
    <div className="flex flex-col h-full">
      {/* Interview header */}
      <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-dark-700 bg-dark-900/80 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-accent-cyan/10 border border-accent-cyan/30 flex items-center justify-center">
              <span className="text-xs font-mono font-bold text-accent-cyan">A</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-white leading-tight">Alex</p>
              <p className="text-xs text-gray-500 font-mono leading-tight">
                {categoryLabels[category]} · {interviewMode === MODES.VOICE ? 'Voice' : 'Text'}
              </p>
            </div>
          </div>
          <div className="w-px h-6 bg-dark-600" />
          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-mono">
            <Clock className="w-3.5 h-3.5" />
            <span className={timer.seconds > 1800 ? 'text-accent-red' : ''}>{timer.formatted()}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-mono">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{userMessageCount}/7</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {stage === STAGES.ACTIVE && userMessageCount >= 3 && (
            <button
              onClick={() => setShowEndConfirm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-gray-400 hover:text-accent-yellow hover:bg-accent-yellow/5 border border-dark-600 hover:border-accent-yellow/30 transition-all"
            >
              <StopCircle className="w-3.5 h-3.5" />
              End
            </button>
          )}
          <button
            onClick={abandonInterview}
            className="text-xs font-mono text-gray-500 hover:text-accent-red px-2 py-1"
          >
            Leave
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 bg-dark-700 shrink-0">
        <div
          className="h-full bg-gradient-to-r from-accent-cyan to-accent-purple transition-all duration-500"
          style={{ width: `${Math.min((userMessageCount / 7) * 100, 100)}%` }}
        />
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {messages.map((msg, i) => (
          <ChatMessage key={i} message={msg} />
        ))}
        {isTyping && <TypingIndicator />}
        {stage === STAGES.ENDING && (
          <div className="text-center py-4 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-green/10 border border-accent-green/20 text-accent-green text-sm font-mono">
              <div className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
              Interview complete — Generating results...
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Error */}
      {error && (
        <div className="mx-4 mb-2 flex items-center gap-2 p-2 rounded-lg bg-accent-red/10 border border-accent-red/20 text-xs text-accent-red font-mono">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          {error}
        </div>
      )}

      {/* Input area */}
      {stage === STAGES.ACTIVE && (
        <div className="p-4 md:px-6 border-t border-dark-700 bg-dark-900/50 shrink-0">
          {interviewMode === MODES.VOICE && (
            <div className="flex items-center justify-between gap-3 mb-3 p-3 rounded-xl bg-dark-800 border border-dark-600">
              <div className="flex items-center gap-2 min-w-0">
                <Volume2 className="w-4 h-4 text-accent-green shrink-0" />
                <p className="text-xs text-gray-400 font-mono truncate">
                  {voiceSupported ? (isListening ? 'Listening...' : 'Voice mode ready') : 'Voice mode unavailable'}
                </p>
              </div>
              <button
                type="button"
                onClick={isListening ? stopListening : startListening}
                disabled={isTyping || stage === STAGES.ENDING}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono transition-all ${
                  isListening
                    ? 'bg-accent-red/10 text-accent-red border border-accent-red/30'
                    : 'bg-accent-green/10 text-accent-green border border-accent-green/30 hover:bg-accent-green/15'
                } disabled:opacity-40`}
              >
                {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                {isListening ? 'Stop' : 'Record'}
              </button>
            </div>
          )}
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={interviewMode === MODES.VOICE
                  ? 'Your spoken answer will appear here...'
                  : 'Type your answer... (Enter to send, Shift+Enter for new line)'}
                className="w-full bg-dark-700 border border-dark-600 rounded-xl px-4 py-3 text-white text-sm
                  placeholder-gray-600 font-mono resize-none leading-relaxed
                  focus:outline-none focus:border-accent-cyan/50 focus:ring-1 focus:ring-accent-cyan/30
                  transition-all duration-200 max-h-40"
                rows={2}
                disabled={isTyping || stage === STAGES.ENDING}
              />
            </div>
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isTyping || stage === STAGES.ENDING}
              className="w-11 h-11 flex items-center justify-center bg-accent-cyan text-dark-950 rounded-xl
                hover:bg-accent-cyan/90 active:scale-95 transition-all duration-200
                disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-accent-cyan shrink-0"
            >
              {isTyping ? (
                <div className="w-4 h-4 border-2 border-dark-950/50 border-t-dark-950 rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
          <p className="text-xs text-gray-600 font-mono mt-2 text-center">
            {userMessageCount < 3
              ? `${3 - userMessageCount} more responses before you can end the interview`
              : `${7 - userMessageCount} responses remaining · ${
                interviewMode === MODES.VOICE ? 'Record, review, then send' : 'Press Enter to send'
              }`}
          </p>
        </div>
      )}

      {/* End confirmation modal */}
      {showEndConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-800 border border-dark-600 rounded-2xl p-6 max-w-sm w-full animate-slide-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-accent-yellow/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-accent-yellow" />
              </div>
              <div>
                <h3 className="font-semibold text-white">End Interview?</h3>
                <p className="text-xs text-gray-500 font-mono">This will trigger final evaluation</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 mb-6">
              Alex will evaluate all your answers and generate a final verdict with scores.
              {input.trim() ? ' Your current message will be sent as the final response.' : ''}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowEndConfirm(false)} className="btn-ghost flex-1 justify-center">
                Continue
              </button>
              <button onClick={handleEndInterview} className="flex-1 py-2.5 px-4 bg-accent-yellow text-dark-950 font-semibold rounded-lg hover:bg-opacity-90 transition-all text-sm">
                <Zap className="w-4 h-4 inline mr-1" />
                End & Evaluate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewPage;
