import React, { useState, useEffect } from 'react';
import { UserCheck, KeyRound, ShieldAlert, History, Check, Loader2 } from 'lucide-react';

export default function AdminAccount() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await fetch('/api/admin/logs/admin');
      const data = await res.json();
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage(null);
    setSaving(true);

    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update password');

      setMessage({ type: 'success', text: 'Master password successfully updated and persisted.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      fetchLogs();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold font-mono tracking-tight text-white flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-emerald-400" />
          <span>Security & Activity Audit Log</span>
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Master account credentials, security configuration, and real-time audit ledger.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Change Password Form */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-3xl bg-zinc-950/70 border border-zinc-800 space-y-4">
            <h2 className="text-sm font-semibold font-mono text-zinc-200 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-emerald-400" />
              <span>Change Master Password</span>
            </h2>

            {message && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  message.type === 'success'
                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                    : 'bg-red-500/10 border border-red-500/20 text-red-400'
                }`}
              >
                {message.type === 'success' ? (
                  <Check className="w-4 h-4 shrink-0" />
                ) : (
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                )}
                <span>{message.text}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1 font-mono">Current Master Password</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-mono">New Password (min 8 chars)</label>
                <input
                  type="password"
                  required
                  minLength="8"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-mono">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Updating Hash...</span>
                  </>
                ) : (
                  <span>Update Password</span>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right: Activity Log */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 rounded-3xl bg-zinc-950/70 border border-zinc-800 space-y-4">
            <h2 className="text-sm font-semibold font-mono text-zinc-200 flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-400" />
              <span>Real-Time Activity Audit Trail</span>
            </h2>

            {loadingLogs ? (
              <div className="py-10 text-center text-zinc-500 flex flex-col items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
                <span className="text-xs font-mono">Loading Audit Logs...</span>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 text-xs flex items-start justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] text-emerald-400 font-bold">
                          {log.action}
                        </span>
                        <span className="text-zinc-300">{log.details}</span>
                      </div>
                      <div className="text-[10px] text-zinc-500 mt-1 font-mono">
                        By: {log.admin_email}
                      </div>
                    </div>
                    <span className="text-[10px] text-zinc-500 font-mono shrink-0">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
