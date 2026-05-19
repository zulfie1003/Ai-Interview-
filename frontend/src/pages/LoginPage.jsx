import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Terminal, Eye, EyeOff, AlertCircle } from 'lucide-react';

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 grid-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-6 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-accent-cyan/10 border border-accent-cyan/30 rounded-xl flex items-center justify-center">
              <Terminal className="w-5 h-5 text-accent-cyan" />
            </div>
            <span className="font-display font-bold text-xl text-white">AI-Interview</span>
          </Link>
          <h1 className="text-2xl font-display font-bold text-white mb-1">Welcome back</h1>
          <p className="text-sm text-gray-500 font-mono">Sign in to continue practicing</p>
        </div>

        {/* Card */}
        <div className="card border-dark-600">
          {error && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-accent-red/10 border border-accent-red/20 mb-5 text-sm text-accent-red">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email Address</label>
              <input
                type="email"
                className="input-field"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input-field pr-11"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary justify-center py-3 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-dark-950/50 border-t-dark-950 rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6 font-mono">
          Don't have an account?{' '}
          <Link to="/register" className="text-accent-cyan hover:underline font-semibold">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
