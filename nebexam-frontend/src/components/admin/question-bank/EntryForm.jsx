'use client';

import { useState, useEffect } from 'react';
import { subjectsService } from '@/services/subjects.service';
import EntryMetaFields from './EntryMetaFields';
import { getErrorMessage } from '@/lib/utils';

const defaultForm = {
  subject: '',
  type: 'old_question',
  title: '',
  year: '',
  source: '',
  sub_code: '',
  time: '',
  full_marks: '',
  pass_marks: '',
  has_group: false,
  is_nepali: false,
  is_published: false,
};

export default function EntryForm({ initial = {}, onSubmit, loading }) {
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
    try {
      await onSubmit(form);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 bg-white p-5 rounded-xl ring-1 ring-slate-200">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">{error}</div>
      )}

      <EntryMetaFields form={form} setForm={setForm} subjects={subjects} />

      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center gap-2 bg-[#1CA3FD] hover:bg-[#0e8fe0] text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-colors disabled:opacity-50"
      >
        {loading ? 'Saving...' : 'Save Entry'}
      </button>
    </form>
  );
}