import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, CheckCircle2, AlertCircle, ArrowRight, Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react';
import SEO from '../../seo/SEO';
import { safeApiFetch } from '../../utils/api';
import { useCustomerAuthStore } from '../../store/useCustomerAuthStore';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState(null);

  const hasLetter = /[A-Za-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasMinLength = password.length >= 8;
  const isPasswordValid = hasLetter && hasNumber && hasMinLength;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isPasswordValid) {
      setError('Password must be at least 8 characters long and contain both letters and numbers.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!agreeTerms) {
      setError('You must agree to the Terms of Supply & Privacy Policy.');
      return;
    }

    setIsLoading(true);

    try {
      await safeApiFetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          password,
          confirmPassword,
          agreeTerms
        })
      });

      // Sync customer auth state
      try {
        useCustomerAuthStore.getState().checkAuth();
      } catch (_) {}

      setIsSuccess(true);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setResendStatus(null);
    try {
      await safeApiFetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });
      setResendStatus('Verification link resent. Please check your inbox.');
    } catch (_) {
      setResendStatus('If applicable, a new verification email was sent.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans antialiased text-zinc-100">
      <SEO
        title="Create Customer Account"
        description="Register a verified laboratory research customer account with MOG WRLD."
        canonicalPath="/register"
        noindex={true}
      />

      <div className="w-full max-w-md space-y-6">
        {/* Top Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[var(--ink)]">
            Create an Account
          </h1>
          <p className="text-xs text-[var(--ink-muted)]">
            Create an account to save your address and track orders.
          </p>
        </div>

        {isSuccess ? (
          <div className="p-8 rounded-3xl bg-zinc-950/80 border border-zinc-800 shadow-2xl backdrop-blur-xl text-center space-y-5 animate-fade-in">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-bold text-white font-mono">Verification Email Sent</h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              If <strong className="text-zinc-200">{email}</strong> can be registered, we have sent a secure verification link valid for 24 hours. Please click the link to activate your account.
            </p>

            {resendStatus && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
                {resendStatus}
              </div>
            )}

            <div className="pt-3 border-t border-zinc-800 flex flex-col gap-2.5">
              <Link
                to="/account"
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs uppercase tracking-wider transition-colors inline-block text-center"
              >
                Go to My Account
              </Link>
              <Link
                to="/login"
                className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-200 font-mono transition-colors inline-block text-center"
              >
                Go to Sign In
              </Link>
              <button
                onClick={handleResend}
                disabled={resending}
                className="w-full py-2 rounded-xl text-[11px] text-zinc-400 hover:text-zinc-300 font-mono transition-colors disabled:opacity-50 cursor-pointer"
              >
                {resending ? 'Sending...' : 'Resend Verification Email'}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 sm:p-8 rounded-3xl bg-zinc-950/80 border border-zinc-800 shadow-2xl backdrop-blur-xl space-y-5">
            {error && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2 animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1 font-mono font-medium">Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Jane Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-mono font-medium">Email Address *</label>
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
                <label className="block text-zinc-400 mb-1 font-mono font-medium">Phone Number (Optional)</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-mono font-medium">Password *</label>
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

                {/* Password Strength Checklist */}
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
                <label className="block text-zinc-400 mb-1 font-mono font-medium">Confirm Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                  />
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-2.5 cursor-pointer text-[11px] text-zinc-400 leading-relaxed select-none">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 rounded border-zinc-800 bg-zinc-900 text-emerald-500 focus:ring-0 cursor-pointer"
                  />
                  <span>
                    I confirm that I am at least 18 years old and agree to the{' '}
                    <Link to="/legal/terms" target="_blank" className="text-emerald-400 underline hover:text-emerald-300">
                      Terms of Supply
                    </Link>{' '}
                    and{' '}
                    <Link to="/legal/privacy" target="_blank" className="text-emerald-400 underline hover:text-emerald-300">
                      Privacy Policy
                    </Link>
                    .
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/10 disabled:opacity-50 cursor-pointer mt-4"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Register Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-4 border-t border-zinc-800/80 text-center text-xs text-zinc-400">
              <span>Already registered? </span>
              <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-semibold">
                Sign in here
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
