import QuestionTree from './QuestionTree';

export default function GroupSection({ group }) {
  const displayLabel = group.marks_label || group.marks_formula || null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Group header */}
      <div className="px-5 py-4 bg-slate-50 border-b border-gray-100">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <h3 className="text-base font-bold text-slate-900">{group.group_title}</h3>

          <div className="flex items-center gap-2 shrink-0">
            {group.marks != null && (
              <span className="text-xs font-bold bg-[#1CA3FD] text-white px-2.5 py-1 rounded-lg">
                {group.marks} Marks
              </span>
            )}
            {displayLabel && (
              <span className="text-xs font-medium bg-[#1CA3FD]/10 text-[#1CA3FD] px-2.5 py-1 rounded-lg">
                {displayLabel}
              </span>
            )}
          </div>
        </div>

        {group.group_disclaimer && (
          <p className="text-sm text-slate-500 italic mt-2">{group.group_disclaimer}</p>
        )}
      </div>

      <div className="p-5">
        <QuestionTree questions={group.questions || []} />
      </div>
    </div>
  );
}
