import QuestionCard from './QuestionCard';

export default function QuestionTree({ questions, paperMode = false, isNepali = false, startIndex = 0, hideMeta = false }) {
  if (!questions?.length) {
    return (
      <div className="text-center py-10">
        <p className="text-sm text-slate-400">No questions available.</p>
      </div>
    );
  }

  // Build a list with resolved numeric indices — separators don't consume a number
  let counter = startIndex;
  const items = questions.map((node) => {
    if (node.question_type === 'or_separator') return { node, index: undefined };
    return { node, index: counter++ };
  });

  return (
    <div className={paperMode ? 'space-y-5' : 'space-y-4'}>
      {items.map(({ node, index }) => (
        <QuestionCard key={node.id} node={node} index={index} paperMode={paperMode} isNepali={isNepali} hideMeta={hideMeta} />
      ))}
    </div>
  );
}
