import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const GoogleSignInButton = ({ label = 'Continue with Google' }) => {
  const buttonRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithGoogle } = useAuth();
  const [error, setError] = useState('');
  const [googleReady, setGoogleReady] = useState(Boolean(window.google?.accounts?.id));
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const isConfigured = Boolean(clientId && !clientId.startsWith('your_') && clientId.endsWith('.apps.googleusercontent.com'));
  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (googleReady) return undefined;

    const interval = window.setInterval(() => {
      if (window.google?.accounts?.id) {
        setGoogleReady(true);
        window.clearInterval(interval);
      }
    }, 100);

    return () => window.clearInterval(interval);
  }, [googleReady]);

  useEffect(() => {
    if (!isConfigured || !googleReady || !buttonRef.current) return;

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async ({ credential }) => {
        setError('');
        try {
          await loginWithGoogle(credential);
          navigate(from, { replace: true });
        } catch (err) {
          setError(err.response?.data?.message || 'Google sign-in failed.');
        }
      },
    });

    window.google.accounts.id.renderButton(buttonRef.current, {
      theme: 'filled_black',
      size: 'large',
      shape: 'rectangular',
      text: 'continue_with',
      width: 360,
    });
  }, [clientId, from, googleReady, isConfigured, loginWithGoogle, navigate]);

  if (!isConfigured) {
    return (
      <div className="rounded-xl border border-accent-yellow/20 bg-accent-yellow/5 p-4">
        <button
          type="button"
          disabled
          className="w-full h-11 rounded-lg border border-dark-600 bg-dark-700 text-sm font-semibold text-gray-500 cursor-not-allowed"
        >
          {label}
        </button>
        <p className="mt-2 text-xs text-accent-yellow font-mono">
          Add a real VITE_GOOGLE_CLIENT_ID in frontend/.env to enable Google login.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="rounded-xl border border-dark-600 bg-dark-800 p-3">
        <p className="text-xs text-gray-500 font-mono mb-3 text-center">{label}</p>
        <div className="flex justify-center overflow-hidden">
          <div ref={buttonRef} aria-label={label} />
        </div>
      </div>
      {!googleReady && (
        <p className="text-xs text-gray-500 font-mono text-center">Loading Google sign-in...</p>
      )}
      {error && (
        <div className="flex items-center gap-2 text-xs text-accent-red">
          <AlertCircle className="w-3.5 h-3.5" />
          {error}
        </div>
      )}
    </div>
  );
};

export default GoogleSignInButton;
