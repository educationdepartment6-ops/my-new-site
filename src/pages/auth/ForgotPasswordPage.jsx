import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import SEO from '../../seo/SEO';
import { safeApiFetch } from '../../utils/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await safeApiFetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });
      setSubmitted(true);
    } catch (_) {
      setSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 text-zinc-100 font-sans">
      <SEO title="Forgot Password" description="Request password reset for MOG WRLD customer account." noindex={true} />

      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[var(--ink)]">
            Reset Account Password
          </h1>
          <p className="text-xs text-[var(--ink-muted)]">
            Enter your registered institutional email to receive a single-use reset link.
          </p>
        </div>

        <div className="p-6 sm:p-8 rounded-3xl bg-zinc-950/80 border border-zinc-800 shadow-2xl backdrop-blur-xl space-y-5">
          {submitted ? (
            <div className="text-center space-y-4 py-2 animate-fade-in">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-base font-bold text-white font-mono">Reset Link Dispatched</h2>
              <p className="text-xs text-zinc-400 leading-relaxed">
                If an account exists for <strong className="text-zinc-200">{email}</strong>, a password reset link has been sent. The link expires in 30 minutes.
              </p>
              <div className="pt-2">
                <Link
                  to="/login"
                  className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-200 font-mono inline-block"
                >
                  Return to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-zinc-400 mb-1 font-mono font-medium">Registered Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="researcher@institution.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/10 disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>Send Password Reset Link</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-3 text-center">
                <Link to="/login" className="text-zinc-500 hover:text-zinc-300 font-mono text-[11px]">
                  Remember your password? Sign in
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
