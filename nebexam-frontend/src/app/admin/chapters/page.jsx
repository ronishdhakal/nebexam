'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { chaptersService } from '@/services/chapters.service';
import { subjectsService } from '@/services/subjects.service';
import { areasService } from '@/services/areas.service';
import { getErrorMessage } from '@/lib/utils';
import PageHeader from '@/components/admin/shared/PageHeader';

const selectCls = 'text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1CA3FD]/30 focus:border-[#1CA3FD]';

export default function ChaptersPage() {
  const [chapters, setChapters]         = useState([]);
  const [allSubjects, setAllSubjects]   = useState([]);
  const [areasForSubject, setAreasForSubject] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [classFilter, setClassFilter]   = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [areaFilter, setAreaFilter]     = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Fetch subjects for dropdown once
  useEffect(() => {
    subjectsService.getAll().then((res) => {
      setAllSubjects(res.data.results || res.data);
    }).catch(() => {});
  }, []);

  // Fetch areas when subject changes
  useEffect(() => {
    if (!subjectFilter) { setAreasForSubject([]); setAreaFilter(''); return; }
    areasService.getAll({ subject: subjectFilter }).then((res) => {
      setAreasForSubject(res.data.results || res.data);
    }).catch(() => {});
    setAreaFilter('');
  }, [subjectFilter]);

  const fetchChapters = async (params = {}) => {
    try {
      setLoading(true);
      const res = await chaptersService.getAll(params);
      setChapters(res.data.results || res.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch when subject or area filter changes
  useEffect(() => {
    const params = {};
    if (areaFilter)    params.area    = areaFilter;
    else if (subjectFilter) params.subject = subjectFilter;
    fetchChapters(params);
  }, [subjectFilter, areaFilter]);

  const handleDelete = async (slug) => {
    if (!confirm('Delete this chapter?')) return;
    try {
      await chaptersService.delete(slug);
      const params = {};
      if (areaFilter)         params.area    = areaFilter;
      else if (subjectFilter) params.subject = subjectFilter;
      fetchChapters(params);
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
      if (!still) { setSubjectFilter(''); setAreaFilter(''); }
    }
  };

  // Status filter is client-side
  const filtered = statusFilter
    ? chapters.filter((c) => statusFilter === 'published' ? c.is_published : !c.is_published)
    : chapters;

  const hasFilter = classFilter || subjectFilter || areaFilter || statusFilter;

  return (
    <div>
      <PageHeader
        title="Chapters"
        subtitle="Manage chapters, notes and PDFs"
        action={{ href: '/admin/chapters/new', label: 'New Chapter' }}
      />

      {/* ── Filter bar ── */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <select value={classFilter} onChange={(e) => handleClassChange(e.target.value)} className={selectCls}>
          <option value="">All Classes</option>
          <option value="8">Class 8</option>
          <option value="9">Class 9</option>
          <option value="10">Class 10</option>
          <option value="11">Class 11</option>
          <option value="12">Class 12</option>
        </select>

        <select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)} className={selectCls}>
          <option value="">All Subjects</option>
          {subjectsInDropdown.map((s) => (
            <option key={s.slug} value={s.slug}>{s.name} {classFilter ? '' : `(Class ${s.class_level})`}</option>
          ))}
        </select>

        {areasForSubject.length > 0 && (
          <select value={areaFilter} onChange={(e) => setAreaFilter(e.target.value)} className={selectCls}>
            <option value="">All Areas</option>
            {areasForSubject.map((a) => (
              <option key={a.slug} value={a.slug}>{a.name}</option>
            ))}
          </select>
        )}

        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={selectCls}>
          <option value="">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>

        {hasFilter && (
          <button
            onClick={() => { setClassFilter(''); setSubjectFilter(''); setAreaFilter(''); setStatusFilter(''); }}
            className="text-xs text-slate-400 hover:text-slate-600 underline"
          >
            Clear filters
          </button>
        )}

        {!loading && (
          <span className="ml-auto text-xs text-slate-400">
            {filtered.length}{statusFilter ? ` of ${chapters.length}` : ''} chapters
          </span>
        )}
      </div>

      {loading && <p className="text-sm text-slate-500">Loading...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}

      {!loading && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Chapter</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Area</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Order</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((chapter) => (
                <tr key={chapter.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-slate-900">{chapter.name}</td>
                  <td className="px-5 py-3.5 text-slate-500">{chapter.area_name}</td>
                  <td className="px-5 py-3.5 text-slate-400 text-xs font-mono">{chapter.order}</td>
                  <td className="px-5 py-3.5">
                    <StatusBadge published={chapter.is_published} />
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <Link href={`/admin/chapters/${chapter.slug}`} className="text-[#1CA3FD] hover:text-[#0e8fe0] text-xs font-medium">Edit</Link>
                      <button onClick={() => handleDelete(chapter.slug)} className="text-red-500 hover:text-red-700 text-xs font-medium">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          {filtered.length === 0 && <div className="text-center py-12 text-slate-400 text-sm">No chapters found.</div>}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ published }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
      published ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
    }`}>
      {published ? 'Published' : 'Draft'}
    </span>
  );
}
