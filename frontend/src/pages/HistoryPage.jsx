import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { interviewService } from '../services/interviewService';
import InterviewCard from '../components/dashboard/InterviewCard';
import { CardSkeleton } from '../components/ui/Skeleton';
import { History, Filter, ChevronLeft, ChevronRight, Search } from 'lucide-react';

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'dsa', label: 'DSA & Algorithms' },
  { value: 'system-design', label: 'System Design' },
  { value: 'oops', label: 'OOP Concepts' },
  { value: 'computer-network', label: 'Computer Networks' },
  { value: 'dbms', label: 'DBMS' },
  { value: 'operating-system', label: 'Operating Systems' },
  { value: 'behavioral', label: 'Behavioral' },
  { value: 'mixed', label: 'Mixed' },
];

const STATUSES = [
  { value: '', label: 'All Status' },
  { value: 'completed', label: 'Completed' },
  { value: 'active', label: 'Active' },
  { value: 'abandoned', label: 'Abandoned' },
];

const HistoryPage = () => {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [filters, setFilters] = useState({ category: '', status: '' });

  const fetchHistory = async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await interviewService.getHistory(page, 15);
      setInterviews(data.interviews);
      setPagination(data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(1);
  }, []);

  const filtered = interviews.filter((i) => {
    if (filters.category && i.category !== filters.category) return false;
    if (filters.status && i.status !== filters.status) return false;
    return true;
  });

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white flex items-center gap-2">
            <History className="w-6 h-6 text-accent-cyan" />
            Interview History
          </h1>
          <p className="text-sm text-gray-500 font-mono mt-1">
            {pagination.total} total session{pagination.total !== 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={() => navigate('/interview/new')} className="btn-primary text-sm py-2 px-4">
          New Interview
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-xs text-gray-400 font-mono">
          <Filter className="w-3.5 h-3.5" />
          Filter:
        </div>
        <select
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          className="bg-dark-700 border border-dark-600 rounded-lg px-3 py-1.5 text-sm text-white font-mono focus:outline-none focus:border-accent-cyan/50"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="bg-dark-700 border border-dark-600 rounded-lg px-3 py-1.5 text-sm text-white font-mono focus:outline-none focus:border-accent-cyan/50"
        >
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        {(filters.category || filters.status) && (
          <button
            onClick={() => setFilters({ category: '', status: '' })}
            className="text-xs font-mono text-accent-red hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Interview list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card border-dashed border-dark-600 text-center py-12">
          <Search className="w-8 h-8 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 font-semibold mb-1">No interviews found</p>
          <p className="text-sm text-gray-600 font-mono">
            {filters.category || filters.status ? 'Try adjusting your filters' : 'Start your first interview'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((interview) => (
            <InterviewCard key={interview._id} interview={interview} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => fetchHistory(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="btn-ghost py-2 px-3 text-sm disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-mono text-gray-400">
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            onClick={() => fetchHistory(pagination.page + 1)}
            disabled={pagination.page === pagination.pages}
            className="btn-ghost py-2 px-3 text-sm disabled:opacity-40"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
