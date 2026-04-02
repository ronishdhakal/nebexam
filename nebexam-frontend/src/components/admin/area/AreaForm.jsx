'use client';

import { useState, useEffect } from 'react';
import { subjectsService } from '@/services/subjects.service';
import { getErrorMessage } from '@/lib/utils';
import SearchableSelect from '@/components/ui/SearchableSelect';

const inp = 'w-full border border-slate-300 bg-white rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1CA3FD] focus:border-transparent transition';
const lbl = 'block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide';

const defaultForm = {
  name: '',
  subject: '',
  order: 0,
};

export default function AreaForm({ initial = {}, onSubmit, loading }) {
  const [form, setForm] = useState({ ...defaultForm, ...initial });
  const [subjects, setSubjects] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    subjectsService.getAll()
      .then((res) => setSubjects(res.data.results || res.data))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!form.subject) {
      setError('Please select a subject.');
      return;
    }
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

      <div>
        <label className={lbl}>Subject</label>
        <SearchableSelect
          options={subjects.map((s) => ({ value: String(s.id), label: `${s.name} (Class ${s.class_level})` }))}
          value={String(form.subject)}
          onChange={(val) => setForm({ ...form, subject: val })}
          placeholder="Select subject"
        />
      </div>

      <div>
        <label className={lbl}>Area Name</label>
        <input
          type="text"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="e.g. Mechanics"
          className={inp}
        />
      </div>

      <div>
        <label className={lbl}>Order</label>
        <input
          type="number"
          value={form.order}
          onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) })}
          className={inp}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center gap-2 bg-[#1CA3FD] hover:bg-[#0e8fe0] text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-colors disabled:opacity-50"
      >
        {loading ? 'Saving...' : 'Save Area'}
      </button>
    </form>
  );
}
