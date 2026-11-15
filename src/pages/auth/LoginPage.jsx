import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import SEO from '../../seo/SEO';
import { useCustomerAuthStore } from '../../store/useCustomerAuthStore';
import { safeApiFetch } from '../../utils/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isUnverified, setIsUnverified] = useState(false);
  const [resendStatus, setResendStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/account';

  const navigate = useNavigate();
  const login = useCustomerAuthStore((state) => state.login);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsUnverified(false);
    setIsLoading(true);

    try {
      await login(email.trim(), password);
      navigate(redirectPath, { replace: true });
    } catch (err) {
      if (err.message?.toLowerCase().includes('verify your email')) {
        setIsUnverified(true);
      }
      setError(err.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await safeApiFetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });
      setResendStatus('Verification link dispatched. Please check your inbox.');
    } catch (_) {
      setResendStatus('If valid, a verification email has been resent.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans antialiased text-zinc-100">
      <SEO
        title="Customer Sign In"
        description="Sign in to your MOG WRLD customer research portal."
        canonicalPath="/login"
        noindex={true}
      />

      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[var(--ink)]">
            Sign In
          </h1>
          <p className="text-xs text-[var(--ink-muted)]">
            Sign in to view your orders and saved addresses.
          </p>
        </div>

        <div className="p-6 sm:p-8 rounded-3xl bg-zinc-950/80 border border-zinc-800 shadow-2xl backdrop-blur-xl space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              <div className="space-y-1">
                <span className="leading-relaxed block">{error}</span>
                {isUnverified && (
                  <button
                    type="button"
                    onClick={handleResend}
                    className="text-emerald-400 underline font-mono text-[11px] block mt-1 hover:text-emerald-300 cursor-pointer"
                  >
                    Resend verification email
                  </button>
                )}
              </div>
            </div>
          )}

          {resendStatus && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{resendStatus}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-zinc-400 mb-1 font-mono font-medium">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-zinc-400 font-mono font-medium">Password</label>
                <Link
                  to="/forgot-password"
                  className="text-[11px] text-zinc-400 hover:text-emerald-400 font-mono transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/10 disabled:opacity-50 cursor-pointer mt-4"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-zinc-800/80 text-center text-xs text-zinc-400">
            <span>Don't have an account yet? </span>
            <Link to="/register" className="text-emerald-400 hover:text-emerald-300 font-semibold">
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
