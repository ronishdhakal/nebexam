'use client';

import { useState } from 'react';
import AnswerPopup from './AnswerPopup';

const LABELS = ['A', 'B', 'C', 'D', 'E'];

export default function McqCard({ node }) {
  const [showAnswer, setShowAnswer] = useState(false);

  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-800">{node.content}</p>
      <div className="space-y-1">
        {node.options.map((opt, i) => (
          <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
            <span className="font-medium shrink-0">({LABELS[i]})</span>
            <span>{opt}</span>
          </div>
        ))}
      </div>
      <button
        onClick={() => setShowAnswer(true)}
        className="text-xs text-blue-600 hover:underline mt-1"
      >
        Show Answer
      </button>
      {showAnswer && (
        <AnswerPopup
          answer={node.answer}
          explanation={node.explanation}
          onClose={() => setShowAnswer(false)}
        />
      )}
    </div>
  );
}