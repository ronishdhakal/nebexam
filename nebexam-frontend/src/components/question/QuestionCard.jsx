'use client';

import { useState } from 'react';
import Link from 'next/link';
import RichTextRenderer from '@/components/chapter/RichTextRenderer';
import useAuthStore from '@/store/authStore';
import useConfigStore from '@/store/configStore';
import { authService } from '@/services/users.service';
import UpgradePlanModal from '@/components/dashboard/UpgradePlanModal';

const FREE_ANSWER_LIMIT = 4;

const TYPE_BADGE = {
  mcq:        { label: 'MCQ',        cls: 'bg-[#1CA3FD]/10 text-[#1CA3FD]' },
  short:      { label: 'Short',      cls: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300' },
  long:       { label: 'Long',       cls: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300' },
  passage:    { label: 'Passage',    cls: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300' },
  section:    { label: 'Section',    cls: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300' },
  fill_blank: { label: 'Fill Blank', cls: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300' },
  true_false: { label: 'True/False', cls: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300' },
  essay:      { label: 'Essay',      cls: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300' },
  letter:     { label: 'Letter',     cls: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300' },
  grammar:    { label: 'Grammar',    cls: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300' },
};

const MCQ_PAPER_LABELS = ['a.', 'b.', 'c.', 'd.', 'e.'];
const MCQ_CARD_LABELS  = ['A', 'B', 'C', 'D', 'E'];
const ROMAN_LABELS     = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x'];
const NEPALI_LABELS    = ['क', 'ख', 'ग', 'घ', 'ङ', 'च', 'छ', 'ज', 'झ', 'ञ'];
const NEPALI_LABELS_2  = ['अ', 'आ', 'इ', 'ई', 'उ', 'ऊ', 'ए', 'ऐ', 'ओ', 'औ'];
const NEPALI_DIGITS    = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
const toNepaliNum = (n) => String(n).replace(/[0-9]/g, (d) => NEPALI_DIGITS[d]);

// Returns [{child, labelIndex}] where or_separator nodes get labelIndex=undefined
// and real questions are numbered 0,1,2,...
// Labels are shown when there are 2+ real children OR when an or_separator is present
// (even a single real sub-question still gets "a." if there's an OR among siblings).
function indexChildren(children) {
  const hasOrSep  = children.some(c => c.question_type === 'or_separator');
  const realCount = children.filter(c => c.question_type !== 'or_separator').length;
  const showLabels = hasOrSep ? realCount >= 1 : realCount > 1;
  let counter = 0;
  return children.map(child => {
    if (child.question_type === 'or_separator') {
      counter = 0; // reset so post-OR children restart at "a.", "i.", etc.
      return { child, labelIndex: undefined };
    }
    const labelIndex = showLabels ? counter : undefined;
    counter++;
    return { child, labelIndex };
  });
}

function getNumLabel(index, depth, isNepali) {
  if (index === undefined) return null;
  if (depth === 0) return isNepali ? `${toNepaliNum(index + 1)}.` : `${index + 1}.`;
  if (depth === 1) return isNepali ? `(${NEPALI_LABELS[index]})` : `${String.fromCharCode(97 + index)}.`;
  // depth >= 2 → Roman numerals
  return isNepali ? `(${NEPALI_LABELS_2[index]})` : `${ROMAN_LABELS[index] ?? index + 1}.`;
}

function ContentBlock({ content }) {
  if (!content) return null;
  if (typeof content === 'string') return <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">{content}</p>;
  return <RichTextRenderer content={content} />;
}

function AnswerReveal({ answer, explanation }) {
  const [open, setOpen]             = useState(false);
  const [blocked, setBlocked]       = useState(null); // 'login' | 'upgrade'
  const [loading, setLoading]       = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const { isAuthenticated, user, setUser } = useAuthStore();
  const subscriptionRequired = useConfigStore((s) => s.subscriptionRequired);
  const esewaEnabled         = useConfigStore((s) => s.esewaEnabled);
  const currentTier          = user?.subscription_tier || 'free';

  if (!answer && !explanation) return null;

  const isPaid = user?.subscription_tier && user.subscription_tier !== 'free';
  const used   = user?.free_answers_used ?? 0;

  const handleToggle = async () => {
    if (open) { setOpen(false); return; }
    // Subscription disabled — reveal freely without any gate
    if (!subscriptionRequired) { setOpen(true); return; }
    if (!isAuthenticated) { setBlocked('login'); return; }
    if (isPaid) { setOpen(true); return; }

    // Free user — check limit before calling API
    if (used >= FREE_ANSWER_LIMIT) { setBlocked('upgrade'); return; }

    setLoading(true);
    try {
      const res = await authService.revealAnswer();
      if (res.data.allowed) {
        setUser({ ...user, free_answers_used: res.data.free_answers_used });
        setOpen(true);
      } else {
        setBlocked('upgrade');
      }
    } catch {
      setBlocked('upgrade');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-3 clear-right">

      {/* ── Inline toggle link ── */}
      {!blocked && (
        <button
          onClick={handleToggle}
          disabled={loading}
          className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-[#1CA3FD] transition-colors disabled:opacity-50"
        >
          <svg
            width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            style={{ transform: open ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.15s' }}
          >
            <polyline points="9 18 15 12 9 6"/>
          </svg>
          {loading ? '…' : open ? 'Hide Answer' : 'Answer'}
        </button>
      )}

      {/* ── Login gate ── */}
      {blocked === 'login' && (
        <div className="mt-2 flex items-center gap-3 flex-wrap">
          <span className="text-[11px] text-slate-400 italic">Sign in to see the answer.</span>
          <Link href="/auth/login"
            className="text-[11px] font-semibold text-[#1CA3FD] hover:underline">
            Sign in
          </Link>
          <Link href="/auth/register"
            className="text-[11px] font-semibold text-slate-500 hover:text-slate-700 hover:underline">
            Create free account
          </Link>
        </div>
      )}

      {/* ── Upgrade gate ── */}
      {blocked === 'upgrade' && (
        <div className="mt-2 flex items-center gap-3 flex-wrap">
          <span className="text-[11px] text-slate-400 italic">
            Free limit reached ({FREE_ANSWER_LIMIT} answers).
          </span>
          {esewaEnabled ? (
            <button
              onClick={() => setShowUpgrade(true)}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1CA3FD] hover:underline"
            >
              Upgrade Plan →
            </button>
          ) : (
            <a
              href={`https://wa.me/9779745450062?text=${encodeURIComponent('Hi, I would like to purchase a NEB Exam subscription.')}`}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-600 hover:underline"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Upgrade via WhatsApp
            </a>
          )}
        </div>
      )}

      {showUpgrade && (
        <UpgradePlanModal currentTier={currentTier} onClose={() => setShowUpgrade(false)} />
      )}

      {/* ── Answer content ── */}
      {open && (
        <div className="mt-2 border-l-2 border-[#1CA3FD]/40 pl-3 space-y-2">
          {answer && (
            <div>
              <span className="text-[10px] font-bold text-[#1CA3FD] uppercase tracking-widest block mb-1">Ans.</span>
              <div className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                <ContentBlock content={answer} />
              </div>
            </div>
          )}
          {explanation && (
            <div className="pt-1 border-t border-dashed border-slate-200 dark:border-slate-700">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Hint</span>
              <div className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                <ContentBlock content={explanation} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── PAPER MODE question card ── */
function PaperQuestionCard({ node, index, depth, isNepali = false }) {
  // OR separator — rendered as a centred label; also render any children (questions mistakenly nested under it)
  if (node.question_type === 'or_separator') {
    return (
      <>
        <div className="py-1 text-center">
          <span className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase">Or</span>
        </div>
        {node.children?.length > 0 && indexChildren(node.children).map(({ child, labelIndex }) => (
          <PaperQuestionCard key={child.id} node={child} index={labelIndex} depth={Math.max(depth, 1)} isNepali={isNepali} />
        ))}
      </>
    );
  }

  const numLabel = getNumLabel(index, depth, isNepali);
  const marksStr = node.marks_label || (node.marks ? `${node.marks}` : null);

  // ── SECTION ──
  if (node.question_type === 'section') {
    return (
      <div className="mt-4 mb-2">
        {/* Show label + section instruction on same line if both exist */}
        {(numLabel || node.content) && (
          <div className="flex items-start gap-3">
            {numLabel && (
              <span className="shrink-0 font-bold text-sm text-slate-900 dark:text-slate-100 w-6 text-right mt-0.5">
                {numLabel}
              </span>
            )}
            {node.content && (
              <div className="italic text-sm text-slate-600 dark:text-slate-400 flex-1">
                <ContentBlock content={node.content} />
              </div>
            )}
          </div>
        )}
        {node.children?.length > 0 && (
          <div className="mt-3 space-y-4 pl-4">
            {indexChildren(node.children).map(({ child, labelIndex }) => (
              <PaperQuestionCard key={child.id} node={child} index={labelIndex} depth={depth + 1} isNepali={isNepali} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── PASSAGE ──
  if (node.question_type === 'passage') {
    return (
      <div className="mb-4">
        {/* Passage label + title */}
        <div className="flex items-start gap-3 mb-2">
          {numLabel && (
            <span className="shrink-0 font-bold text-sm text-slate-900 dark:text-slate-100 w-6 text-right mt-0.5">
              {numLabel}
            </span>
          )}
          <div className="flex-1 min-w-0">
            {marksStr && (
              <span className="float-right font-bold text-sm text-slate-700 dark:text-slate-300 ml-3 whitespace-nowrap">
                [{marksStr}]
              </span>
            )}
            {node.passage_title && (
              <p className="font-semibold text-sm">{node.passage_title}</p>
            )}
          </div>
        </div>
        {/* Passage body */}
        <div className={`text-sm leading-relaxed text-slate-800 dark:text-slate-200 border-l-2 border-gray-300 dark:border-slate-600 pl-4 py-1 ${numLabel ? 'ml-9' : ''}`}>
          <ContentBlock content={node.content} />
        </div>
        {/* Sub-questions — depth+1 so they get i, ii, iii */}
        {node.children?.length > 0 && (
          <div className={`mt-4 space-y-4 ${numLabel ? 'ml-9' : ''}`}>
            {indexChildren(node.children).map(({ child, labelIndex }) => (
              <PaperQuestionCard key={child.id} node={child} index={labelIndex} depth={depth + 1} isNepali={isNepali} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── DEFAULT (short, long, mcq, etc.) ──
  return (
    <div className="flex items-start gap-3">
      {numLabel && (
        <span className="shrink-0 font-bold text-sm text-slate-900 dark:text-slate-100 w-6 text-right mt-0.5">
          {numLabel}
        </span>
      )}
      <div className="flex-1 min-w-0">
        {marksStr && (
          <span className="float-right font-bold text-sm text-slate-700 dark:text-slate-300 ml-3 whitespace-nowrap">
            [{marksStr}]
          </span>
        )}
        <ContentBlock content={node.content} />

        {/* MCQ options */}
        {node.question_type === 'mcq' && node.options?.length > 0 && (
          <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1.5 clear-right">
            {node.options.map((opt, i) => (
              <div key={i} className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-1.5">
                <span className="shrink-0 font-medium w-5">{MCQ_PAPER_LABELS[i]}</span>
                <div className="flex-1 min-w-0"><ContentBlock content={opt} /></div>
              </div>
            ))}
          </div>
        )}

        {/* Sub-questions */}
        {node.children?.length > 0 && (
          <div className={`${node.content ? 'mt-3' : ''} space-y-3 pl-4 clear-right`}>
            {indexChildren(node.children).map(({ child, labelIndex }) => (
              <PaperQuestionCard key={child.id} node={child} index={labelIndex} depth={depth + 1} isNepali={isNepali} />
            ))}
          </div>
        )}

        <AnswerReveal answer={node.answer} explanation={node.explanation} />
      </div>
    </div>
  );
}

/* ── CARD MODE question card (default study view) ── */
function CardQuestionCard({ node, index, depth, hideMeta = false }) {
  if (node.question_type === 'or_separator') {
    return (
      <>
        <div className="py-1 text-center">
          <span className="text-xs font-bold text-slate-400 uppercase">Or</span>
        </div>
        {node.children?.length > 0 && indexChildren(node.children).map(({ child, labelIndex }) => (
          <CardQuestionCard key={child.id} node={child} index={labelIndex} depth={Math.max(depth, 1)} hideMeta={hideMeta} />
        ))}
      </>
    );
  }

  if (node.question_type === 'section') {
    return (
      <div className="mt-6 mb-3">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-200 dark:bg-slate-700" />
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full">
            {node.content
              ? (typeof node.content === 'string' ? node.content : 'Section')
              : 'Section'}
          </span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
        {node.children?.length > 0 && (
          <div className="mt-4 space-y-4">
            {indexChildren(node.children).map(({ child, labelIndex }) => (
              <CardQuestionCard key={child.id} node={child} index={labelIndex} depth={depth + 1} hideMeta={hideMeta} />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (node.question_type === 'passage') {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="bg-slate-50 dark:bg-slate-900/40 border-b border-gray-100 dark:border-slate-700 px-5 py-4">
          {node.passage_title && (
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-1">{node.passage_title}</h4>
          )}
          {!hideMeta && node.marks && (
            <span className="text-xs text-slate-500 font-medium">{node.marks_label || `${node.marks} marks`}</span>
          )}
        </div>
        <div className="px-5 py-4 border-b border-gray-50 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/20">
          <ContentBlock content={node.content} />
        </div>
        {node.children?.length > 0 && (
          <div className="px-5 py-4 space-y-4">
            {indexChildren(node.children).map(({ child, labelIndex }) => (
              <CardQuestionCard key={child.id} node={child} index={labelIndex} depth={depth + 1} hideMeta={hideMeta} />
            ))}
          </div>
        )}
      </div>
    );
  }

  const isRoot = depth === 0;
  const badge  = TYPE_BADGE[node.question_type];

  const entryTypeLabel = node.entry_type === 'model_question' ? 'Model Question'
    : node.entry_type === 'old_question' ? 'Old Question' : null;
  const sourceBadge = entryTypeLabel
    ? `${entryTypeLabel}${node.entry_year ? ` · ${node.entry_year}` : ''}`
    : null;

  return (
    <div className={isRoot
      ? 'bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-5'
      : 'border-l-2 border-[#1CA3FD]/20 pl-4 py-1'
    }>
      <div className="flex items-start gap-3 mb-3">
        {isRoot && index !== undefined && (
          <span className="shrink-0 w-7 h-7 rounded-lg bg-[#1CA3FD]/10 text-[#1CA3FD] text-xs font-bold flex items-center justify-center mt-0.5">
            {index + 1}
          </span>
        )}
        {!isRoot && index !== undefined && (
          <span className="shrink-0 font-semibold text-sm text-slate-600 dark:text-slate-400 w-5 text-right mt-0.5">
            {getNumLabel(index, depth, false)}
          </span>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {!hideMeta && badge && (
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide ${badge.cls}`}>
                {badge.label}
              </span>
            )}
            {!hideMeta && node.marks && (
              <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                {node.marks_label || `${node.marks}m`}
              </span>
            )}
            {sourceBadge && isRoot && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 ring-1 ring-amber-200">
                {sourceBadge}
              </span>
            )}
          </div>
          <ContentBlock content={node.content} />

          {node.question_type === 'mcq' && node.options?.length > 0 && (
            <div className="mt-3 space-y-2">
              {node.options.map((opt, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className="shrink-0 w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold flex items-center justify-center mt-0.5">
                    {MCQ_CARD_LABELS[i]}
                  </span>
                  <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed pt-0.5 flex-1 min-w-0">
                    <ContentBlock content={opt} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AnswerReveal answer={node.answer} explanation={node.explanation} />

      {node.children?.length > 0 && (
        <div className="mt-4 space-y-4 border-t border-gray-50 dark:border-slate-700 pt-4">
          {indexChildren(node.children).map(({ child, labelIndex }) => (
            <CardQuestionCard key={child.id} node={child} index={labelIndex} depth={depth + 1} hideMeta={hideMeta} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Exported component ── */
export default function QuestionCard({ node, index, depth = 0, paperMode = false, isNepali = false, hideMeta = false }) {
  if (paperMode) {
    return <PaperQuestionCard node={node} index={index} depth={depth} isNepali={isNepali} />;
  }
  return <CardQuestionCard node={node} index={index} depth={depth} hideMeta={hideMeta} />;
}
