'use client';

import { useState } from 'react';
import { authService } from '@/services/users.service';
import useAuthStore from '@/store/authStore';

const LEVELS = [
  { value: '8',  label: 'Class 8' },
  { value: '9',  label: 'Class 9' },
  { value: '10', label: 'Class 10 — SEE' },
  { value: '11', label: 'Class 11' },
  { value: '12', label: 'Class 12' },
];

const sel =
  'w-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#1CA3FD]/30 focus:border-[#1CA3FD] transition';

export default function ClassStreamCard({ user }) {
  const { setUser } = useAuthStore();
  const [level, setLevel]   = useState(user.level || '');
  const [stream, setStream] = useState(user.stream || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);
  const [error, setError]   = useState(null);

  const needsStream = level === '11' || level === '12';
  const dirty =
    level !== (user.level || '') ||
    stream !== (user.stream || '');

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('level', level);
      fd.append('stream', needsStream ? stream : '');
      const res = await authService.updateProfile(fd);
      setUser(res.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setError('Failed to save. Try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-5">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Class &amp; Stream</p>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5">Class / Level</label>
          <select
            value={level}
            onChange={(e) => { setLevel(e.target.value); setStream(''); }}
            className={sel}
          >
            <option value="">Not set</option>
            {LEVELS.map((l) => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        </div>

        {needsStream && (
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Stream</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'science',    label: 'Science',    active: 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400' },
                { value: 'management', label: 'Management', active: 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' },
              ].map(({ value, label, active }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setStream(value)}
                  className={`py-2 rounded-xl border-2 text-xs font-bold transition-all ${
                    stream === value ? active : 'border-slate-200 dark:border-slate-600 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && (
          <p className="text-xs text-red-500">{error}</p>
        )}

        <button
          onClick={handleSave}
          disabled={!dirty || saving || (needsStream && !stream)}
          className="w-full py-2 rounded-xl bg-[#1CA3FD] text-white text-xs font-bold hover:bg-[#0e8fe0] disabled:opacity-40 transition"
        >
          {saving ? 'Saving…' : saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
