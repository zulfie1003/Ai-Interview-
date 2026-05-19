import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  MessageSquare,
  History,
  LogOut,
  Terminal,
  ChevronRight,
  Zap,
} from 'lucide-react';

const NavItem = ({ to, icon: Icon, label, end = false }) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group
      ${isActive
        ? 'bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20'
        : 'text-gray-400 hover:text-white hover:bg-dark-700'
      }`
    }
  >
    <Icon className="w-4 h-4 shrink-0" />
    <span>{label}</span>
    <ChevronRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
  </NavLink>
);

const Sidebar = ({ mobile = false, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className={`flex flex-col h-full bg-dark-900 border-r border-dark-700 ${mobile ? 'w-full' : 'w-64'}`}>
      {/* Logo */}
      <div className="p-5 border-b border-dark-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-accent-cyan/10 border border-accent-cyan/30 rounded-lg flex items-center justify-center">
            <Terminal className="w-4 h-4 text-accent-cyan" />
          </div>
          <div>
            <span className="font-display font-bold text-white tracking-tight">AI-Interview</span>
            <div className="flex items-center gap-1 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
              <span className="text-xs text-gray-500 font-mono">LIVE</span>
            </div>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="px-4 py-3 border-b border-dark-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-cyan/30 to-accent-purple/30 flex items-center justify-center text-sm font-bold text-white border border-dark-600">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 font-mono truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <p className="px-4 pt-2 pb-1 text-xs font-mono text-gray-600 uppercase tracking-wider">Navigation</p>
        <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" end />
        <NavItem to="/interview/new" icon={Zap} label="New Interview" />
        <NavItem to="/history" icon={History} label="History" />

        <p className="px-4 pt-4 pb-1 text-xs font-mono text-gray-600 uppercase tracking-wider">Interview Types</p>
        <NavItem to="/interview/new?category=dsa" icon={MessageSquare} label="DSA & Algorithms" />
        <NavItem to="/interview/new?category=system-design" icon={MessageSquare} label="System Design" />
        <NavItem to="/interview/new?category=oops" icon={MessageSquare} label="OOP Concepts" />
        <NavItem to="/interview/new?category=computer-network" icon={MessageSquare} label="Computer Networks" />
        <NavItem to="/interview/new?category=dbms" icon={MessageSquare} label="DBMS" />
        <NavItem to="/interview/new?category=operating-system" icon={MessageSquare} label="Operating Systems" />
        <NavItem to="/interview/new?category=behavioral" icon={MessageSquare} label="Behavioral" />
        <NavItem to="/interview/new?category=mixed" icon={MessageSquare} label="Mixed Interview" />
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-dark-700">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-400 hover:text-accent-red hover:bg-accent-red/5 transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
