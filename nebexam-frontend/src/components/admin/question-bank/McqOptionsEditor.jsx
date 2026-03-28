'use client';

import CompactRichTextEditor from '@/components/ui/CompactRichTextEditor';

const LABELS = ['A', 'B', 'C', 'D', 'E'];

export default function McqOptionsEditor({ options, onChange }) {
  const updateOption = (index, value) => {
    const updated = [...options];
    updated[index] = value;
    onChange(updated);
  };

  const addOption = () => {
    onChange([...options, '']);
  };

  const removeOption = (index) => {
    onChange(options.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2.5">
      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Options</label>
      {options.map((opt, index) => (
        <div key={index} className="flex items-start gap-2">
          <span className="shrink-0 w-6 h-6 mt-1.5 rounded bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center">
            {LABELS[index]}
          </span>
          <div className="flex-1 min-w-0">
            <CompactRichTextEditor
              key={index}
              value={opt || ''}
              onChange={(json) => updateOption(index, json)}
              placeholder={`Option ${LABELS[index]}`}
            />
          </div>
          <button
            type="button"
            onClick={() => removeOption(index)}
            className="shrink-0 mt-1.5 w-6 h-6 flex items-center justify-center text-slate-300 hover:text-red-500 transition-colors rounded"
            title="Remove option"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      ))}
      {options.length < 5 && (
        <button
          type="button"
          onClick={addOption}
          className="flex items-center gap-1.5 text-xs text-[#1CA3FD] hover:text-[#0e8fe0] font-medium transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Option
        </button>
      )}
    </div>
  );
}
