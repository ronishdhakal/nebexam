'use client';

import { useState } from 'react';
import { getErrorMessage } from '@/lib/utils';

const inp = "w-full border border-slate-200 bg-white rounded-xl px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1CA3FD] focus:border-transparent transition";
const lbl = "block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide";

const defaultForm = {
  group_title: '',
  group_disclaimer: '',
  marks: '',
  marks_label: '',
  order: 0,
};

export default function GroupForm({ initial = {}, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({
    ...defaultForm,
    ...initial,
    marks: initial.marks ?? '',
    marks_label: initial.marks_label || initial.marks_formula || '',
  });
  const [error, setError] = useState(null);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await onSubmit({
        ...form,
        marks: form.marks !== '' ? Number(form.marks) : null,
        marks_formula: form.marks_label, // keep legacy field in sync
      });
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
      {error && (
        <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">{error}</div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={lbl}>Group Title</label>
          <input
            type="text"
            required
            value={form.group_title}
            onChange={set('group_title')}
            placeholder="e.g. Group A"
            className={inp}
          />
        </div>
        <div>
          <label className={lbl}>Order</label>
          <input
            type="number"
            value={form.order}
            onChange={set('order')}
            min="0"
            className={inp}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={lbl}>Marks <span className="normal-case text-slate-400 font-normal">(optional)</span></label>
          <input
            type="number"
            value={form.marks}
            onChange={set('marks')}
            placeholder="e.g. 20"
            min="0"
            className={inp}
          />
        </div>
        <div>
          <label className={lbl}>Marks Label <span className="normal-case text-slate-400 font-normal">(optional)</span></label>
          <input
            type="text"
            value={form.marks_label}
            onChange={set('marks_label')}
            placeholder="e.g. 5×4=20 or Answer any 5"
            className={inp}
          />
        </div>
      </div>

      <div>
        <label className={lbl}>Group Disclaimer <span className="normal-case text-slate-400 font-normal">(optional)</span></label>
        <input
          type="text"
          value={form.group_disclaimer}
          onChange={set('group_disclaimer')}
          placeholder="e.g. Rewrite the correct option in your answer sheet."
          className={inp}
        />
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={loading}
          className="bg-[#1CA3FD] hover:bg-[#0e8fe0] text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-colors disabled:opacity-50"
        >
          {loading ? 'Saving…' : 'Save Group'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="bg-white text-slate-600 px-4 py-2.5 rounded-xl text-sm font-medium border border-gray-200 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
