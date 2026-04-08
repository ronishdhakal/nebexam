'use client';

import { useState } from 'react';
import Link from 'next/link';
import useSubjects from '@/hooks/useSubjects';
import { subjectsService } from '@/services/subjects.service';
import { getErrorMessage } from '@/lib/utils';
import PageHeader from '@/components/admin/shared/PageHeader';

const selectCls = 'text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1CA3FD]/30 focus:border-[#1CA3FD]';

export default function SubjectsPage() {
  const { subjects, loading, error, refetch } = useSubjects();
  const [deleting, setDeleting] = useState(null);
  const [classFilter, setClassFilter]   = useState('');
  const [streamFilter, setStreamFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const handleDelete = async (slug) => {
    if (!confirm('Delete this subject?')) return;
    setDeleting(slug);
    try {
      await subjectsService.delete(slug);
      refetch();
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setDeleting(null);
    }
  };

  const filtered = subjects.filter((s) => {
    if (classFilter  && String(s.class_level) !== classFilter)   return false;
    if (streamFilter && !s.streams.includes(streamFilter))        return false;
    if (statusFilter === 'published' && !s.is_published)          return false;
    if (statusFilter === 'draft'     &&  s.is_published)          return false;
    return true;
  });

  const hasFilter = classFilter || streamFilter || statusFilter;

  return (
    <div>
      <PageHeader
        title="Subjects"
        subtitle="Manage subjects across all classes and streams"
        action={{ href: '/admin/subjects/new', label: 'New Subject' }}
      />

      {/* ── Filter bar ── */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)} className={selectCls}>
          <option value="">All Classes</option>
          <option value="8">Class 8</option>
          <option value="9">Class 9</option>
          <option value="10">Class 10</option>
          <option value="11">Class 11</option>
          <option value="12">Class 12</option>
        </select>

        <select value={streamFilter} onChange={(e) => setStreamFilter(e.target.value)} className={selectCls}>
          <option value="">All Streams</option>
          <option value="science">Science</option>
          <option value="management">Management</option>
        </select>

        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={selectCls}>
          <option value="">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>

        {hasFilter && (
          <button
            onClick={() => { setClassFilter(''); setStreamFilter(''); setStatusFilter(''); }}
            className="text-xs text-slate-400 hover:text-slate-600 underline"
          >
            Clear filters
          </button>
        )}

        {!loading && (
          <span className="ml-auto text-xs text-slate-400">
            {filtered.length} of {subjects.length}
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
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Code</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Name</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Class</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Streams</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((subject) => (
                <tr key={subject.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5 text-slate-500 font-mono text-xs">{subject.subject_code}</td>
                  <td className="px-5 py-3.5 font-medium text-slate-900">{subject.name}</td>
                  <td className="px-5 py-3.5 text-slate-600">Class {subject.class_level}</td>
                  <td className="px-5 py-3.5 text-slate-500">{subject.streams.join(', ')}</td>
                  <td className="px-5 py-3.5">
                    <StatusBadge published={subject.is_published} />
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <Link href={`/admin/subjects/${subject.slug}`} className="text-[#1CA3FD] hover:text-[#0e8fe0] text-xs font-medium">Edit</Link>
                      <button onClick={() => handleDelete(subject.slug)} disabled={deleting === subject.slug} className="text-red-500 hover:text-red-700 text-xs font-medium disabled:opacity-40">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          {filtered.length === 0 && <div className="text-center py-12 text-slate-400 text-sm">No subjects found.</div>}
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
