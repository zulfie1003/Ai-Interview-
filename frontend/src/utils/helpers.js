import { formatDistanceToNow, format } from 'date-fns';

export const formatDate = (date) => {
  if (!date) return 'Unknown';
  try {
    return format(new Date(date), 'MMM d, yyyy');
  } catch { return 'Invalid date'; }
};

export const formatRelative = (date) => {
  if (!date) return '';
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch { return ''; }
};

export const formatDuration = (seconds) => {
  if (!seconds) return '0m';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
};

export const getCategoryLabel = (category) => {
  const labels = {
    dsa: 'DSA & Algorithms',
    'system-design': 'System Design',
    oops: 'OOP Concepts',
    'computer-network': 'Computer Networks',
    dbms: 'DBMS',
    'operating-system': 'Operating Systems',
    behavioral: 'Behavioral',
    mixed: 'Mixed',
  };
  return labels[category] || category;
};

export const getCategoryColor = (category) => {
  const colors = {
    dsa: 'cyan',
    'system-design': 'purple',
    oops: 'green',
    'computer-network': 'cyan',
    dbms: 'purple',
    'operating-system': 'yellow',
    behavioral: 'green',
    mixed: 'yellow',
  };
  return colors[category] || 'cyan';
};

export const getVerdictColor = (verdict) => {
  const colors = {
    hire: 'green',
    'weak-hire': 'yellow',
    'no-hire': 'red',
    pending: 'cyan',
  };
  return colors[verdict] || 'cyan';
};

export const getVerdictLabel = (verdict) => {
  const labels = {
    hire: '✓ HIRE',
    'weak-hire': '~ WEAK HIRE',
    'no-hire': '✗ NO HIRE',
    pending: '... PENDING',
  };
  return labels[verdict] || verdict?.toUpperCase();
};

export const getScoreColor = (score) => {
  if (score >= 8) return '#00ff88';
  if (score >= 6) return '#ffd700';
  return '#ff4455';
};

export const truncate = (str, n = 100) =>
  str?.length > n ? str.substring(0, n) + '...' : str;
