'use client';

import { useState } from 'react';
import QuestionNodeItem from './QuestionNodeItem';
import QuestionNodeForm from './QuestionNodeForm';
import { nodesService } from '@/services/questionbank.service';
import { getErrorMessage } from '@/lib/utils';

export default function QuestionNodeTree({ questions, entryId, onRefresh, subjectSlug }) {
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAdd = async (data) => {
    setLoading(true);
    try {
      await nodesService.create({ ...data, entry: entryId, group: null, parent: null });
      setShowAdd(false);
      onRefresh();
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      {questions.length === 0 && !showAdd && (
        <div className="text-center py-10 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
          No questions yet.
        </div>
      )}

      {questions.map((node, index) => (
        <QuestionNodeItem
          key={node.id}
          node={node}
          index={index}
          entryId={entryId}
          onRefresh={onRefresh}
          subjectSlug={subjectSlug}
        />
      ))}

      {showAdd ? (
        <div className="mt-2">
          <QuestionNodeForm
            onSubmit={handleAdd}
            onCancel={() => setShowAdd(false)}
            loading={loading}
            subjectSlug={subjectSlug}
          />
        </div>
      ) : (
        <button
          onClick={() => setShowAdd(true)}
          className="w-full border-2 border-dashed border-gray-200 rounded-lg py-2.5 text-sm text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-colors mt-2"
        >
          + Add Question
        </button>
      )}
    </div>
  );
}
