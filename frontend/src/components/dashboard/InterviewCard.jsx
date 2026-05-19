import { useNavigate } from 'react-router-dom';
import { Clock, MessageSquare, ChevronRight, Award } from 'lucide-react';
import { formatRelative, getCategoryLabel, getVerdictLabel, getVerdictColor } from '../../utils/helpers';

const verdictStyles = {
  hire: 'badge-green',
  'weak-hire': 'badge-yellow',
  'no-hire': 'badge-red',
  pending: 'badge-cyan',
};

const categoryStyles = {
  dsa: 'badge-cyan',
  'system-design': 'badge-purple',
  oops: 'badge-green',
  'computer-network': 'badge-cyan',
  dbms: 'badge-purple',
  'operating-system': 'badge-yellow',
  behavioral: 'badge-green',
  mixed: 'badge-yellow',
};

const InterviewCard = ({ interview }) => {
  const navigate = useNavigate();
  const overall = interview.scores?.overall || 0;

  return (
    <button
      onClick={() => navigate(`/results/${interview._id}`)}
      className="w-full text-left card-hover group animate-fade-in"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`badge ${categoryStyles[interview.category] || 'badge-cyan'}`}>
              {getCategoryLabel(interview.category)}
            </span>
            {interview.status === 'completed' && (
              <span className={`badge ${verdictStyles[interview.finalVerdict] || 'badge-cyan'}`}>
                {getVerdictLabel(interview.finalVerdict)}
              </span>
            )}
            {interview.status === 'abandoned' && (
              <span className="badge bg-gray-500/10 text-gray-500 border border-gray-500/20">
                ABANDONED
              </span>
            )}
            {interview.status === 'active' && (
              <span className="badge bg-accent-green/10 text-accent-green border border-accent-green/20 animate-pulse">
                ACTIVE
              </span>
            )}
          </div>

          <h3 className="font-semibold text-white mb-1 truncate">{interview.title}</h3>

          <div className="flex items-center gap-4 text-xs text-gray-500 font-mono">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              {formatRelative(interview.createdAt)}
            </span>
            <span className="flex items-center gap-1.5">
              <MessageSquare className="w-3 h-3" />
              {interview.questionCount || 0} questions
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {interview.status === 'completed' && overall > 0 && (
            <div className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-accent-yellow" />
              <span className="font-mono font-bold text-white text-sm">{overall.toFixed(1)}</span>
              <span className="text-xs text-gray-500 font-mono">/10</span>
            </div>
          )}
          <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-accent-cyan transition-colors" />
        </div>
      </div>
    </button>
  );
};

export default InterviewCard;
