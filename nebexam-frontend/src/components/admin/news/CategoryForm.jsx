'use client';

import { useState } from 'react';
import { getErrorMessage } from '@/lib/utils';

const inp = 'w-full border border-slate-300 bg-white rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1CA3FD] focus:border-transparent transition';
const lbl = 'block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide';

const defaultForm = { name: '', order: 0 };

export default function CategoryForm({ initial = {}, onSubmit, loading, submitLabel = 'Save Category' }) {
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
    <form onSubmit={handleSubmit} className="space-y-5 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 max-w-lg">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">{error}</div>
      )}

      <div>
        <label className={lbl}>Category Name</label>
        <input
          type="text"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="e.g. Scholarship, Exam Notice"
          className={inp}
        />
      </div>

      <div>
        <label className={lbl}>Order</label>
        <input
          type="number"
          min={0}
          value={form.order}
          onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
          className={inp}
        />
        <p className="mt-1 text-xs text-slate-400">Lower number appears first</p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center gap-2 bg-[#1CA3FD] hover:bg-[#0e8fe0] text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-colors disabled:opacity-50"
      >
        {loading ? 'Saving...' : submitLabel}
      </button>
    </form>
  );
}
