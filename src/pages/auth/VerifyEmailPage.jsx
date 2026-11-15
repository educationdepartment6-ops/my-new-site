import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import SEO from '../../seo/SEO';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState('verifying'); // 'verifying' | 'success' | 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Missing verification token in URL.');
      return;
    }

    fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setStatus('success');
          setMessage(data.message || 'Your email address has been successfully verified.');
        } else {
          setStatus('error');
          setMessage(data.error || 'Invalid or expired verification token.');
        }
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.message || 'Failed to verify email. Please try again.');
      });
  }, [token]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 text-zinc-100 font-sans">
      <SEO title="Verify Email" description="Email verification for MOG WRLD customer account." noindex={true} />

      <div className="w-full max-w-md p-8 rounded-3xl bg-zinc-950/80 border border-zinc-800 text-center shadow-2xl space-y-6">
        {status === 'verifying' && (
          <div className="space-y-4 py-6">
            <Loader2 className="w-10 h-10 animate-spin text-emerald-400 mx-auto" />
            <h2 className="text-lg font-bold text-white font-mono">Verifying Email Address...</h2>
            <p className="text-xs text-zinc-400">Please wait while we confirm your account security credentials.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4 py-4 animate-fade-in">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-bold text-white font-mono">Email Verified!</h2>
            <p className="text-xs text-zinc-400 leading-relaxed">{message}</p>
            <div className="pt-2">
              <Link
                to="/login"
                className="w-full py-3 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs uppercase tracking-wider inline-flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/10"
              >
                <span>Proceed to Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4 py-4 animate-fade-in">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-bold text-white font-mono">Verification Failed</h2>
            <p className="text-xs text-red-400/90 leading-relaxed">{message}</p>
            <div className="pt-2 flex flex-col gap-2">
              <Link
                to="/register"
                className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-200 font-mono transition-colors"
              >
                Register Again
              </Link>
              <Link
                to="/login"
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs uppercase tracking-wider transition-colors"
              >
                Back to Sign In
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
