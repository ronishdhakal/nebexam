'use client';

import RichTextEditor from '@/components/ui/RichTextEditor';

export default function AnswerEditor({ answer, explanation, onChange }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Answer</label>
        <RichTextEditor
          value={answer || null}
          onChange={(json) => onChange({ answer: json, explanation })}
          placeholder="Write the answer here..."
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">
          Explanation <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <RichTextEditor
          value={explanation || null}
          onChange={(json) => onChange({ answer, explanation: json })}
          placeholder="Optional extra explanation..."
        />
      </div>
    </div>
  );
}
