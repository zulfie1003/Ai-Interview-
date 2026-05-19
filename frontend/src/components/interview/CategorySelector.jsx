import { BookOpen, Code2, Cpu, Database, Network, Server, Users, Shuffle } from 'lucide-react';

const categories = [
  {
    id: 'dsa',
    label: 'DSA & Algorithms',
    description: 'Data structures, sorting, dynamic programming, graphs, and complexity analysis.',
    icon: Code2,
    color: 'cyan',
    tags: ['Arrays', 'Trees', 'DP', 'Graphs', 'Sorting'],
    difficulty: 'Hard',
  },
  {
    id: 'system-design',
    label: 'System Design',
    description: 'Design scalable distributed systems, databases, caching, and microservices.',
    icon: Server,
    color: 'purple',
    tags: ['Scalability', 'Databases', 'Caching', 'APIs'],
    difficulty: 'Hard',
  },
  {
    id: 'oops',
    label: 'OOP Concepts',
    description: 'Learn and practice object-oriented concepts, SOLID principles, and design examples.',
    icon: BookOpen,
    color: 'green',
    tags: ['Classes', 'Inheritance', 'Polymorphism', 'SOLID'],
    difficulty: 'Medium',
  },
  {
    id: 'computer-network',
    label: 'Computer Networks',
    description: 'OSI, TCP/IP, DNS, HTTP, routing, latency, sockets, and debugging.',
    icon: Network,
    color: 'cyan',
    tags: ['OSI', 'TCP/UDP', 'DNS', 'HTTP'],
    difficulty: 'Medium',
  },
  {
    id: 'dbms',
    label: 'DBMS',
    description: 'SQL, normalization, indexing, transactions, joins, locks, and database design.',
    icon: Database,
    color: 'purple',
    tags: ['SQL', 'ACID', 'Indexes', 'Joins'],
    difficulty: 'Medium',
  },
  {
    id: 'operating-system',
    label: 'Operating Systems',
    description: 'Processes, threads, scheduling, memory, deadlocks, synchronization, and file systems.',
    icon: Cpu,
    color: 'yellow',
    tags: ['Threads', 'Memory', 'Deadlocks', 'Paging'],
    difficulty: 'Medium',
  },
  {
    id: 'behavioral',
    label: 'Behavioral',
    description: 'Leadership, conflict resolution, teamwork, and career decisions using STAR method.',
    icon: Users,
    color: 'green',
    tags: ['Leadership', 'STAR', 'Teamwork', 'Growth'],
    difficulty: 'Medium',
  },
  {
    id: 'mixed',
    label: 'Mixed Interview',
    description: 'Combination of all types — warm-up behavioral, then deep technical rounds.',
    icon: Shuffle,
    color: 'yellow',
    tags: ['All Topics', 'Adaptive', 'Comprehensive'],
    difficulty: 'Variable',
  },
];

const colorMap = {
  cyan: {
    bg: 'bg-accent-cyan/5',
    border: 'border-accent-cyan/20',
    borderHover: 'hover:border-accent-cyan/60',
    icon: 'text-accent-cyan',
    iconBg: 'bg-accent-cyan/10',
    tag: 'bg-accent-cyan/10 text-accent-cyan',
    badge: 'text-accent-cyan',
    glow: 'hover:shadow-accent-cyan/10',
  },
  purple: {
    bg: 'bg-accent-purple/5',
    border: 'border-accent-purple/20',
    borderHover: 'hover:border-accent-purple/60',
    icon: 'text-purple-400',
    iconBg: 'bg-accent-purple/10',
    tag: 'bg-accent-purple/10 text-purple-400',
    badge: 'text-purple-400',
    glow: 'hover:shadow-accent-purple/10',
  },
  green: {
    bg: 'bg-accent-green/5',
    border: 'border-accent-green/20',
    borderHover: 'hover:border-accent-green/60',
    icon: 'text-accent-green',
    iconBg: 'bg-accent-green/10',
    tag: 'bg-accent-green/10 text-accent-green',
    badge: 'text-accent-green',
    glow: 'hover:shadow-accent-green/10',
  },
  yellow: {
    bg: 'bg-accent-yellow/5',
    border: 'border-accent-yellow/20',
    borderHover: 'hover:border-accent-yellow/60',
    icon: 'text-accent-yellow',
    iconBg: 'bg-accent-yellow/10',
    tag: 'bg-accent-yellow/10 text-accent-yellow',
    badge: 'text-accent-yellow',
    glow: 'hover:shadow-accent-yellow/10',
  },
};

const CategoryCard = ({ category, selected, onSelect }) => {
  const c = colorMap[category.color];
  const Icon = category.icon;

  return (
    <button
      onClick={() => onSelect(category.id)}
      className={`w-full text-left p-5 rounded-xl border transition-all duration-200 hover:scale-[1.01] hover:shadow-lg
        ${selected
          ? `${c.bg} ${c.border} border-2 shadow-lg`
          : `bg-dark-800 border-dark-600 ${c.borderHover}`
        }`}
    >
      <div className="flex items-start gap-4">
        <div className={`w-10 h-10 rounded-xl ${c.iconBg} flex items-center justify-center shrink-0`}>
          <Icon className={`w-5 h-5 ${c.icon}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <h3 className="font-semibold text-white text-sm">{category.label}</h3>
            <span className={`text-xs font-mono ${c.badge}`}>{category.difficulty}</span>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed mb-3">{category.description}</p>
          <div className="flex flex-wrap gap-1.5">
            {category.tags.map((tag) => (
              <span key={tag} className={`text-xs px-2 py-0.5 rounded font-mono ${c.tag}`}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
      {selected && (
        <div className={`mt-3 pt-3 border-t ${c.border} flex items-center gap-2`}>
          <div className={`w-2 h-2 rounded-full ${c.iconBg} ${c.icon} flex items-center justify-center`}>
            <div className={`w-1 h-1 rounded-full bg-current`} />
          </div>
          <span className={`text-xs font-mono ${c.badge}`}>Selected — Ready to begin</span>
        </div>
      )}
    </button>
  );
};

const CategorySelector = ({ selected, onSelect }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
    {categories.map((cat) => (
      <CategoryCard
        key={cat.id}
        category={cat}
        selected={selected === cat.id}
        onSelect={onSelect}
      />
    ))}
  </div>
);

export default CategorySelector;
