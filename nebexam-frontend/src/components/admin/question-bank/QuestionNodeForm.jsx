'use client';

import { useState, useEffect } from 'react';
import McqOptionsEditor from './McqOptionsEditor';
import AnswerEditor from './AnswerEditor';
import RichTextEditor from '@/components/ui/RichTextEditor';
import SearchableSelect from '@/components/ui/SearchableSelect';
import { chaptersService } from '@/services/chapters.service';
import { getErrorMessage } from '@/lib/utils';

const QUESTION_TYPES = [
  { value: 'mcq',          label: 'MCQ' },
  { value: 'short',        label: 'Short Answer' },
  { value: 'long',         label: 'Long Answer' },
  { value: 'passage',      label: 'Passage' },
  { value: 'section',      label: 'Section (within Passage)' },
  { value: 'fill_blank',   label: 'Fill in the Blank' },
  { value: 'true_false',   label: 'True / False' },
  { value: 'essay',        label: 'Essay' },
  { value: 'letter',       label: 'Letter' },
  { value: 'grammar',      label: 'Grammar' },
  { value: 'or_separator', label: '— OR Separator —' },
];

const defaultForm = {
  question_type: 'short',
  passage_title: '',
  content: '',
  marks: '',
  marks_label: '',
  options: [],
  answer: '',
  explanation: '',
  order: 0,
};

const Field = ({ label, children }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">{label}</label>
    {children}
  </div>
);

const inputCls = "w-full border border-slate-300 bg-white rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";

export default function QuestionNodeForm({ initial = {}, onSubmit, onCancel, loading, subjectSlug }) {
  const [form, setForm] = useState({ ...defaultForm, ...initial });
  const [error, setError] = useState(null);
  const [chapters, setChapters] = useState([]);

  useEffect(() => {
    if (!subjectSlug) return;
    chaptersService.getAll({ subject: subjectSlug })
      .then((res) => {
        const list = res.data.results ?? res.data;
        setChapters(Array.isArray(list) ? list : []);
      })
      .catch(() => {});
  }, [subjectSlug]);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await onSubmit({
        ...form,
        marks:       form.marks !== '' && form.marks != null ? Number(form.marks) : null,
        content:     form.content     || null,
        answer:      form.answer      || null,
        explanation: form.explanation || null,
      });
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const isPassage     = form.question_type === 'passage';
  const isSection     = form.question_type === 'section';
  const isMcq         = form.question_type === 'mcq';
  const isOrSeparator = form.question_type === 'or_separator';

  return (
    <form onSubmit={handleSubmit} className="bg-white ring-1 ring-slate-200 rounded-xl overflow-hidden">
      {error && (
        <div className="px-4 pt-4">
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-md">{error}</div>
        </div>
      )}

      {/* Type row */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-100">
        <div className="grid grid-cols-3 gap-3">
          <Field label="Question Type">
            <select
              value={form.question_type}
              onChange={(e) => setForm({ ...defaultForm, ...initial, question_type: e.target.value })}
              className={inputCls}
            >
              {QUESTION_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </Field>
          {!isPassage && !isOrSeparator && (
            <>
              <Field label="Marks">
                <input
                  type="number"
                  value={form.marks}
                  onChange={(e) => set('marks', e.target.value)}
                  placeholder="e.g. 5"
                  className={inputCls}
                />
              </Field>
              <Field label="Marks Label">
                <input
                  type="text"
                  value={form.marks_label}
                  onChange={(e) => set('marks_label', e.target.value)}
                  placeholder="e.g. 5×1=5"
                  className={inputCls}
                />
              </Field>
            </>
          )}
        </div>

        {/* Chapter (optional) — only shown when subject chapters are available */}
        {chapters.length > 0 && (
          <div className="mt-3">
            <Field label="Chapter (optional)">
              <SearchableSelect
                value={form.chapter ? String(form.chapter) : ''}
                onChange={(val) => set('chapter', val || null)}
                placeholder="— No chapter —"
                options={[
                  ...chapters.map((ch) => ({
                    value: String(ch.id),
                    label: [
                      ch.subject_class_level ? `Class ${ch.subject_class_level}` : null,
                      ch.area_name ? `${ch.area_name} → ${ch.name}` : ch.name,
                    ].filter(Boolean).join(' · '),
                  })),
                ]}
              />
            </Field>
          </div>
        )}
      </div>

      {/* ── OR SEPARATOR — nothing to configure ── */}
      {isOrSeparator && (
        <div className="px-4 py-4 border-b border-gray-100">
          <div className="text-center">
            <span className="text-sm font-bold text-slate-400 uppercase">Or</span>
          </div>
          <p className="text-xs text-slate-400 text-center mt-3">
            This inserts an "OR" divider between question alternatives. No content needed.
          </p>
        </div>
      )}

      {/* ── PASSAGE layout ── */}
      {isPassage && (
        <div className="px-4 py-3 space-y-3 border-b border-gray-100">
          <Field label="Passage Instruction (shown above the passage)">
            <input
              type="text"
              value={form.passage_title}
              onChange={(e) => set('passage_title', e.target.value)}
              placeholder="e.g. Read the following passage and attempt the questions."
              className={inputCls}
            />
          </Field>
          <Field label="Passage Content">
            <RichTextEditor
              value={form.content || null}
              onChange={(json) => set('content', json)}
              placeholder="Paste or write the passage here..."
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Marks">
              <input type="number" value={form.marks} onChange={(e) => set('marks', e.target.value)} placeholder="e.g. 15" className={inputCls} />
            </Field>
            <Field label="Marks Label">
              <input type="text" value={form.marks_label} onChange={(e) => set('marks_label', e.target.value)} placeholder="e.g. 3×5=15" className={inputCls} />
            </Field>
          </div>
          <p className="text-xs text-gray-400">
            After saving, use <strong>+ Add Sub-question</strong> to add direct questions or sections below this passage.
          </p>
        </div>
      )}

      {/* ── SECTION layout ── */}
      {isSection && (
        <div className="px-4 py-3 space-y-3 border-b border-gray-100">
          <Field label="Section Instruction">
            <RichTextEditor
              value={form.content || null}
              onChange={(json) => set('content', json)}
              placeholder="e.g. Read the passage above and answer the following questions."
            />
          </Field>
          <p className="text-xs text-gray-400">
            After saving, use <strong>+ Add Sub-question</strong> to add questions under this section.
          </p>
        </div>
      )}

      {/* ── Default layout (all other types) ── */}
      {!isPassage && !isSection && !isOrSeparator && (
        <>
          <div className="px-4 py-3 border-b border-gray-100">
            <Field label="Question Content">
              <RichTextEditor
                value={form.content || null}
                onChange={(json) => set('content', json)}
                placeholder="Write the question here..."
              />
            </Field>
          </div>

          {isMcq && (
            <div className="px-4 py-3 border-b border-gray-100">
              <McqOptionsEditor
                options={form.options}
                onChange={(options) => set('options', options)}
              />
            </div>
          )}

          <div className="px-4 py-3 border-b border-gray-100">
            <AnswerEditor
              answer={form.answer}
              explanation={form.explanation}
              onChange={({ answer, explanation }) => setForm((f) => ({ ...f, answer, explanation }))}
            />
          </div>
        </>
      )}

      {/* Footer: order + actions */}
      <div className="px-4 py-3 flex items-center justify-between gap-3 bg-slate-50 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500 font-medium">Order</label>
          <input
            type="number"
            value={form.order}
            onChange={(e) => set('order', parseInt(e.target.value) || 0)}
            className="w-16 border border-slate-300 bg-white rounded-lg px-2 py-1 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2">
          {onCancel && (
            <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-slate-600 bg-white ring-1 ring-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
              Cancel
            </button>
          )}
          <button type="submit" disabled={loading} className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm">
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </form>
  );
}
