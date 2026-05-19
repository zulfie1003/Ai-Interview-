import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Terminal, Zap, Shield, ChevronRight, Code2, Server, Users,
  Star, ArrowRight, CheckCircle2
} from 'lucide-react';

const features = [
  {
    icon: Code2,
    title: 'DSA & Algorithms',
    desc: 'LeetCode-style questions with complexity analysis and optimal solution guidance.',
    color: 'text-accent-cyan',
    bg: 'bg-accent-cyan/5',
    border: 'border-accent-cyan/15',
  },
  {
    icon: Server,
    title: 'System Design',
    desc: 'Design scalable systems like Netflix, Twitter, Uber with real-time feedback.',
    color: 'text-purple-400',
    bg: 'bg-accent-purple/5',
    border: 'border-accent-purple/15',
  },
  {
    icon: Users,
    title: 'Behavioral Rounds',
    desc: 'STAR method evaluation for leadership, conflict, and career scenarios.',
    color: 'text-accent-green',
    bg: 'bg-accent-green/5',
    border: 'border-accent-green/15',
  },
  {
    icon: Zap,
    title: 'Instant AI Feedback',
    desc: 'Powered by Groq — get real evaluations after every answer.',
    color: 'text-accent-yellow',
    bg: 'bg-accent-yellow/5',
    border: 'border-accent-yellow/15',
  },
];

const verdictBadge = (v) => {
  const map = { hire: ['HIRE', 'badge-green'], 'weak-hire': ['WEAK HIRE', 'badge-yellow'], 'no-hire': ['NO HIRE', 'badge-red'] };
  const [label, cls] = map[v];
  return <span className={`badge ${cls}`}>{label}</span>;
};

const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-dark-950 grid-bg scanline">
      {/* Navbar */}
      <nav className="border-b border-dark-700 bg-dark-950/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-accent-cyan/10 border border-accent-cyan/30 rounded-lg flex items-center justify-center">
              <Terminal className="w-4 h-4 text-accent-cyan" />
            </div>
            <span className="font-display font-bold text-white tracking-tight">AI-Interview</span>
            <span className="badge-cyan text-xs">BETA</span>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <button onClick={() => navigate('/dashboard')} className="btn-primary text-sm py-2 px-4">
                Dashboard <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button onClick={() => navigate('/login')} className="btn-ghost text-sm">
                  Sign In
                </button>
                <button onClick={() => navigate('/register')} className="btn-primary text-sm py-2 px-4">
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-accent-cyan/20 bg-accent-cyan/5 mb-8 animate-fade-in">
          <div className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
          <span className="text-xs font-mono text-accent-cyan">Powered by Groq AI</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-display font-bold text-white leading-tight mb-6 animate-slide-up">
          Practice with{' '}
          <span className="text-gradient-cyan">Alex</span>
          <br />
          <span className="text-3xl md:text-5xl text-gray-400">Your AI Interviewer</span>
        </h1>

        <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in">
          Prepare for FAANG-level technical interviews with an AI that acts like a strict senior engineer.
          Real feedback. Real pressure. Real growth.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up">
          <button
            onClick={() => navigate(isAuthenticated ? '/interview/new' : '/register')}
            className="btn-primary text-base px-8 py-4"
          >
            Start Free Interview <ArrowRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
            className="btn-outline text-base px-8 py-4"
          >
            View Dashboard
          </button>
        </div>

        {/* Social proof */}
        <div className="flex items-center justify-center gap-6 mt-10 text-sm text-gray-500 font-mono animate-fade-in">
          <div className="flex items-center gap-1.5">
            <Star className="w-4 h-4 text-accent-yellow fill-accent-yellow" />
            <span>FAANG-style questions</span>
          </div>
          <div className="w-px h-4 bg-dark-600" />
          <div className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-accent-green" />
            <span>Real-time evaluation</span>
          </div>
          <div className="w-px h-4 bg-dark-600" />
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-accent-cyan" />
            <span>Instant scoring</span>
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-display font-bold text-white text-center mb-3">
          Everything you need to land the offer
        </h2>
        <p className="text-gray-500 text-center mb-10 font-mono text-sm">
          Four interview modes. One AI. Relentless feedback.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f) => (
            <div key={f.title} className={`p-5 rounded-xl border ${f.bg} ${f.border} group hover:scale-[1.02] transition-transform duration-200`}>
              <div className={`w-10 h-10 rounded-xl ${f.bg} border ${f.border} flex items-center justify-center mb-4`}>
                <f.icon className={`w-5 h-5 ${f.color}`} />
              </div>
              <h3 className="font-semibold text-white mb-2 text-sm">{f.title}</h3>
              <p className="text-xs text-gray-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Meet Alex */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="card border-accent-cyan/20 bg-gradient-to-br from-accent-cyan/5 to-transparent overflow-hidden">
          <div className="flex flex-col md:flex-row items-start gap-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-cyan/30 to-accent-purple/20 border border-accent-cyan/30 flex items-center justify-center shrink-0 glow-cyan">
              <span className="text-2xl font-display font-bold text-accent-cyan">A</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-xl font-display font-bold text-white">Meet Alex</h2>
                <span className="badge-cyan">AI Interviewer</span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed mb-4 max-w-2xl">
                Alex is your strict, no-nonsense senior engineer interviewer. Trained on FAANG interview patterns,
                Alex challenges weak answers, demands structured thinking, and evaluates you exactly how a real
                interviewer would — without mercy, but with purpose.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  'Challenges vague answers',
                  'Asks follow-up questions',
                  'Evaluates complexity',
                  'STAR method scoring',
                  'Real-time feedback',
                  'Final verdict + scores',
                ].map((trait) => (
                  <div key={trait} className="flex items-center gap-2 text-xs text-gray-400 font-mono">
                    <CheckCircle2 className="w-3 h-3 text-accent-cyan shrink-0" />
                    {trait}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Scoring preview */}
      <section className="max-w-6xl mx-auto px-6 pb-24 text-center">
        <h2 className="text-2xl font-display font-bold text-white mb-3">Detailed Scoring & Verdict</h2>
        <p className="text-gray-500 font-mono text-sm mb-8">
          Get scored across four dimensions after every interview session.
        </p>
        <div className="inline-flex items-center gap-4 flex-wrap justify-center">
          {verdictBadge('hire')}
          {verdictBadge('weak-hire')}
          {verdictBadge('no-hire')}
        </div>
        <p className="text-xs text-gray-600 font-mono mt-4">
          Communication · Technical Accuracy · Problem Solving · Confidence
        </p>
      </section>

      {/* CTA */}
      <section className="border-t border-dark-700 py-16 text-center">
        <h2 className="text-3xl font-display font-bold text-white mb-4">Ready to face Alex?</h2>
        <p className="text-gray-400 mb-8 font-mono text-sm">No setup needed. Start your first interview in 30 seconds.</p>
        <button
          onClick={() => navigate(isAuthenticated ? '/interview/new' : '/register')}
          className="btn-primary text-base px-10 py-4"
        >
          Start Interview Now <ArrowRight className="w-5 h-5" />
        </button>
      </section>

      {/* Footer */}
      <footer className="border-t border-dark-800 py-8 text-center">
        <p className="text-xs text-gray-600 font-mono">
          AI-Interview — Built with React, Node.js, MongoDB & Groq
        </p>
      </footer>
    </div>
  );
};

export default HomePage;
