import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * Login Page - Premium first impression
 *
 * Design: Editorial meets brutalist
 * - Deep blue-black background with subtle gradients
 * - Electric cyan accents that cut through the darkness
 * - Confident typography with Space Grotesk
 * - Smooth, satisfying interactions
 */
export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const validateForm = () => {
    setError('');

    if (!email.trim()) {
      setError('Email is required');
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }

    if (!password) {
      setError('Password is required');
      return false;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }

    if (mode === 'register' && !displayName.trim()) {
      setError('Display name is required');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setError('');

    try {
      if (mode === 'login') {
        await login(email, password);
        navigate(from, { replace: true });
      } else {
        await register(email, password, displayName);
        navigate('/onboarding', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-herald-black relative overflow-hidden">
      {/* Ambient glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-herald-accent/5 blur-3xl rounded-full" />
      <div className="absolute bottom-0 left-1/4 w-[600px] h-[300px] bg-herald-warm/5 blur-3xl rounded-full" />

      <div className="relative w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-herald-accent rounded flex items-center justify-center shadow-[0_0_30px_rgba(0,240,255,0.4)]">
              <span className="font-display font-bold text-herald-black text-xl">H</span>
            </div>
            <span className="font-display font-bold text-3xl tracking-tight herald-brand">
              HERALD
            </span>
          </div>
          <p className="text-herald-text-muted text-sm font-mono uppercase tracking-wider">
            Your personalized news reader
          </p>
        </div>

        {/* Card */}
        <div className="bg-herald-surface border border-herald-border rounded-xl shadow-2xl p-8">
          {/* Tab toggle */}
          <div className="flex bg-herald-black/50 rounded-lg p-1 mb-8">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-2.5 font-mono text-xs font-medium uppercase tracking-wider rounded-md transition-all duration-200 herald-press ${
                mode === 'login'
                  ? 'bg-herald-surface-hover text-herald-accent'
                  : 'text-herald-text-muted hover:text-herald-text-secondary'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`flex-1 py-2.5 font-mono text-xs font-medium uppercase tracking-wider rounded-md transition-all duration-200 herald-press ${
                mode === 'register'
                  ? 'bg-herald-surface-hover text-herald-accent'
                  : 'text-herald-text-muted hover:text-herald-text-secondary'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm animate-fade-in">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'register' && (
              <div>
                <label
                  htmlFor="displayName"
                  className="block font-mono text-xs text-herald-text-muted uppercase tracking-wider mb-2"
                >
                  Display Name
                </label>
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="How should we call you?"
                  className="w-full px-4 py-3 bg-herald-black/50 border border-herald-border rounded-lg text-herald-text placeholder-herald-text-muted focus:outline-none focus:border-herald-accent focus:ring-1 focus:ring-herald-accent/50 transition-all duration-200"
                />
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block font-mono text-xs text-herald-text-muted uppercase tracking-wider mb-2"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-herald-black/50 border border-herald-border rounded-lg text-herald-text placeholder-herald-text-muted focus:outline-none focus:border-herald-accent focus:ring-1 focus:ring-herald-accent/50 transition-all duration-200"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block font-mono text-xs text-herald-text-muted uppercase tracking-wider mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className="w-full px-4 py-3 bg-herald-black/50 border border-herald-border rounded-lg text-herald-text placeholder-herald-text-muted focus:outline-none focus:border-herald-accent focus:ring-1 focus:ring-herald-accent/50 transition-all duration-200"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-herald-accent hover:bg-herald-accent-dim text-herald-black font-mono font-bold uppercase tracking-wider rounded-lg shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:shadow-[0_0_30px_rgba(0,240,255,0.5)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 herald-press"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>{mode === 'login' ? 'Signing in...' : 'Creating account...'}</span>
                </>
              ) : (
                <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-herald-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-herald-surface text-herald-text-muted font-mono text-xs uppercase tracking-wider">
                Or continue with
              </span>
            </div>
          </div>

          {/* Social buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              disabled
              className="flex items-center justify-center gap-2 py-3 px-4 bg-herald-surface-hover border border-herald-border rounded-lg text-herald-text-muted hover:text-herald-text-secondary hover:border-herald-text-muted transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed herald-press"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span className="font-mono text-xs uppercase tracking-wider">Google</span>
            </button>
            <button
              type="button"
              disabled
              className="flex items-center justify-center gap-2 py-3 px-4 bg-herald-surface-hover border border-herald-border rounded-lg text-herald-text-muted hover:text-herald-text-secondary hover:border-herald-text-muted transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed herald-press"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              <span className="font-mono text-xs uppercase tracking-wider">GitHub</span>
            </button>
          </div>

          {/* Coming soon notice */}
          <p className="text-center text-herald-text-muted text-xs mt-4 font-mono uppercase tracking-wider">
            Social login coming soon
          </p>
        </div>

        {/* Footer link */}
        <p className="text-center text-herald-text-muted text-sm mt-8">
          {mode === 'login' ? (
            <>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={toggleMode}
                className="text-herald-accent hover:text-herald-accent-dim font-medium transition-colors herald-glow"
              >
                Create one
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                type="button"
                onClick={toggleMode}
                className="text-herald-accent hover:text-herald-accent-dim font-medium transition-colors herald-glow"
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

export default Login;
