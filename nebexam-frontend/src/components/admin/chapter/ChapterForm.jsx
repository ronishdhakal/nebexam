'use client';

import { useState, useEffect } from 'react';
import { subjectsService } from '@/services/subjects.service';
import { areasService } from '@/services/areas.service';
import { getErrorMessage } from '@/lib/utils';
import RichTextEditor from '@/components/ui/RichTextEditor';

const inp = 'w-full border border-slate-300 bg-white rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1CA3FD] focus:border-transparent transition';
const lbl = 'block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide';

export default function ChapterForm({ initial = {}, onSubmit, loading }) {
  // Determine initial subject slug from initial data
  const initSubjectSlug = initial.subject_slug || '';

  const [form, setForm] = useState({
    name:             initial.name            || '',
    order:            initial.order           ?? 0,
    rich_text_notes:  initial.rich_text_notes ?? null,
    is_published:     initial.is_published    ?? false,
  });

  // subject slug used for filtering areas (UI state only)
  const [subjectSlug, setSubjectSlug] = useState(initSubjectSlug);
  // area id (optional)
  const [areaId, setAreaId] = useState(
    initial.area != null ? String(initial.area) : ''
  );
  // direct subject id (set when no area)
  const [subjectId, setSubjectId] = useState(
    initial.subject != null ? String(initial.subject) : ''
  );

  const [subjects, setSubjects] = useState([]);
  const [areas, setAreas]       = useState([]);
  const [pdfFile, setPdfFile]   = useState(null);
  const [error, setError]       = useState(null);

  // Load all subjects once
  useEffect(() => {
    subjectsService.getAll()
      .then((res) => setSubjects(res.data.results || res.data))
      .catch(() => {});
  }, []);

  // When subject slug changes, load its areas
  useEffect(() => {
    if (!subjectSlug) { setAreas([]); return; }
    areasService.getAll({ subject: subjectSlug })
      .then((res) => setAreas(res.data.results || res.data))
      .catch(() => {});
  }, [subjectSlug]);

  // When subject changes, clear area selection
  const handleSubjectChange = (slug) => {
    setSubjectSlug(slug);
    setAreaId('');
    // find the subject id by slug
    const subj = subjects.find((s) => s.slug === slug);
    setSubjectId(subj ? String(subj.id) : '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!subjectSlug) {
      setError('Please select a subject.');
      return;
    }

    // Build payload: area takes precedence; if no area, use subject
    const payload = { ...form };
    if (areaId) {
      payload.area    = parseInt(areaId);
      payload.subject = null;
    } else {
      payload.area    = null;
      payload.subject = parseInt(subjectId);
    }

    try {
      await onSubmit(payload, pdfFile);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">{error}</div>
      )}

      {/* Subject */}
      <div>
        <label className={lbl}>Subject <span className="text-red-400">*</span></label>
        <select
          value={subjectSlug}
          onChange={(e) => handleSubjectChange(e.target.value)}
          className={inp}
          required
        >
          <option value="">Select subject</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.slug}>
              Class {s.class_level} — {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Area (optional) */}
      <div>
        <label className={lbl}>
          Area
          <span className="ml-1.5 text-[10px] font-medium text-slate-400 normal-case tracking-normal">(optional — leave blank to add directly under subject)</span>
        </label>
        <select
          value={areaId}
          onChange={(e) => setAreaId(e.target.value)}
          disabled={!subjectSlug}
          className={`${inp} disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <option value="">No area — directly under subject</option>
          {areas.map((a) => (
            <option key={a.id} value={String(a.id)}>{a.name}</option>
          ))}
        </select>
        {subjectSlug && areas.length === 0 && (
          <p className="text-xs text-slate-400 mt-1">No areas for this subject — chapter will be added directly.</p>
        )}
      </div>

      {/* Chapter Name */}
      <div>
        <label className={lbl}>Chapter Name <span className="text-red-400">*</span></label>
        <input
          type="text"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="e.g. Laws of Motion"
          className={inp}
        />
      </div>

      {/* Order */}
      <div>
        <label className={lbl}>Order</label>
        <input
          type="number"
          value={form.order}
          onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) })}
          className={inp}
        />
      </div>

      {/* Notes */}
      <div>
        <label className={lbl}>Notes / Description</label>
        <RichTextEditor
          value={form.rich_text_notes}
          onChange={(json) => setForm((prev) => ({ ...prev, rich_text_notes: json }))}
          placeholder="Write chapter notes here..."
        />
      </div>

      {/* PDF */}
      <div>
        <label className={lbl}>PDF Notes</label>
        {initial.pdf_notes && (
          <p className="text-xs text-slate-500 mb-2">
            Current: <a href={initial.pdf_notes} target="_blank" rel="noreferrer" className="text-[#1CA3FD] hover:underline">View PDF</a>
          </p>
        )}
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setPdfFile(e.target.files[0] || null)}
          className="text-sm text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#1CA3FD]/10 file:text-[#1CA3FD] hover:file:bg-[#1CA3FD]/20"
        />
        {pdfFile && <p className="text-xs text-slate-400 mt-1">Selected: {pdfFile.name}</p>}
      </div>

      {/* Published */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="is_published"
          checked={form.is_published}
          onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
          className="rounded border-slate-300 text-[#1CA3FD] focus:ring-[#1CA3FD]"
        />
        <label htmlFor="is_published" className="text-sm text-slate-700 font-medium">Published</label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center gap-2 bg-[#1CA3FD] hover:bg-[#0e8fe0] text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-colors disabled:opacity-50"
      >
        {loading ? 'Saving...' : 'Save Chapter'}
      </button>
    </form>
  );
}
