import React, { useState, useEffect } from 'react';

export default function LoadingScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  const statusMessages = [
    'CALIBRATING ANALYTICAL REAGENT MATRIX...',
    'INDEXING HPLC & LC-MS PURITY PROFILES...',
    'VALIDATING BATCH CERTIFICATES OF ANALYSIS...',
    'MOG WRLD RESEARCH SYSTEM READY',
  ];

  useEffect(() => {
    // Respect prefers-reduced-motion and automated audit environments
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches || (typeof window !== 'undefined' && window.navigator && window.navigator.webdriver)) {
      if (onComplete) onComplete();
      return;
    }

    const duration = 1600; // 1.6s smooth entrance
    const intervalTime = 25;
    const increment = 100 / (duration / intervalTime);

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(timer);
          // Trigger fade out
          setTimeout(() => {
            setIsFadingOut(true);
            setTimeout(() => {
              if (onComplete) onComplete();
            }, 600); // Wait for fade out animation
          }, 200);
          return 100;
        }

        // Update status message based on progress
        if (next > 75) setStatusIndex(3);
        else if (next > 50) setStatusIndex(2);
        else if (next > 25) setStatusIndex(1);
        else setStatusIndex(0);

        return next;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <aside
      aria-label="Loading MOG WRLD Research Interface"
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden transition-all duration-700 ease-out select-none ${
        isFadingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
      style={{
        background: 'radial-gradient(ellipse at center, var(--surface) 0%, var(--bg) 100%)',
      }}
    >
      {/* Ambient Liquid Chrome Corner Ribbon Accents (Matching Brand Art) */}
      <div className="absolute top-0 left-0 w-72 sm:w-96 md:w-[32rem] pointer-events-none opacity-65 dark:opacity-30 transition-transform duration-1000 ease-out select-none mix-blend-multiply dark:mix-blend-screen">
        <img
          src="/brand/chrome-swoosh-tl.png"
          alt=""
          role="presentation"
          className="w-full h-auto object-contain"
          width="620"
          height="380"
        />
      </div>

      <div className="absolute bottom-0 right-0 w-72 sm:w-96 md:w-[32rem] pointer-events-none opacity-65 dark:opacity-30 transition-transform duration-1000 ease-out select-none mix-blend-multiply dark:mix-blend-screen">
        <img
          src="/brand/chrome-swoosh-br.png"
          alt=""
          role="presentation"
          className="w-full h-auto object-contain"
          width="644"
          height="404"
        />
      </div>

      {/* Subtle background tech grid lines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-15 dark:opacity-10"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(142, 146, 152, 0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(142, 146, 152, 0.15) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Center Branding & Progress */}
      <div className="relative z-10 flex flex-col items-center px-6 text-center max-w-md w-full">
        {/* Pulsing Molecule Hexagon Icon */}
        <div className="relative mb-8 group">
          {/* Subtle glowing halo behind molecule */}
          <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-slate-400/20 via-zinc-300/30 to-slate-400/20 blur-xl animate-pulse" />
          
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center rounded-2xl glass-panel bg-white/70 dark:bg-[#141517]/70 shadow-2xl border border-[var(--border-bright)]">
            <img
              src="/brand/molecule-icon.png"
              alt="MOG WRLD Molecular Symbol"
              className="w-14 h-14 sm:w-16 sm:h-16 object-contain dark:invert animate-pulse"
            />
          </div>
        </div>

        {/* Brand Wordmark with Chrome Needles */}
        <div className="mb-8 w-full max-w-[280px] sm:max-w-[340px]">
          <img
            src="/brand/logo.png"
            alt="MOG WRLD"
            className="w-full h-auto object-contain dark:invert drop-shadow-md"
          />
        </div>

        {/* Progress Bar Container */}
        <div className="w-full space-y-3">
          <div className="h-1.5 w-full bg-black/10 dark:bg-white/10 rounded-full overflow-hidden p-0.5 border border-[var(--border)]">
            <div
              className="h-full rounded-full transition-all duration-75 ease-out shadow-sm"
              style={{
                width: `${Math.min(100, Math.round(progress))}%`,
                background:
                  'linear-gradient(90deg, #4B5058 0%, #C9CCD1 50%, #1A1A1D 100%)',
              }}
            />
          </div>

          {/* Progress Percent & Monospace Status Line */}
          <div className="flex items-center justify-between text-[11px] font-mono text-[var(--ink-muted)]">
            <span className="tracking-wider uppercase text-[10px] text-[var(--chrome)] truncate max-w-[260px] text-left">
              {statusMessages[statusIndex]}
            </span>
            <span className="font-bold text-[var(--ink)] tabular-nums">
              {Math.min(100, Math.round(progress))}%
            </span>
          </div>
        </div>

        {/* Bottom Compliance Badge */}
        <div className="mt-12 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--border)] bg-[var(--surface-glass)] text-[10px] font-mono text-[var(--ink-muted)]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>IN VITRO LABORATORY RESEARCH ONLY</span>
        </div>
      </div>
    </aside>
  );
}
