import QuestionCard from './QuestionCard';

export default function QuestionTree({ questions, paperMode = false, isNepali = false, startIndex = 0, hideMeta = false }) {
  if (!questions?.length) {
    return (
      <div className="text-center py-10">
        <p className="text-sm text-slate-400">No questions available.</p>
      </div>
    );
  }

  // Build a list with resolved numeric indices — separators don't consume a number,
  // and the question immediately after an OR separator shares the same number as
  // the question before it (both are Q17, not Q17 and Q18).
  let counter = startIndex;
  let prevWasOrSep = false;
  const items = questions.map((node) => {
    if (node.question_type === 'or_separator') {
      prevWasOrSep = true;
      return { node, index: undefined };
    }
    if (prevWasOrSep) {
      prevWasOrSep = false;
      return { node, index: counter - 1 }; // same number as the question before OR
    }
    prevWasOrSep = false;
    return { node, index: counter++ };
  });

  return (
    <div className={paperMode ? 'space-y-5' : 'space-y-0 sm:space-y-4'}>
      {items.map(({ node, index }) => (
        <QuestionCard key={node.id} node={node} index={index} paperMode={paperMode} isNepali={isNepali} hideMeta={hideMeta} />
      ))}
    </div>
  );
}
