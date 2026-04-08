'use client';

import RichTextRenderer from '@/components/chapter/RichTextRenderer';

export default function AnswerPopup({ answer, explanation, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Answer</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
        </div>
        <div className="text-sm text-gray-800 mb-3">
          {answer ? <RichTextRenderer content={answer} /> : 'No answer provided.'}
        </div>
        {explanation && (
          <div className="text-sm text-gray-500 border-t border-gray-100 pt-3">
            <span className="font-medium text-gray-700 block mb-1">Explanation:</span>
            <RichTextRenderer content={explanation} />
          </div>
        )}
      </div>
    </div>
  );
}