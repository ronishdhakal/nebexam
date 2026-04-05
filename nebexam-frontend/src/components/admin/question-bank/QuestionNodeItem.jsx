'use client';

import { useState } from 'react';
import QuestionNodeForm from './QuestionNodeForm';
import RichTextRenderer from '@/components/ui/RichTextRenderer';
import { nodesService } from '@/services/questionbank.service';
import { getErrorMessage } from '@/lib/utils';

function extractText(content) {
  if (!content) return '';
  if (typeof content === 'string') return content;
  try {
    const walk = (node) => {
      if (node.type === 'text') return node.text || '';
      if (node.content) return node.content.map(walk).join('');
      return '';
    };
    return walk(content);
  } catch {
    return '';
  }
}

const TYPE_COLORS = {
  mcq:        'bg-blue-100 text-blue-700',
  short:      'bg-green-100 text-green-700',
  long:       'bg-purple-100 text-purple-700',
  passage:    'bg-orange-100 text-orange-700',
  section:    'bg-gray-100 text-gray-600',
  fill_blank: 'bg-yellow-100 text-yellow-700',
  true_false: 'bg-teal-100 text-teal-700',
  essay:      'bg-pink-100 text-pink-700',
  letter:     'bg-indigo-100 text-indigo-700',
  grammar:    'bg-red-100 text-red-700',
};

// Renders children with OR-separator-aware index tracking
function renderChildrenWithSeparators(children, { entryId, groupId, onRefresh, depth, subjectSlug }) {
  let counter = 0;
  let prevWasOrSep = false;
  return children.map((child) => {
    let index;
    if (child.question_type === 'or_separator') {
      prevWasOrSep = true;
      index = counter - 1;
    } else if (prevWasOrSep) {
      prevWasOrSep = false;
      index = counter - 1; // same number as the question before OR
    } else {
      index = counter++;
    }
    return (
      <QuestionNodeItem
        key={child.id}
        node={child}
        index={index}
        entryId={entryId}
        groupId={groupId}
        onRefresh={onRefresh}
        depth={depth}
        subjectSlug={subjectSlug}
      />
    );
  });
}

function OrSeparatorView({ node, onRefresh }) {
  const handleDelete = async () => {
    if (!confirm('Remove this OR separator?')) return;
    try {
      await nodesService.delete(node.id);
      onRefresh();
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  return (
    <div className="flex items-center gap-3 py-1">
      <div className="flex-1 h-px bg-gray-200" />
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest px-3 py-1 bg-gray-50 border border-gray-200 rounded-full">
          OR
        </span>
        <button onClick={handleDelete} className="text-xs text-red-400 hover:text-red-600 font-medium">✕</button>
      </div>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  );
}

// Reusable "Add OR Question" form — shows OR divider then the question form.
// onSubmit receives form data; caller is responsible for creating OR + question.
function AddOrQuestionForm({ onSubmit, onCancel, loading, subjectSlug }) {
  return (
    <div>
      {/* OR divider preview */}
      <div className="flex items-center gap-3 py-2 mb-2">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest px-3 py-1 bg-gray-50 border border-gray-200 rounded-full">
          OR
        </span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>
      <QuestionNodeForm
        onSubmit={onSubmit}
        onCancel={onCancel}
        loading={loading}
        subjectSlug={subjectSlug}
      />
    </div>
  );
}

function PassageView({ node, entryId, groupId, onRefresh, index, subjectSlug }) {
  const [isOpen, setIsOpen] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [showAddChild, setShowAddChild] = useState(false);
  const [showAddOr, setShowAddOr] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleEdit = async (data) => {
    setLoading(true);
    try {
      await nodesService.update(node.id, data);
      setShowEdit(false);
      onRefresh();
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this passage and all its questions?')) return;
    try {
      await nodesService.delete(node.id);
      onRefresh();
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  const handleAddChild = async (data) => {
    setLoading(true);
    try {
      await nodesService.create({ ...data, parent: node.id, entry: entryId, group: groupId || null });
      setShowAddChild(false);
      onRefresh();
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Creates OR separator + question as children of this passage (siblings of existing sub-questions)
  const handleAddOrQuestion = async (data) => {
    setLoading(true);
    try {
      const orOrder = node.children?.length ?? 0;
      await nodesService.create({ question_type: 'or_separator', parent: node.id, entry: entryId, group: groupId || null, order: orOrder });
      await nodesService.create({ ...data, parent: node.id, entry: entryId, group: groupId || null, order: orOrder + 1 });
      setShowAddOr(false);
      onRefresh();
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (showEdit) {
    return (
      <QuestionNodeForm initial={node} onSubmit={handleEdit} onCancel={() => setShowEdit(false)} loading={loading} subjectSlug={subjectSlug} />
    );
  }

  return (
    <div className="border-2 border-orange-200 rounded-lg overflow-hidden">
      <div
        className="flex items-center justify-between px-4 py-3 bg-orange-50 cursor-pointer hover:bg-orange-100 transition-colors select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-mono text-gray-400 shrink-0">Q{index + 1}</span>
          <span className="text-xs font-medium px-2 py-0.5 rounded bg-orange-100 text-orange-700 shrink-0">Passage</span>
          <span className="text-sm text-gray-700 truncate">
            {node.passage_title || extractText(node.content) || <span className="italic text-gray-400">No title</span>}
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
          {node.marks && (
            <span className="text-xs text-gray-500 font-medium bg-white border border-orange-200 px-1.5 py-0.5 rounded">
              {node.marks_label || `${node.marks}m`}
            </span>
          )}
          <span className="text-xs text-gray-400">{node.children?.length || 0} Q</span>
          <button onClick={() => setShowEdit(true)} className="text-xs text-blue-600 hover:underline">Edit</button>
          <button onClick={handleDelete} className="text-xs text-red-500 hover:underline">Delete</button>
          <span className="text-orange-300 text-xs">{isOpen ? '▲' : '▼'}</span>
        </div>
      </div>

      {isOpen && (
        <div className="bg-white">
          {node.passage_title && (
            <div className="px-4 pt-3">
              <p className="text-sm text-gray-500 italic">{node.passage_title}</p>
            </div>
          )}
          {node.content && (
            <div className="px-4 py-3 mx-4 my-3 bg-gray-50 border border-gray-200 rounded leading-relaxed">
              <RichTextRenderer value={node.content} />
            </div>
          )}
          {node.children?.length > 0 && (
            <div className="px-4 pb-3 space-y-2">
              {renderChildrenWithSeparators(node.children, { entryId, groupId, onRefresh, depth: 1, subjectSlug })}
            </div>
          )}
          <div className="px-4 pb-4 space-y-2">
            {showAddChild ? (
              <QuestionNodeForm onSubmit={handleAddChild} onCancel={() => setShowAddChild(false)} loading={loading} subjectSlug={subjectSlug} />
            ) : showAddOr ? (
              <AddOrQuestionForm onSubmit={handleAddOrQuestion} onCancel={() => setShowAddOr(false)} loading={loading} subjectSlug={subjectSlug} />
            ) : (
              <div className="flex gap-2">
                <button onClick={() => setShowAddChild(true)} className="flex-1 border-2 border-dashed border-orange-200 rounded-lg py-2 text-sm text-orange-400 hover:border-orange-400 hover:text-orange-500 transition-colors">
                  + Add Question / Section
                </button>
                <button onClick={() => setShowAddOr(true)} className="flex-1 border-2 border-dashed border-orange-200 rounded-lg py-2 text-sm text-orange-400 hover:border-orange-400 hover:text-orange-500 transition-colors">
                  + Add OR Question
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SectionView({ node, entryId, groupId, onRefresh, subjectSlug }) {
  const [isOpen, setIsOpen] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [showAddChild, setShowAddChild] = useState(false);
  const [showAddOr, setShowAddOr] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleEdit = async (data) => {
    setLoading(true);
    try {
      await nodesService.update(node.id, data);
      setShowEdit(false);
      onRefresh();
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this section and all its questions?')) return;
    try {
      await nodesService.delete(node.id);
      onRefresh();
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  const handleAddChild = async (data) => {
    setLoading(true);
    try {
      await nodesService.create({ ...data, parent: node.id, entry: entryId, group: groupId || null });
      setShowAddChild(false);
      onRefresh();
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrQuestion = async (data) => {
    setLoading(true);
    try {
      const orOrder = node.children?.length ?? 0;
      await nodesService.create({ question_type: 'or_separator', parent: node.id, entry: entryId, group: groupId || null, order: orOrder });
      await nodesService.create({ ...data, parent: node.id, entry: entryId, group: groupId || null, order: orOrder + 1 });
      setShowAddOr(false);
      onRefresh();
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (showEdit) {
    return (
      <QuestionNodeForm initial={node} onSubmit={handleEdit} onCancel={() => setShowEdit(false)} loading={loading} subjectSlug={subjectSlug} />
    );
  }

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      <div
        className="flex items-center justify-between px-3 py-2.5 bg-gray-100 cursor-pointer hover:bg-gray-200 transition-colors select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-200 text-gray-600 shrink-0">Section</span>
          <span className="text-sm text-gray-700 truncate">{extractText(node.content) || 'Section'}</span>
        </div>
        <div className="flex items-center gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
          {node.marks_label && <span className="text-xs text-gray-500 font-medium">{node.marks_label}</span>}
          <span className="text-xs text-gray-400">{node.children?.length || 0} Q</span>
          <button onClick={() => setShowEdit(true)} className="text-xs text-blue-600 hover:underline">Edit</button>
          <button onClick={handleDelete} className="text-xs text-red-500 hover:underline">Delete</button>
          <span className="text-gray-300 text-xs">{isOpen ? '▲' : '▼'}</span>
        </div>
      </div>

      {isOpen && (
        <div className="bg-white divide-y divide-gray-100">
          {node.children?.length > 0 && (
            <div className="p-3 space-y-2">
              {renderChildrenWithSeparators(node.children, { entryId, groupId, onRefresh, depth: 2, subjectSlug })}
            </div>
          )}
          <div className="p-3 space-y-2">
            {showAddChild ? (
              <QuestionNodeForm onSubmit={handleAddChild} onCancel={() => setShowAddChild(false)} loading={loading} subjectSlug={subjectSlug} />
            ) : showAddOr ? (
              <AddOrQuestionForm onSubmit={handleAddOrQuestion} onCancel={() => setShowAddOr(false)} loading={loading} subjectSlug={subjectSlug} />
            ) : (
              <div className="flex gap-2">
                <button onClick={() => setShowAddChild(true)} className="flex-1 border-2 border-dashed border-gray-200 rounded-lg py-2 text-sm text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-colors">
                  + Add Question
                </button>
                <button onClick={() => setShowAddOr(true)} className="flex-1 border-2 border-dashed border-gray-200 rounded-lg py-2 text-sm text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-colors">
                  + Add OR Question
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function QuestionNodeItem({ node, entryId, groupId, onRefresh, depth = 0, index = 0, subjectSlug }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showAddChild, setShowAddChild] = useState(false);
  const [showAddOr, setShowAddOr] = useState(false);
  const [loading, setLoading] = useState(false);

  if (node.question_type === 'or_separator') {
    return <OrSeparatorView node={node} onRefresh={onRefresh} />;
  }

  if (node.question_type === 'passage' && depth === 0) {
    return <PassageView node={node} entryId={entryId} groupId={groupId} onRefresh={onRefresh} index={index} subjectSlug={subjectSlug} />;
  }
  if (node.question_type === 'section') {
    return <SectionView node={node} entryId={entryId} groupId={groupId} onRefresh={onRefresh} index={index} subjectSlug={subjectSlug} />;
  }

  const handleEdit = async (data) => {
    setLoading(true);
    try {
      await nodesService.update(node.id, data);
      setShowEdit(false);
      onRefresh();
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this question and all its sub-questions?')) return;
    try {
      await nodesService.delete(node.id);
      onRefresh();
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  // Adds a child sub-question under this question
  const handleAddChild = async (data) => {
    setLoading(true);
    try {
      await nodesService.create({ ...data, parent: node.id, entry: entryId, group: groupId || null });
      setShowAddChild(false);
      onRefresh();
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Adds OR separator + new question as SIBLINGS immediately after this question (same parent)
  const handleAddOrQuestion = async (data) => {
    setLoading(true);
    try {
      const baseOrder = (node.order ?? 0) + 1;
      await nodesService.create({
        question_type: 'or_separator',
        parent: node.parent ?? null,
        entry: entryId,
        group: groupId || null,
        order: baseOrder,
      });
      await nodesService.create({
        ...data,
        parent: node.parent ?? null,
        entry: entryId,
        group: groupId || null,
        order: baseOrder + 1,
      });
      setShowAddOr(false);
      onRefresh();
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const typeColor = TYPE_COLORS[node.question_type] || 'bg-gray-100 text-gray-600';
  const label = depth === 0 ? `Q${index + 1}` : `${index + 1}`;
  const contentPreview = extractText(node.content);

  if (showEdit) {
    return (
      <div className={depth > 0 ? 'ml-5' : ''}>
        <QuestionNodeForm initial={node} onSubmit={handleEdit} onCancel={() => setShowEdit(false)} loading={loading} subjectSlug={subjectSlug} />
      </div>
    );
  }

  return (
    <div className={depth > 0 ? 'ml-5' : ''}>
      <div className={`border rounded-lg overflow-hidden ${depth === 0 ? 'border-gray-200' : 'border-gray-100'}`}>
        {/* Header row */}
        <div
          className="flex items-center gap-2 px-3 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="text-xs font-mono text-gray-400 w-7 shrink-0">{label}</span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded capitalize shrink-0 ${typeColor}`}>
            {node.question_type.replace('_', ' ')}
          </span>
          <p className="text-sm text-gray-700 flex-1 truncate">
            {contentPreview || <span className="text-gray-400 italic">No content</span>}
          </p>
          <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
            {node.marks && (
              <span className="text-xs text-gray-500 font-medium bg-gray-100 px-1.5 py-0.5 rounded">
                {node.marks_label || `${node.marks}m`}
              </span>
            )}
            <button onClick={() => setShowEdit(true)} className="text-xs text-blue-600 hover:underline">Edit</button>
            <button onClick={handleDelete} className="text-xs text-red-500 hover:underline">Del</button>
          </div>
          <span className="text-gray-300 text-xs shrink-0">{isOpen ? '▲' : '▼'}</span>
        </div>

        {/* Expanded body */}
        {isOpen && (
          <div className="px-4 py-3 border-t border-gray-100 bg-white space-y-3">
            {node.content && (
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Content</p>
                <RichTextRenderer value={node.content} />
              </div>
            )}

            {node.question_type === 'mcq' && node.options?.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Options</p>
                <div className="space-y-1">
                  {node.options.map((opt, i) => (
                    <div key={i} className="flex gap-2 text-sm text-gray-700">
                      <span className="text-gray-400 font-medium shrink-0">({String.fromCharCode(65 + i)})</span>
                      <span>{opt}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {node.answer && (
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Answer</p>
                <RichTextRenderer value={node.answer} />
              </div>
            )}

            {node.explanation && (
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Explanation</p>
                <RichTextRenderer value={node.explanation} />
              </div>
            )}

            {/* Action buttons / inline forms */}
            {showAddChild ? (
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Add Sub-question</p>
                <QuestionNodeForm onSubmit={handleAddChild} onCancel={() => setShowAddChild(false)} loading={loading} subjectSlug={subjectSlug} />
              </div>
            ) : showAddOr ? (
              <AddOrQuestionForm onSubmit={handleAddOrQuestion} onCancel={() => setShowAddOr(false)} loading={loading} subjectSlug={subjectSlug} />
            ) : (
              <div className="flex gap-2 pt-1">
                <button onClick={() => setShowAddChild(true)} className="text-xs text-green-600 hover:underline">
                  + Add Sub-question
                </button>
                <span className="text-gray-200">|</span>
                <button onClick={() => setShowAddOr(true)} className="text-xs text-blue-500 hover:underline">
                  + Add OR Question
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Children */}
      {node.children?.length > 0 && (
        <div className="mt-1.5 space-y-1.5">
          {renderChildrenWithSeparators(node.children, { entryId, groupId, onRefresh, depth: depth + 1, subjectSlug })}
        </div>
      )}
    </div>
  );
}
