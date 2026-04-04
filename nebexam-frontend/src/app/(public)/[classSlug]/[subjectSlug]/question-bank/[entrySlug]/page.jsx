import Link from 'next/link';
import { entriesService } from '@/services/questionbank.service';
import { subjectsService } from '@/services/subjects.service';
import QuestionTree from '@/components/question/QuestionTree';
import RichTextRenderer from '@/components/chapter/RichTextRenderer';

const GRADE = { '10': 'X', '11': 'XI', '12': 'XII' };
const TYPE_LABEL    = { old_question: 'Old Question',    model_question: 'Model Question' };
const TYPE_LABEL_NP = { old_question: 'पुरानो प्रश्नपत्र', model_question: 'नमुना प्रश्नपत्र' };

export async function generateMetadata({ params }) {
  const { classSlug, subjectSlug, entrySlug } = await params;
  const level = classSlug.replace('class-', '');
  const backendSlug = `${subjectSlug}-class-${level}`;
  try {
    const [entryRes, subjectRes] = await Promise.all([
      entriesService.getOne(entrySlug),
      subjectsService.getOne(backendSlug),
    ]);
    const entry   = entryRes.data;
    const subject = subjectRes.data;
    const type    = entry.type === 'model_question' ? 'Model Question' : 'Old Question';
    const parts   = [
      subject.class_level ? `Class ${subject.class_level}` : null,
      subject.name,
      type,
      entry.year || null,
      '(With Solution)',
    ].filter(Boolean);
    return {
      title: `${parts.join(' ')} — NEB Exam`,
      description: `${parts.join(' ')} — complete questions with solutions for NEB exam preparation.`,
    };
  } catch {
    return { title: 'Question Paper — NEB Exam' };
  }
}

export default async function EntryPage({ params }) {
  const { classSlug, subjectSlug, entrySlug } = await params;
  const level = classSlug.replace('class-', '');
  const backendSlug = `${subjectSlug}-class-${level}`;
  const baseUrl = `/${classSlug}/${subjectSlug}`;

  let entry = null;
  let subject = null;
  let allEntries = [];

  try {
    const [entryRes, subjectRes, allRes] = await Promise.all([
      entriesService.getOne(entrySlug),
      subjectsService.getOne(backendSlug),
      entriesService.getAll({ subject: backendSlug }),
    ]);
    entry = entryRes.data;
    subject = subjectRes.data;
    allEntries = allRes.data.results ?? allRes.data ?? [];
  } catch {}

  if (!entry) return (
    <div className="max-w-4xl mx-auto px-6 py-20 text-center text-slate-400 text-sm">Paper not found.</div>
  );

  const grade = GRADE[subject?.class_level] ?? subject?.class_level;
  const isNp = entry.is_nepali;
  const typeLabel = (isNp ? TYPE_LABEL_NP[entry.type] : TYPE_LABEL[entry.type]) ?? entry.type;

  const modelQuestions = allEntries
    .filter((e) => e.type === 'model_question')
    .sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
  const oldQuestions = allEntries
    .filter((e) => e.type === 'old_question')
    .sort((a, b) => (b.year ?? 0) - (a.year ?? 0));

  const sameType = allEntries
    .filter((e) => e.type === entry.type)
    .sort((a, b) => (a.year ?? 0) - (b.year ?? 0));
  const idx  = sameType.findIndex((e) => e.slug === entrySlug);
  const prev = idx > 0 ? sameType[idx - 1] : null;
  const next = idx < sameType.length - 1 ? sameType[idx + 1] : null;

  return (
    <div className="bg-[#f4f6f9] dark:bg-slate-950 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-0 sm:px-4 lg:flex lg:gap-6 lg:items-start">

        {/* ── LEFT SIDEBAR ── */}
        <aside className="hidden lg:block w-60 xl:w-64 shrink-0 sticky top-20 self-start">
          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
            <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Question Papers</p>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mt-0.5 truncate">{subject?.name}</p>
            </div>
            <div className="max-h-[calc(100vh-10rem)] overflow-y-auto">
              {modelQuestions.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900/30 border-b border-gray-100 dark:border-slate-700/50 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#1CA3FD] shrink-0" />
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Model Questions</span>
                    <span className="ml-auto text-[10px] font-semibold bg-[#1CA3FD]/10 text-[#1CA3FD] px-1.5 py-0.5 rounded-full">{modelQuestions.length}</span>
                  </div>
                  <ul className="divide-y divide-gray-50 dark:divide-slate-700/50">
                    {modelQuestions.map((e) => {
                      const isActive = e.slug === entrySlug;
                      return (
                        <li key={e.id}>
                          <Link
                            href={`${baseUrl}/question-bank/${e.slug}`}
                            className={`flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors ${
                              isActive
                                ? 'bg-[#1CA3FD]/10 text-[#1CA3FD] font-semibold'
                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white'
                            }`}
                          >
                            {isActive && <svg className="w-2.5 h-2.5 shrink-0" fill="currentColor" viewBox="0 0 8 8"><circle cx="4" cy="4" r="4"/></svg>}
                            <span className={`truncate ${isActive ? '' : 'pl-[18px]'}`}>{e.title}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
              {oldQuestions.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900/30 border-y border-gray-100 dark:border-slate-700/50 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Old Questions</span>
                    <span className="ml-auto text-[10px] font-semibold bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded-full">{oldQuestions.length}</span>
                  </div>
                  <ul className="divide-y divide-gray-50 dark:divide-slate-700/50">
                    {oldQuestions.map((e) => {
                      const isActive = e.slug === entrySlug;
                      return (
                        <li key={e.id}>
                          <Link
                            href={`${baseUrl}/question-bank/${e.slug}`}
                            className={`flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors ${
                              isActive
                                ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 font-semibold'
                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white'
                            }`}
                          >
                            {isActive && <svg className="w-2.5 h-2.5 shrink-0 text-amber-500" fill="currentColor" viewBox="0 0 8 8"><circle cx="4" cy="4" r="4"/></svg>}
                            <span className={`truncate ${isActive ? '' : 'pl-[18px]'}`}>{e.title}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
            <div className="px-4 py-2.5 border-t border-gray-100 dark:border-slate-700">
              <Link
                href={`${baseUrl}/question-bank`}
                className="text-xs text-slate-400 dark:text-slate-500 hover:text-[#1CA3FD] transition-colors flex items-center gap-1"
              >
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
                Back to Question Bank
              </Link>
            </div>
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <div className="flex-1 min-w-0">
          {/* Breadcrumb */}
          <div className="mb-4">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 flex-wrap">
              <Link href="/" className="hover:text-[#1CA3FD] transition-colors">Home</Link>
              <span>/</span>
              {subject && (
                <>
                  <Link href={`/${classSlug}`} className="hover:text-[#1CA3FD] transition-colors">Class {level}</Link>
                  <span>/</span>
                  <Link href={baseUrl} className="hover:text-[#1CA3FD] transition-colors">{subject.name}</Link>
                  <span>/</span>
                  <Link href={`${baseUrl}/question-bank`} className="hover:text-[#1CA3FD] transition-colors">Question Bank</Link>
                  <span>/</span>
                </>
              )}
              <span className="text-slate-600 dark:text-slate-300 font-medium truncate max-w-[200px]">{entry.title}</span>
            </div>
          </div>

          {/* ── PAPER ── */}
          <div className="bg-white dark:bg-slate-800 shadow-lg border border-gray-200 dark:border-slate-700 sm:rounded-sm print:shadow-none">
            <div className="px-3 sm:px-10 md:px-14 pt-6 sm:pt-8 pb-6 border-b-2 border-black dark:border-slate-400">
              {entry.sub_code && (
                <p className="text-right text-sm font-bold mb-3">
                  {isNp ? 'विषय कोड : ' : 'Sub. code '}{entry.sub_code}
                </p>
              )}
              <div className="text-center space-y-0.5">
                <p className="font-bold text-base tracking-wide">NEB — {isNp ? 'कक्षा' : 'GRADE'} {grade}</p>
                <p className="text-sm font-medium">{entry.year}</p>
                <p className="text-sm font-medium">{typeLabel}</p>
                <p className="text-2xl font-extrabold tracking-tight mt-2">{subject?.name}</p>
              </div>
              <div className="mt-5 text-sm italic text-slate-700 dark:text-slate-300 leading-relaxed">
                {entry.disclaimer ? (
                  <RichTextRenderer content={entry.disclaimer} />
                ) : (
                  <p>
                    {isNp
                      ? 'विद्यार्थीहरूले सकेसम्म आफ्नै शब्दमा उत्तर दिनुपर्नें छ । दायाँ किनारामा दिइएको अङ्कले पूर्णाङ्क जनाउँछ ।'
                      : 'The candidates are required to give their answers in their own words as far as practicable. The figures in the margin indicate full marks.'}
                  </p>
                )}
                {entry.has_disclaimer_2 && entry.disclaimer_2 && (
                  <div className="mt-2"><RichTextRenderer content={entry.disclaimer_2} /></div>
                )}
              </div>
              <div className="mt-5 pt-4 border-t border-gray-300 dark:border-slate-600">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="font-bold text-sm">{entry.time ? `समय${isNp ? '' : ' (Time)'} : ${entry.time}` : ''}</span>
                  <span className="font-bold text-sm">{entry.full_marks ? `पूर्णाङ्क${isNp ? '' : ' (Full Marks)'} : ${entry.full_marks}` : ''}</span>
                </div>
                {entry.pass_marks && (
                  <p className="text-xs text-slate-500 mt-1 text-right">{isNp ? 'उत्तीर्णाङ्क' : 'Pass Marks'} : {entry.pass_marks}</p>
                )}
              </div>
              <p className="mt-3 text-sm font-bold">
                {isNp ? 'सबै प्रश्नको उत्तर दिनुहोस् ।' : 'सबै प्रश्नको उत्तर दिनुहोस् । (Attempt All Questions)'}
              </p>
            </div>

            <div className="px-3 sm:px-10 md:px-14 py-6 sm:py-8 space-y-10">
              {entry.has_group ? (() => {
                let offset = 0;
                return entry.groups?.map((group) => {
                  const startIndex = offset;
                  offset += (group.questions || []).filter((q) => q.question_type !== 'or_separator').length;
                  return <PaperGroup key={group.id} group={group} isNepali={entry.is_nepali} startIndex={startIndex} />;
                });
              })() : (
                <QuestionTree questions={entry.questions || []} paperMode isNepali={entry.is_nepali} />
              )}
            </div>

            <div className="px-3 sm:px-10 md:px-14 py-4 border-t border-gray-200 dark:border-slate-700 flex justify-between items-center text-xs text-slate-400">
              <span>{subject?.name} — {typeLabel} {entry.year}</span>
              <span>NEB Exam</span>
            </div>
          </div>

          {/* Prev / Next */}
          {(prev || next) && (
            <div className="mt-6 grid grid-cols-2 gap-3">
              {prev ? (
                <Link
                  href={`${baseUrl}/question-bank/${prev.slug}`}
                  className="group flex items-center gap-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl px-4 py-3 hover:border-[#1CA3FD]/50 hover:shadow-sm transition-all"
                >
                  <div className="w-8 h-8 rounded-full border border-gray-200 dark:border-slate-600 flex items-center justify-center shrink-0 group-hover:bg-[#1CA3FD] group-hover:border-[#1CA3FD] transition-all">
                    <svg className="text-slate-400 group-hover:text-white transition-colors" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Previous</p>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 group-hover:text-[#1CA3FD] truncate transition-colors">{prev.title}</p>
                  </div>
                </Link>
              ) : <div />}
              {next ? (
                <Link
                  href={`${baseUrl}/question-bank/${next.slug}`}
                  className="group flex items-center gap-3 justify-end text-right bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl px-4 py-3 hover:border-[#1CA3FD]/50 hover:shadow-sm transition-all"
                >
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Next</p>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 group-hover:text-[#1CA3FD] truncate transition-colors">{next.title}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full border border-gray-200 dark:border-slate-600 flex items-center justify-center shrink-0 group-hover:bg-[#1CA3FD] group-hover:border-[#1CA3FD] transition-all">
                    <svg className="text-slate-400 group-hover:text-white transition-colors" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
                  </div>
                </Link>
              ) : <div />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PaperGroup({ group, isNepali, startIndex = 0 }) {
  const displayLabel = group.marks_label || group.marks_formula || null;
  return (
    <div>
      <div className="text-center mb-4">
        <h2 className="text-base font-extrabold underline underline-offset-2 tracking-wide">{group.group_title}</h2>
      </div>
      {(group.group_disclaimer || group.marks != null || displayLabel) && (
        <div className="flex items-start justify-between gap-4 mb-4">
          <p className="text-sm text-slate-700 dark:text-slate-300 italic flex-1">{group.group_disclaimer || ''}</p>
          <div className="shrink-0 flex items-center gap-2">
            {group.marks != null && <span className="font-bold text-sm">{group.marks} Marks</span>}
            {displayLabel && <span className="font-bold text-sm">[{displayLabel}]</span>}
          </div>
        </div>
      )}
      <QuestionTree questions={group.questions || []} paperMode isNepali={isNepali} startIndex={startIndex} />
    </div>
  );
}
