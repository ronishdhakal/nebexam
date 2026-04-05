import { subjectsService } from '@/services/subjects.service';
import RichTextRenderer from '@/components/chapter/RichTextRenderer';

export async function generateMetadata({ params }) {
  const { classSlug, subjectSlug } = await params;
  const level = classSlug.replace('class-', '');
  try {
    const res = await subjectsService.getOne(`${subjectSlug}-class-${level}`);
    return {
      title: `Class ${res.data.class_level} ${res.data.name} Syllabus — NEB Exam`,
      description: `Official syllabus for Class ${res.data.class_level} ${res.data.name} as per NEB curriculum.`,
    };
  } catch {
    return { title: 'Syllabus — NEB Exam' };
  }
}

function SyllabusHeader({ subject }) {
  const gradeMap = { '10': 'X', '11': 'XI', '12': 'XII' };
  const grade = gradeMap[subject.class_level] || subject.class_level;

  return (
    <div className="border-b-2 border-black dark:border-slate-400 pb-5 mb-8">
      {/* Sub code — top right */}
      {subject.subject_code && (
        <p className="text-right text-sm font-bold mb-3">
          Sub. code {subject.subject_code}
        </p>
      )}

      {/* Centered header */}
      <div className="text-center space-y-0.5">
        {subject.syllabus_university && (
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {subject.syllabus_university}
          </p>
        )}
        <p className="font-bold text-base tracking-wide">
          NEB — GRADE {grade}
        </p>
        <p className="text-2xl font-extrabold tracking-tight mt-2">{subject.name}</p>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">Syllabus</p>
      </div>

      {/* Time / Marks row */}
      {(subject.syllabus_time || subject.syllabus_full_mark != null) && (
        <div className="mt-5 pt-4 border-t border-gray-300 dark:border-slate-600">
          <div className="flex items-start justify-between flex-wrap gap-2">
            <span className="font-bold text-sm">
              {subject.syllabus_time ? `समय (Time) : ${subject.syllabus_time}` : ''}
            </span>
            <div className="text-right">
              {subject.syllabus_full_mark != null && (
                <p className="font-bold text-sm">
                  पूर्णाङ्क (Full Marks) : {subject.syllabus_full_mark}
                </p>
              )}
              {subject.syllabus_pass_mark != null && (
                <p className="text-xs text-slate-500 mt-0.5">
                  Pass Marks : {subject.syllabus_pass_mark}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default async function SyllabusPage({ params }) {
  const { classSlug, subjectSlug } = await params;
  const level = classSlug.replace('class-', '');
  let subject = null;
  try {
    const res = await subjectsService.getOne(`${subjectSlug}-class-${level}`);
    subject = res.data;
  } catch {}

  const hasMeta = subject && (
    subject.syllabus_university ||
    subject.syllabus_full_mark != null ||
    subject.syllabus_pass_mark != null ||
    subject.syllabus_time ||
    subject.subject_code
  );

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      {subject?.syllabus ? (
        <div>
          {hasMeta && <SyllabusHeader subject={subject} />}
          {!hasMeta && (
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6">
              Class {subject.class_level} {subject.name} Syllabus
            </h1>
          )}
          <RichTextRenderer content={subject.syllabus} />
        </div>
      ) : (
        <div className="text-center py-24">
          <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="text-slate-400">
              <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
              <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
            </svg>
          </div>
          <p className="text-slate-400 text-sm font-medium">No syllabus available yet.</p>
          <p className="text-slate-300 text-xs mt-1">Check back later or contact your teacher.</p>
        </div>
      )}
    </div>
  );
}
