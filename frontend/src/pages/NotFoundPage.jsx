import { useNavigate } from 'react-router-dom';
import { Terminal, ArrowLeft } from 'lucide-react';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-dark-950 grid-bg flex items-center justify-center px-4">
      <div className="text-center animate-fade-in">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-dark-800 border border-dark-600 rounded-2xl mb-6">
          <Terminal className="w-8 h-8 text-accent-cyan" />
        </div>
        <p className="text-accent-cyan font-mono text-sm mb-2">ERROR 404</p>
        <h1 className="text-5xl font-display font-bold text-white mb-4">Page Not Found</h1>
        <p className="text-gray-400 font-mono text-sm mb-8 max-w-md mx-auto">
          The route you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => navigate(-1)} className="btn-ghost">
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
          <button onClick={() => navigate('/')} className="btn-primary">
            Home Page
          </button>
        </div>
        <div className="mt-10 p-4 rounded-xl bg-dark-800 border border-dark-700 text-left max-w-xs mx-auto">
          <p className="text-xs font-mono text-gray-500 mb-1">$ debug: route</p>
          <p className="text-xs font-mono text-accent-red">
            ✗ Route "{window.location.pathname}" not found
          </p>
          <p className="text-xs font-mono text-gray-600 mt-1">
            Try: /dashboard, /login, /register
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
