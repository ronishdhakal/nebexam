'use client';

import { useState } from 'react';
import StreamSelector from './StreamSelector';
import { getErrorMessage } from '@/lib/utils';

const CLASS_LEVELS = ['10', '11', '12'];

const inp = 'w-full border border-slate-300 bg-white rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1CA3FD] focus:border-transparent transition';
const lbl = 'block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide';

const defaultForm = {
  subject_code: '',
  name: '',
  class_level: '11',
  streams: [],
  order: 0,
  is_published: false,
};

export default function SubjectForm({ initial = {}, onSubmit, loading }) {
  const [form, setForm] = useState({ ...defaultForm, ...initial });
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await onSubmit(form);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">{error}</div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={lbl}>Subject Code</label>
          <input
            type="text"
            required
            value={form.subject_code}
            onChange={(e) => setForm({ ...form, subject_code: e.target.value })}
            placeholder="e.g. 1021"
            className={inp}
          />
        </div>
        <div>
          <label className={lbl}>Subject Name</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Physics"
            className={inp}
          />
        </div>
      </div>

      <div>
        <label className={lbl}>Class Level</label>
        <select
          value={form.class_level}
          onChange={(e) => setForm({ ...form, class_level: e.target.value })}
          className={inp}
        >
          {CLASS_LEVELS.map((l) => (
            <option key={l} value={l}>Class {l}</option>
          ))}
        </select>
      </div>

      <div>
        <label className={lbl}>Streams</label>
        <StreamSelector value={form.streams} onChange={(streams) => setForm({ ...form, streams })} />
      </div>

      <div>
        <label className={lbl}>Order</label>
        <input
          type="number"
          value={form.order}
          onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
          className={inp}
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="is_published"
          checked={form.is_published}
          onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
          className="rounded border-slate-300 text-[#1CA3FD] focus:ring-[#1CA3FD]"
        />
        <label htmlFor="is_published" className="text-sm text-slate-700 font-medium">Published</label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center gap-2 bg-[#1CA3FD] hover:bg-[#0e8fe0] text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-colors disabled:opacity-50"
      >
        {loading ? 'Saving...' : 'Save Subject'}
      </button>
    </form>
  );
}
