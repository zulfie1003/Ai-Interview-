import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { interviewService } from '../services/interviewService';
import ScoreCircle from '../components/ui/ScoreCircle';
import { CardSkeleton } from '../components/ui/Skeleton';
import {
  ArrowLeft, Trophy, CheckCircle2, XCircle, ChevronUp,
  Clock, MessageSquare, Zap, Download
} from 'lucide-react';
import {
  getCategoryLabel, getVerdictLabel, formatDate, formatDuration
} from '../utils/helpers';

const verdictConfig = {
  hire: {
    label: 'HIRE',
    icon: <CheckCircle2 className="w-6 h-6 text-accent-green" />,
    bg: 'bg-accent-green/10',
    border: 'border-accent-green/30',
    text: 'text-accent-green',
    glow: 'shadow-accent-green/10',
    desc: 'Outstanding performance. Meets the bar for a senior engineering role.',
  },
  'weak-hire': {
    label: 'WEAK HIRE',
    icon: <Trophy className="w-6 h-6 text-accent-yellow" />,
    bg: 'bg-accent-yellow/10',
    border: 'border-accent-yellow/30',
    text: 'text-accent-yellow',
    glow: 'shadow-accent-yellow/10',
    desc: 'Solid fundamentals with some gaps. Worth investing in with proper mentorship.',
  },
  'no-hire': {
    label: 'NO HIRE',
    icon: <XCircle className="w-6 h-6 text-accent-red" />,
    bg: 'bg-accent-red/10',
    border: 'border-accent-red/30',
    text: 'text-accent-red',
    glow: 'shadow-accent-red/10',
    desc: "Doesn't meet the current bar. Study more and retry in 6 months.",
  },
  pending: {
    label: 'PENDING',
    icon: <Clock className="w-6 h-6 text-accent-cyan" />,
    bg: 'bg-accent-cyan/10',
    border: 'border-accent-cyan/30',
    text: 'text-accent-cyan',
    glow: 'shadow-accent-cyan/10',
    desc: 'Interview is still in progress.',
  },
};

const ResultsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTranscript, setShowTranscript] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await interviewService.getById(id);
        setInterview(data.interview);
      } catch {
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="p-6 max-w-3xl mx-auto space-y-4">
        {[...Array(3)].map((_, i) => <CardSkeleton key={i} />)}
      </div>
    );
  }

  if (!interview) return null;

  const verdict = verdictConfig[interview.finalVerdict] || verdictConfig.pending;
  const scores = interview.scores || {};
  const userMessages = interview.messages?.filter((m) => m.role === 'user') || [];

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Back navigation */}
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-white font-mono transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      {/* Interview meta */}
      <div className="flex items-center gap-3 text-xs text-gray-500 font-mono flex-wrap">
        <span className="badge-cyan">{getCategoryLabel(interview.category)}</span>
        <span className="flex items-center gap-1.5">
          <Clock className="w-3 h-3" />
          {formatDate(interview.createdAt)}
        </span>
        <span className="flex items-center gap-1.5">
          <MessageSquare className="w-3 h-3" />
          {userMessages.length} responses
        </span>
        {interview.duration > 0 && (
          <span className="flex items-center gap-1.5">
            <Zap className="w-3 h-3" />
            {formatDuration(interview.duration)}
          </span>
        )}
      </div>

      {/* Verdict card */}
      <div className={`p-6 rounded-2xl border ${verdict.bg} ${verdict.border} shadow-lg ${verdict.glow}`}>
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-xl ${verdict.bg} border ${verdict.border} flex items-center justify-center shrink-0`}>
            {verdict.icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className={`text-2xl font-display font-bold ${verdict.text}`}>
                {verdict.label}
              </span>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed mb-3">{verdict.desc}</p>
            {interview.feedback && (
              <p className="text-sm text-gray-400 italic border-l-2 border-current pl-3 mt-3" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                "{interview.feedback}"
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Score circles */}
      {interview.status === 'completed' && (
        <div>
          <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-accent-yellow" />
            Performance Scores
          </h2>
          <div className="card">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-6 place-items-center">
              <ScoreCircle score={scores.overall || 0} label="Overall" size={90} />
              <ScoreCircle score={scores.communication || 0} label="Communication" size={72} />
              <ScoreCircle score={scores.technicalAccuracy || 0} label="Technical\nAccuracy" size={72} />
              <ScoreCircle score={scores.problemSolving || 0} label="Problem\nSolving" size={72} />
              <ScoreCircle score={scores.confidence || 0} label="Confidence" size={72} />
            </div>
          </div>
        </div>
      )}

      {/* Strengths & Improvements */}
      {(interview.strengths?.length > 0 || interview.improvements?.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {interview.strengths?.length > 0 && (
            <div className="card border-accent-green/15 bg-accent-green/5">
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-accent-green" />
                Strengths
              </h3>
              <ul className="space-y-2">
                {interview.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="text-accent-green mt-0.5 shrink-0">+</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {interview.improvements?.length > 0 && (
            <div className="card border-accent-yellow/15 bg-accent-yellow/5">
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2 text-sm">
                <ChevronUp className="w-4 h-4 text-accent-yellow" />
                Areas to Improve
              </h3>
              <ul className="space-y-2">
                {interview.improvements.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="text-accent-yellow mt-0.5 shrink-0">→</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Transcript */}
      {interview.messages?.length > 0 && (
        <div>
          <button
            onClick={() => setShowTranscript(!showTranscript)}
            className="w-full flex items-center justify-between p-4 rounded-xl bg-dark-800 border border-dark-600 hover:border-dark-500 transition-colors"
          >
            <span className="font-semibold text-white text-sm">Interview Transcript</span>
            <ChevronUp className={`w-4 h-4 text-gray-400 transition-transform ${showTranscript ? '' : 'rotate-180'}`} />
          </button>

          {showTranscript && (
            <div className="mt-2 card max-h-96 overflow-y-auto space-y-3 animate-slide-up">
              {interview.messages.map((msg, i) => (
                <div key={i} className={`text-sm ${msg.role === 'assistant' ? 'text-gray-300' : 'text-white'}`}>
                  <span className={`font-mono text-xs font-bold mr-2 ${msg.role === 'assistant' ? 'text-accent-cyan' : 'text-gray-500'}`}>
                    {msg.role === 'assistant' ? 'ALEX' : 'YOU'}
                  </span>
                  {msg.content}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pb-4">
        <button onClick={() => navigate('/interview/new')} className="btn-primary flex-1 justify-center">
          <Zap className="w-4 h-4" />
          Practice Again
        </button>
        <button onClick={() => navigate('/dashboard')} className="btn-outline">
          Dashboard
        </button>
      </div>
    </div>
  );
};

export default ResultsPage;
