'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import EntryForm from '@/components/admin/question-bank/EntryForm';
import GroupForm from '@/components/admin/question-bank/GroupForm';
import GroupList from '@/components/admin/question-bank/GroupList';
import QuestionNodeTree from '@/components/admin/question-bank/QuestionNodeTree';
import { entriesService, groupsService } from '@/services/questionbank.service';
import { getErrorMessage } from '@/lib/utils';

export default function EditEntryPage({ params: rawParams }) {
  const params = use(rawParams);
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showAddGroup, setShowAddGroup] = useState(false);
  const router = useRouter();

  const fetchEntry = async () => {
    try {
      const res = await entriesService.getOne(params.slug);
      setEntry(res.data);
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  useEffect(() => { fetchEntry(); }, [params.slug]);

  const handleUpdateEntry = async (data) => {
    setLoading(true);
    try {
      await entriesService.update(params.slug, data);
      await fetchEntry();
      setShowDetails(false);
    } finally {
      setLoading(false);
    }
  };

  const handleAddGroup = async (data) => {
    setLoading(true);
    try {
      await groupsService.create({ ...data, entry: entry.id });
      setShowAddGroup(false);
      fetchEntry();
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (!entry) return <p className="text-sm text-gray-500 p-6">Loading...</p>;

  const questionCount = entry.has_group
    ? (entry.groups || []).reduce((sum, g) => sum + (g.questions?.length || 0), 0)
    : (entry.questions || []).length;

  return (
    <div className="max-w-4xl space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <button
            onClick={() => router.push('/admin/question-bank')}
            className="text-xs text-[#1CA3FD] hover:text-[#0e8fe0] mb-1.5 inline-flex items-center gap-1 font-medium"
          >
            ← Back to Question Bank
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{entry.title}</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {entry.subject_name}
            {entry.year ? ` · ${entry.year}` : ''}
            {entry.type ? ` · ${entry.type.replace('_', ' ')}` : ''}
          </p>
          {entry.slug && (
            <div className="flex items-center gap-1.5 mt-1">
              <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
              </svg>
              <code className="text-xs text-[#1CA3FD] font-mono">{entry.slug}</code>
            </div>
          )}
        </div>
        <span className={`mt-1 px-2.5 py-1 rounded-full text-xs font-medium ${entry.is_published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
          {entry.is_published ? 'Published' : 'Draft'}
        </span>
      </div>

      {/* Entry details (collapsible) */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
        >
          <span className="text-sm font-medium text-gray-700">Entry Details</span>
          <span className="text-xs text-gray-400">{showDetails ? '▲ Collapse' : '▼ Edit'}</span>
        </button>
        {showDetails && (
          <div className="p-5 border-t border-gray-200">
            <EntryForm initial={entry} onSubmit={handleUpdateEntry} loading={loading} />
          </div>
        )}
      </div>

      {/* Questions section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">
            {entry.has_group ? 'Groups & Questions' : 'Questions'}
            {questionCount > 0 && (
              <span className="ml-2 text-sm font-normal text-gray-400">({questionCount})</span>
            )}
          </h2>
          {entry.has_group && (
            <button
              onClick={() => setShowAddGroup(!showAddGroup)}
              className="inline-flex items-center gap-1.5 text-sm bg-[#1CA3FD] text-white px-4 py-2 rounded-xl font-semibold hover:bg-[#0e8fe0] transition-colors shadow-sm"
            >
              + Add Group
            </button>
          )}
        </div>

        {showAddGroup && (
          <div className="mb-4">
            <GroupForm
              onSubmit={handleAddGroup}
              onCancel={() => setShowAddGroup(false)}
              loading={loading}
            />
          </div>
        )}

        {entry.has_group ? (
          <GroupList groups={entry.groups || []} entryId={entry.id} onRefresh={fetchEntry} subjectSlug={entry.subject_slug} />
        ) : (
          <QuestionNodeTree questions={entry.questions || []} entryId={entry.id} onRefresh={fetchEntry} subjectSlug={entry.subject_slug} />
        )}
      </div>
    </div>
  );
}
