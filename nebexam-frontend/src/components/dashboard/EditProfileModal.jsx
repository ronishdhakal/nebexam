'use client';

import { useState, useRef } from 'react';
import { authService } from '@/services/users.service';
import { mediaUrl } from '@/lib/utils';
import useAuthStore from '@/store/authStore';

const LEVELS = [
  { value: '10', label: 'Class 10 — SEE' },
  { value: '11', label: 'Class 11' },
  { value: '12', label: 'Class 12' },
];

const inp =
  'w-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1CA3FD]/30 focus:border-[#1CA3FD] transition';

export default function EditProfileModal({ user, onClose }) {
  const { setUser } = useAuthStore();
  const [form, setForm] = useState({
    name: user.name || '',
    phone: user.phone || '',
    level: user.level || '',
    stream: user.stream || '',
  });
  const needsStream = form.level === '11' || form.level === '12';
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileRef = useRef();

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatar(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('phone', form.phone);
      fd.append('level', form.level);
      fd.append('stream', needsStream ? form.stream : '');
      if (avatar) fd.append('profile_picture', avatar);
      const res = await authService.updateProfile(fd);
      setUser(res.data);
      onClose();
    } catch {
      setError('Could not save changes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const initials = user.name?.[0]?.toUpperCase() ?? 'U';
  const currentPic = preview || mediaUrl(user.profile_picture);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 w-full max-w-md overflow-hidden">
        <div className="h-1 bg-[#1CA3FD]" />
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100 dark:border-slate-700">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Edit Profile</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-200 transition"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Avatar upload */}
          <div className="flex flex-col items-center gap-2 pb-2">
            <button type="button" onClick={() => fileRef.current?.click()} className="relative group">
              {currentPic ? (
                <img src={currentPic} alt="Avatar" className="w-20 h-20 rounded-2xl object-cover ring-2 ring-[#1CA3FD]/20" />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-[#1CA3FD]/10 flex items-center justify-center ring-2 ring-[#1CA3FD]/20">
                  <span className="text-2xl font-extrabold text-[#1CA3FD]">{initials}</span>
                </div>
              )}
              <div className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                <svg width="18" height="18" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
              </div>
            </button>
            <p className="text-xs text-slate-400">Click photo to change</p>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
          </div>

          {error && (
            <p className="text-xs text-red-500 bg-red-50 border border-red-100 px-3 py-2 rounded-xl">{error}</p>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Full Name</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inp}
              placeholder="Your full name"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Phone</label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className={inp}
              placeholder="98XXXXXXXX"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Class / Level</label>
            <select
              value={form.level}
              onChange={(e) => setForm({ ...form, level: e.target.value, stream: '' })}
              className={inp}
            >
              <option value="">Not set</option>
              {LEVELS.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </div>

          {needsStream && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Stream</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'science', label: 'Science', color: 'blue' },
                  { value: 'management', label: 'Management', color: 'emerald' },
                ].map(({ value, label, color }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setForm({ ...form, stream: value })}
                    className={`py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                      form.stream === value
                        ? color === 'blue'
                          ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-500'
                          : 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-500'
                        : 'border-slate-200 dark:border-slate-600 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-[#1CA3FD] text-white text-sm font-semibold hover:bg-[#0e8fe0] disabled:opacity-50 transition shadow-sm shadow-[#1CA3FD]/20"
            >
              {loading ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
