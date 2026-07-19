'use client';

import useStudyTracker from '@/hooks/useStudyTracker';

export default function ChapterStudyTracker({ chapterSlug, chapterName, subjectSlug, subjectName }) {
  useStudyTracker({ chapterSlug, chapterName, subjectSlug, subjectName });
  return null;
}
