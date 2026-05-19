const StatsCard = ({ label, value, sub, icon: Icon, color = 'cyan', trend }) => {
  const colorMap = {
    cyan: { icon: 'text-accent-cyan', bg: 'bg-accent-cyan/10', border: 'border-accent-cyan/20' },
    green: { icon: 'text-accent-green', bg: 'bg-accent-green/10', border: 'border-accent-green/20' },
    purple: { icon: 'text-purple-400', bg: 'bg-accent-purple/10', border: 'border-accent-purple/20' },
    yellow: { icon: 'text-accent-yellow', bg: 'bg-accent-yellow/10', border: 'border-accent-yellow/20' },
  };
  const c = colorMap[color];

  return (
    <div className={`card border ${c.border} ${c.bg}`}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-mono text-gray-500 uppercase tracking-wider">{label}</p>
        {Icon && (
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${c.bg}`}>
            <Icon className={`w-4 h-4 ${c.icon}`} />
          </div>
        )}
      </div>
      <p className={`text-3xl font-display font-bold ${c.icon} mb-1`}>{value}</p>
      {sub && <p className="text-xs text-gray-500 font-mono">{sub}</p>}
      {trend && (
        <p className={`text-xs font-mono mt-1 ${trend > 0 ? 'text-accent-green' : 'text-accent-red'}`}>
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last month
        </p>
      )}
    </div>
  );
};

export default StatsCard;
