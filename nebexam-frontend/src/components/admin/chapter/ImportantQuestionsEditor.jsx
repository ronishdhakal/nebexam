'use client';

import { useState, useEffect, useCallback } from 'react';
import { chaptersService } from '@/services/chapters.service';
import { nodesService } from '@/services/questionbank.service';
import QuestionNodeForm from '@/components/admin/question-bank/QuestionNodeForm';
import { getErrorMessage } from '@/lib/utils';

const TYPE_LABEL = {
  mcq: 'MCQ', short: 'Short', long: 'Long', passage: 'Passage', section: 'Section',
  fill_blank: 'Fill Blank', true_false: 'True/False', essay: 'Essay',
  letter: 'Letter', grammar: 'Grammar',
};

const ENTRY_TYPE_LABEL = {
  old_question:   'Old Question',
  model_question: 'Model Question',
};

export default function ImportantQuestionsEditor({ chapter }) {
  const [questions, setQuestions]     = useState([]);
  const [loading, setLoading]         = useState(true);
  const [showForm, setShowForm]       = useState(false);
  const [saving, setSaving]           = useState(false);
  const [deletingId, setDeletingId]   = useState(null);
  const [error, setError]             = useState(null);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await chaptersService.getImportantQuestions(chapter.slug);
      setQuestions(res.data);
    } catch {
      setError('Failed to load questions.');
    } finally {
      setLoading(false);
    }
  }, [chapter.slug]);

  useEffect(() => { fetchQuestions(); }, [fetchQuestions]);

  const handleCreate = async (data) => {
    setSaving(true);
    setError(null);
    try {
      await nodesService.create({
        ...data,
        chapter: chapter.id,
        source:  'manual',
        parent:  null,
        entry:   null,
        group:   null,
      });
      setShowForm(false);
      await fetchQuestions();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await nodesService.delete(id);
      setQuestions((prev) => prev.filter((q) => q.id !== id));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-800">Important Questions</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Questions shown in the "Important Questions" tab of this chapter.
            Manually add new ones below, or tag questions from the Question Bank to this chapter.
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold bg-[#1CA3FD] hover:bg-[#0e8fe0] text-white px-3 py-2 rounded-lg transition"
        >
          <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          {showForm ? 'Cancel' : 'Add Question'}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="p-4 border-b border-gray-100 bg-slate-50">
          <QuestionNodeForm
            onSubmit={handleCreate}
            onCancel={() => setShowForm(false)}
            loading={saving}
          />
        </div>
      )}

      {error && (
        <div className="mx-4 mt-4 px-3 py-2 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg">
          {error}
        </div>
      )}

      {/* Question list */}
      {loading ? (
        <div className="py-10 flex justify-center">
          <div className="w-5 h-5 border-2 border-[#1CA3FD] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : questions.length === 0 ? (
        <div className="py-10 text-center text-sm text-slate-400">
          No important questions yet.
        </div>
      ) : (
        <div className="divide-y divide-gray-50">
          {questions.map((q) => (
            <QuestionRow
              key={q.id}
              question={q}
              onDelete={handleDelete}
              deleting={deletingId === q.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function QuestionRow({ question, onDelete, deleting }) {
  const typeLabel   = TYPE_LABEL[question.question_type] ?? question.question_type;
  const isManual    = question.source === 'manual';
  const entryLabel  = question.entry_type ? ENTRY_TYPE_LABEL[question.entry_type] : null;
  const contentText = typeof question.content === 'string'
    ? question.content
    : question.content?.content?.[0]?.content?.[0]?.text ?? null;

  return (
    <div className="px-5 py-3.5 flex items-start gap-4">
      <div className="flex-1 min-w-0">
        {/* Badges */}
        <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase tracking-wide">
            {typeLabel}
          </span>
          {question.marks && (
            <span className="text-[10px] font-semibold text-slate-400">
              {question.marks_label || `${question.marks}m`}
            </span>
          )}
          {isManual ? (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
              Manual
            </span>
          ) : entryLabel ? (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 ring-1 ring-blue-200">
              {entryLabel}{question.entry_year ? ` · ${question.entry_year}` : ''}
            </span>
          ) : (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-50 text-slate-500 ring-1 ring-slate-200">
              Question Bank
            </span>
          )}
        </div>

        {/* Content preview */}
        {contentText && (
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{contentText}</p>
        )}
      </div>

      {/* Delete — only for manually added questions */}
      {isManual && (
        <button
          onClick={() => onDelete(question.id)}
          disabled={deleting}
          title="Delete"
          className="text-slate-300 hover:text-red-500 transition-colors shrink-0 mt-0.5 disabled:opacity-50"
        >
          {deleting ? (
            <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin inline-block" />
          ) : (
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
              <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
            </svg>
          )}
        </button>
      )}
    </div>
  );
}
