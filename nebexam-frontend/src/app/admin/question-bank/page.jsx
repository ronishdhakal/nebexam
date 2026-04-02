'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { entriesService } from '@/services/questionbank.service';
import { subjectsService } from '@/services/subjects.service';
import { getErrorMessage } from '@/lib/utils';
import PageHeader from '@/components/admin/shared/PageHeader';
import SearchableSelect from '@/components/ui/SearchableSelect';

const selectCls = 'text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1CA3FD]/30 focus:border-[#1CA3FD]';

export default function QuestionBankPage() {
  const [entries, setEntries]           = useState([]);
  const [allSubjects, setAllSubjects]   = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [classFilter, setClassFilter]   = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [typeFilter, setTypeFilter]     = useState('');
  const [yearFilter, setYearFilter]     = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Fetch subjects for dropdown once
  useEffect(() => {
    subjectsService.getAll().then((res) => {
      setAllSubjects(res.data.results || res.data);
    }).catch(() => {});
  }, []);

  const fetchEntries = async (params = {}) => {
    try {
      setLoading(true);
      const res = await entriesService.getAll(params);
      setEntries(res.data.results || res.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch when server-side filters change
  useEffect(() => {
    const params = {};
    if (subjectFilter) params.subject = subjectFilter;
    if (typeFilter)    params.type    = typeFilter;
    fetchEntries(params);
  }, [subjectFilter, typeFilter]);

  const handleDelete = async (slug) => {
    if (!confirm('Delete this entry?')) return;
    try {
      await entriesService.delete(slug);
      const params = {};
      if (subjectFilter) params.subject = subjectFilter;
      if (typeFilter)    params.type    = typeFilter;
      fetchEntries(params);
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  // Subjects shown in dropdown — filtered by class selection
  const subjectsInDropdown = classFilter
    ? allSubjects.filter((s) => String(s.class_level) === classFilter)
    : allSubjects;

  const handleClassChange = (val) => {
    setClassFilter(val);
    if (val && subjectFilter) {
      const still = allSubjects.find((s) => s.slug === subjectFilter && String(s.class_level) === val);
      if (!still) setSubjectFilter('');
    }
  };

  // Unique years from loaded entries for the year dropdown
  const availableYears = useMemo(() => {
    const years = [...new Set(entries.map((e) => e.year).filter(Boolean))].sort((a, b) => b - a);
    return years;
  }, [entries]);

  // Client-side filters: year and status
  const filtered = entries.filter((e) => {
    if (yearFilter   && String(e.year) !== yearFilter)              return false;
    if (statusFilter === 'published' && !e.is_published)            return false;
    if (statusFilter === 'draft'     &&  e.is_published)            return false;
    return true;
  });

  const hasFilter = classFilter || subjectFilter || typeFilter || yearFilter || statusFilter;

  return (
    <div>
      <PageHeader
        title="Question Bank"
        subtitle="Manage exam papers, past questions and model sets"
        action={{ href: '/admin/question-bank/new', label: 'New Entry' }}
      />

      {/* ── Filter bar ── */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <select value={classFilter} onChange={(e) => handleClassChange(e.target.value)} className={selectCls}>
          <option value="">All Classes</option>
          <option value="10">Class 10</option>
          <option value="11">Class 11</option>
          <option value="12">Class 12</option>
        </select>

        <div className="min-w-[180px]">
          <SearchableSelect
            value={subjectFilter}
            onChange={(val) => setSubjectFilter(val || '')}
            placeholder="All Subjects"
            options={subjectsInDropdown.map((s) => ({
              value: s.slug,
              label: classFilter ? s.name : `${s.name} (Class ${s.class_level})`,
            }))}
          />
        </div>

        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className={selectCls}>
          <option value="">All Types</option>
          <option value="old_question">Old Question</option>
          <option value="model_question">Model Question</option>
        </select>

        <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)} className={selectCls}>
          <option value="">All Years</option>
          {availableYears.map((y) => (
            <option key={y} value={String(y)}>{y}</option>
          ))}
        </select>

        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={selectCls}>
          <option value="">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>

        {hasFilter && (
          <button
            onClick={() => { setClassFilter(''); setSubjectFilter(''); setTypeFilter(''); setYearFilter(''); setStatusFilter(''); }}
            className="text-xs text-slate-400 hover:text-slate-600 underline"
          >
            Clear filters
          </button>
        )}

        {!loading && (
          <span className="ml-auto text-xs text-slate-400">
            {filtered.length}{(yearFilter || statusFilter) ? ` of ${entries.length}` : ''} entries
          </span>
        )}
      </div>

      {loading && <p className="text-sm text-slate-500">Loading...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}

      {!loading && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Title</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Subject</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Type</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Year</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-slate-900">{entry.title}</td>
                  <td className="px-5 py-3.5 text-slate-500">{entry.subject_name}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ring-1 ${
                      entry.type === 'old_question'
                        ? 'bg-orange-50 text-orange-700 ring-orange-200'
                        : 'bg-blue-50 text-blue-700 ring-blue-200'
                    }`}>
                      {entry.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-400 font-mono text-xs">{entry.year || '—'}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ring-1 ${
                      entry.is_published
                        ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                        : 'bg-amber-50 text-amber-700 ring-amber-200'
                    }`}>
                      {entry.is_published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <Link href={`/admin/question-bank/${entry.slug}`} className="text-[#1CA3FD] hover:text-[#0e8fe0] text-xs font-medium">Edit</Link>
                      <button onClick={() => handleDelete(entry.slug)} className="text-red-500 hover:text-red-700 text-xs font-medium">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          {filtered.length === 0 && <div className="text-center py-12 text-slate-400 text-sm">No entries found.</div>}
        </div>
      )}
    </div>
  );
}
