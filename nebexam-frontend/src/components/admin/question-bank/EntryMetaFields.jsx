import { useMemo } from 'react';
import SearchableSelect from '@/components/ui/SearchableSelect';

const inp = "w-full border border-slate-300 bg-white rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";
const lbl = "block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide";

/** Mirror of the backend _build_slug_base logic */
function buildSlugPreview(subjectName, type, year) {
  if (!subjectName) return '';
  const subj = subjectName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const yr   = year ? year.trim() : '';
  if (type === 'model_question') {
    return yr ? `${subj}-model-question-${yr}` : `${subj}-model-question`;
  }
  return yr ? `${subj}-question-paper-${yr}` : `${subj}-question-paper`;
}

export default function EntryMetaFields({ form, setForm, subjects }) {
  const selectedSubject = useMemo(
    () => subjects.find((s) => String(s.id) === String(form.subject)),
    [subjects, form.subject],
  );

  const slugPreview = buildSlugPreview(selectedSubject?.name, form.type, form.year);

  // Auto-fill title when subject + type + year are all set
  const handleFieldChange = (patch) => {
    const next = { ...form, ...patch };

    // Only auto-fill if title is still empty or was previously auto-filled
    const subj = subjects.find((s) => String(s.id) === String(next.subject));
    if (subj && next.year) {
      const typeLabel = next.type === 'model_question' ? 'Model Question' : 'Old Question';
      const autoTitle = `${subj.name} ${typeLabel} ${next.year}`;
      // Replace title if it's blank OR matches the previous auto-title
      const prevSubj = subjects.find((s) => String(s.id) === String(form.subject));
      const prevTypeLabel = form.type === 'model_question' ? 'Model Question' : 'Old Question';
      const prevAutoTitle = prevSubj && form.year
        ? `${prevSubj.name} ${prevTypeLabel} ${form.year}`
        : '';
      if (!form.title || form.title === prevAutoTitle) {
        next.title = autoTitle;
      }
    }

    setForm(next);
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={lbl}>Subject</label>
          <SearchableSelect
            value={form.subject ? String(form.subject) : ''}
            onChange={(val) => handleFieldChange({ subject: val || '' })}
            placeholder="Select subject"
            options={subjects.map((s) => ({ value: String(s.id), label: `${s.name} (Class ${s.class_level})` }))}
          />
        </div>
        <div>
          <label className={lbl}>Type</label>
          <select
            value={form.type}
            onChange={(e) => handleFieldChange({ type: e.target.value })}
            className={inp}
          >
            <option value="old_question">Old Question</option>
            <option value="model_question">Model Question</option>
          </select>
        </div>
      </div>

      <div>
        <label className={lbl}>Title</label>
        <input
          type="text"
          required
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="e.g. Physics Old Question 2079"
          className={inp}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className={lbl}>Year</label>
          <input
            type="text"
            value={form.year}
            onChange={(e) => handleFieldChange({ year: e.target.value })}
            placeholder="e.g. 2079"
            className={inp}
          />
        </div>
        <div>
          <label className={lbl}>Source</label>
          <input type="text" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} placeholder="e.g. NEB" className={inp} />
        </div>
        <div>
          <label className={lbl}>Subject Code</label>
          <input type="text" value={form.sub_code} onChange={(e) => setForm({ ...form, sub_code: e.target.value })} placeholder="e.g. 1021" className={inp} />
        </div>
      </div>

      {/* Slug preview */}
      {slugPreview && (
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg">
          <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
          </svg>
          <span className="text-xs text-slate-400 shrink-0">URL slug:</span>
          <code className="text-xs text-[#1CA3FD] font-mono">{slugPreview}</code>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className={lbl}>Time</label>
          <input type="text" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} placeholder="e.g. 3 hrs" className={inp} />
        </div>
        <div>
          <label className={lbl}>Full Marks</label>
          <input type="number" value={form.full_marks} onChange={(e) => setForm({ ...form, full_marks: e.target.value })} className={inp} />
        </div>
        <div>
          <label className={lbl}>Pass Marks</label>
          <input type="number" value={form.pass_marks} onChange={(e) => setForm({ ...form, pass_marks: e.target.value })} className={inp} />
        </div>
      </div>

      <div className="flex items-center gap-6 pt-1 flex-wrap">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.has_group} onChange={(e) => setForm({ ...form, has_group: e.target.checked })} className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
          <span className="text-sm text-slate-700">Has Groups <span className="text-slate-400">(e.g. Group A, B)</span></span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.is_nepali} onChange={(e) => setForm({ ...form, is_nepali: e.target.checked })} className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
          <span className="text-sm text-slate-700">Nepali Medium <span className="text-slate-400">(sub-questions use क, ख, ग…)</span></span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
          <span className="text-sm text-slate-700">Published</span>
        </label>
      </div>
    </div>
  );
}
