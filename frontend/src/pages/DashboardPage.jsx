import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { interviewService } from '../services/interviewService';
import StatsCard from '../components/dashboard/StatsCard';
import InterviewCard from '../components/dashboard/InterviewCard';
import { DashboardSkeleton } from '../components/ui/Skeleton';
import {
  BarChart2, Target, Trophy, Clock, Zap, History, ChevronRight, Code2
} from 'lucide-react';
import { getCategoryLabel } from '../utils/helpers';

const EmptyState = ({ navigate }) => (
  <div className="card border-dashed border-dark-600 text-center py-12">
    <div className="w-12 h-12 bg-accent-cyan/10 rounded-xl flex items-center justify-center mx-auto mb-4">
      <Code2 className="w-6 h-6 text-accent-cyan" />
    </div>
    <h3 className="font-semibold text-white mb-2">No interviews yet</h3>
    <p className="text-sm text-gray-500 mb-6 font-mono max-w-xs mx-auto">
      Start your first interview to see your history and scores here.
    </p>
    <button onClick={() => navigate('/interview/new')} className="btn-primary">
      Start First Interview <Zap className="w-4 h-4" />
    </button>
  </div>
);

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await interviewService.getHistory(1, 10);
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  if (loading) return <DashboardSkeleton />;

  const stats = data?.stats || {};
  const interviews = data?.interviews || [];
  const categories = stats.categoryBreakdown || {};

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500 font-mono mb-1">{greeting},</p>
          <h1 className="text-2xl font-display font-bold text-white">{user?.name}</h1>
          <p className="text-sm text-gray-400 mt-1 font-mono">
            {stats.completed > 0
              ? `${stats.completed} interviews completed · Avg score: ${stats.avgScore}/10`
              : 'Ready to begin your interview journey?'}
          </p>
        </div>
        <button
          onClick={() => navigate('/interview/new')}
          className="btn-primary shrink-0"
        >
          <Zap className="w-4 h-4" />
          New Interview
        </button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label="Total Sessions"
          value={stats.total || 0}
          sub="All time"
          icon={History}
          color="cyan"
        />
        <StatsCard
          label="Completed"
          value={stats.completed || 0}
          sub={`${stats.total ? Math.round((stats.completed / stats.total) * 100) : 0}% completion rate`}
          icon={Target}
          color="green"
        />
        <StatsCard
          label="Avg Score"
          value={stats.avgScore ? `${stats.avgScore}` : '—'}
          sub="Out of 10"
          icon={BarChart2}
          color="purple"
        />
        <StatsCard
          label="Categories"
          value={Object.keys(categories).length || 0}
          sub="Types practiced"
          icon={Trophy}
          color="yellow"
        />
      </div>

      {/* Category breakdown */}
      {Object.keys(categories).length > 0 && (
        <div>
          <h2 className="font-semibold text-white mb-3 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-accent-cyan" />
            Categories Practiced
          </h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(categories).map(([cat, count]) => (
              <div key={cat} className="badge-cyan flex items-center gap-2">
                <span>{getCategoryLabel(cat)}</span>
                <span className="bg-accent-cyan/20 rounded px-1.5 py-0.5 text-xs font-bold">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent interviews */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-accent-cyan" />
            Recent Interviews
          </h2>
          {interviews.length > 0 && (
            <button
              onClick={() => navigate('/history')}
              className="text-xs text-accent-cyan font-mono hover:underline flex items-center gap-1"
            >
              View all <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>

        {interviews.length === 0 ? (
          <EmptyState navigate={navigate} />
        ) : (
          <div className="space-y-3">
            {interviews.slice(0, 5).map((interview) => (
              <InterviewCard key={interview._id} interview={interview} />
            ))}
          </div>
        )}
      </div>

      {/* Quick start */}
      <div className="card border-accent-cyan/10 bg-gradient-to-r from-accent-cyan/5 to-transparent">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-white mb-1">Ready for your next interview?</h3>
            <p className="text-xs text-gray-400 font-mono">Alex is waiting. Pick a category and begin.</p>
          </div>
          <button onClick={() => navigate('/interview/new')} className="btn-outline shrink-0 text-sm">
            Begin <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
