'use client';

import { useState } from 'react';
import GroupForm from './GroupForm';
import QuestionNodeItem from './QuestionNodeItem';
import QuestionNodeForm from './QuestionNodeForm';
import { groupsService, nodesService } from '@/services/questionbank.service';
import { getErrorMessage } from '@/lib/utils';

function GroupCard({ group, entryId, onRefresh, subjectSlug }) {
  const [isOpen, setIsOpen] = useState(true);
  const [editingGroup, setEditingGroup] = useState(false);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleEditGroup = async (data) => {
    setLoading(true);
    try {
      await groupsService.update(group.id, data);
      setEditingGroup(false);
      onRefresh();
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (!confirm('Delete this group and all its questions?')) return;
    try {
      await groupsService.delete(group.id);
      onRefresh();
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  const handleAddQuestion = async (data) => {
    setLoading(true);
    try {
      await nodesService.create({ ...data, entry: entryId, group: group.id, parent: null });
      setShowAddQuestion(false);
      onRefresh();
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const qCount = group.questions?.length || 0;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {editingGroup ? (
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <GroupForm
            initial={group}
            onSubmit={handleEditGroup}
            onCancel={() => setEditingGroup(false)}
            loading={loading}
          />
        </div>
      ) : (
        <div
          className="flex items-center justify-between px-4 py-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors select-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className="font-semibold text-sm text-gray-900">{group.group_title}</span>
            {group.marks_formula && (
              <span className="text-xs text-gray-500 bg-white border border-gray-200 px-2 py-0.5 rounded shrink-0">
                {group.marks_formula}
              </span>
            )}
            {group.group_disclaimer && (
              <span className="text-xs text-gray-400 italic truncate hidden sm:block">
                {group.group_disclaimer}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
            <span className="text-xs text-gray-400">{qCount} Q</span>
            <button onClick={() => setEditingGroup(true)} className="text-xs text-blue-600 hover:underline">
              Edit
            </button>
            <button onClick={handleDeleteGroup} className="text-xs text-red-500 hover:underline">
              Delete
            </button>
            <span className="text-gray-300 text-xs w-4 text-center">{isOpen ? '▲' : '▼'}</span>
          </div>
        </div>
      )}

      {isOpen && (
        <div className="divide-y divide-gray-100">
          {qCount > 0 && (
            <div className="p-4 space-y-2">
              {group.questions.map((node, index) => (
                <QuestionNodeItem
                  key={node.id}
                  node={node}
                  index={index}
                  entryId={entryId}
                  groupId={group.id}
                  onRefresh={onRefresh}
                  subjectSlug={subjectSlug}
                />
              ))}
            </div>
          )}
          <div className="p-4">
            {showAddQuestion ? (
              <QuestionNodeForm
                onSubmit={handleAddQuestion}
                onCancel={() => setShowAddQuestion(false)}
                loading={loading}
                subjectSlug={subjectSlug}
              />
            ) : (
              <button
                onClick={() => setShowAddQuestion(true)}
                className="w-full border-2 border-dashed border-gray-200 rounded-lg py-2.5 text-sm text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-colors"
              >
                + Add Question
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function GroupList({ groups, entryId, onRefresh, subjectSlug }) {
  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <GroupCard key={group.id} group={group} entryId={entryId} onRefresh={onRefresh} subjectSlug={subjectSlug} />
      ))}
    </div>
  );
}
