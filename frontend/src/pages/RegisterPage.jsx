import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GoogleSignInButton from '../components/auth/GoogleSignInButton';
import { Terminal, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';

const RegisterPage = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const passwordStrength = () => {
    const p = form.password;
    if (p.length === 0) return null;
    if (p.length < 6) return { level: 0, label: 'Too short', color: 'bg-accent-red' };
    if (p.length < 8) return { level: 1, label: 'Weak', color: 'bg-accent-yellow' };
    if (p.length >= 8 && /[A-Z]/.test(p) && /[0-9]/.test(p)) return { level: 3, label: 'Strong', color: 'bg-accent-green' };
    return { level: 2, label: 'Fair', color: 'bg-accent-cyan' };
  };

  const strength = passwordStrength();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 grid-bg flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-6 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-accent-cyan/10 border border-accent-cyan/30 rounded-xl flex items-center justify-center">
              <Terminal className="w-5 h-5 text-accent-cyan" />
            </div>
            <span className="font-display font-bold text-xl text-white">AI-Interview</span>
          </Link>
          <h1 className="text-2xl font-display font-bold text-white mb-1">Create account</h1>
          <p className="text-sm text-gray-500 font-mono">Start your interview prep journey</p>
        </div>

        <div className="card border-dark-600">
          {error && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-accent-red/10 border border-accent-red/20 mb-5 text-sm text-accent-red">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <GoogleSignInButton label="Sign up directly with Google" />

          <div className="flex items-center gap-3 my-5">
            <div className="h-px bg-dark-600 flex-1" />
            <span className="text-xs text-gray-600 font-mono">or create with email</span>
            <div className="h-px bg-dark-600 flex-1" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input
                type="text"
                className="input-field"
                placeholder="John Doe"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                minLength={2}
              />
            </div>

            <div>
              <label className="label">Email Address</label>
              <input
                type="email"
                className="input-field"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input-field pr-11"
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {strength && (
                <div className="mt-2 space-y-1.5">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          i <= strength.level - 1 ? strength.color : 'bg-dark-600'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs font-mono text-gray-500">{strength.label}</p>
                </div>
              )}
            </div>

            <div>
              <label className="label">Confirm Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input-field pr-11"
                  placeholder="Repeat your password"
                  value={form.confirm}
                  onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                  required
                />
                {form.confirm && form.password === form.confirm && (
                  <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent-green" />
                )}
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
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6 font-mono">
          Already have an account?{' '}
          <Link to="/login" className="text-accent-cyan hover:underline font-semibold">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
