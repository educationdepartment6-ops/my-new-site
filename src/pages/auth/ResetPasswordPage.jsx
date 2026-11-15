import React, { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import SEO from '../../seo/SEO';
import { safeApiFetch } from '../../utils/api';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const navigate = useNavigate();

  const hasLetter = /[A-Za-z]/.test(newPassword);
  const hasNumber = /\d/.test(newPassword);
  const hasMinLength = newPassword.length >= 8;
  const isPasswordValid = hasLetter && hasNumber && hasMinLength;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Missing reset token in URL.');
      return;
    }

    if (!isPasswordValid) {
      setError('Password must be at least 8 characters long and contain both letters and numbers.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      await safeApiFetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword, confirmPassword })
      });

      setIsSuccess(true);
    } catch (err) {
      setError(err.message || 'Password reset failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 text-zinc-100 font-sans">
      <SEO title="Set New Password" description="Reset password for MOG WRLD customer account." noindex={true} />

      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[var(--ink)]">
            Create New Password
          </h1>
          <p className="text-xs text-[var(--ink-muted)]">
            Set a new secure password. This will automatically log out all other active sessions.
          </p>
        </div>

        <div className="p-6 sm:p-8 rounded-3xl bg-zinc-950/80 border border-zinc-800 shadow-2xl backdrop-blur-xl space-y-5">
          {isSuccess ? (
            <div className="text-center space-y-4 py-2 animate-fade-in">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-base font-bold text-white font-mono">Password Successfully Reset</h2>
              <p className="text-xs text-zinc-400 leading-relaxed">
                All other active sessions have been invalidated. You can now sign in using your new credentials.
              </p>
              <div className="pt-2">
                <Link
                  to="/login"
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs uppercase tracking-wider inline-flex items-center justify-center gap-2"
                >
                  <span>Sign In Now</span>
                  <ArrowRight className="w-4 h-4" />
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
                <label className="block text-zinc-400 mb-1 font-mono font-medium">New Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <div className="mt-2 p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-1 text-[11px] font-mono">
                  <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-400' : 'text-zinc-500'}`}>
                    <span>{hasMinLength ? '✓' : '○'}</span>
                    <span>At least 8 characters</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasLetter && hasNumber ? 'text-emerald-400' : 'text-zinc-500'}`}>
                    <span>{hasLetter && hasNumber ? '✓' : '○'}</span>
                    <span>Contains letters and numbers</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-mono font-medium">Confirm New Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500 font-mono"
                  />
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
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <span>Reset Password</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
