import { useEffect, useRef } from 'react';
import { studyService } from '@/services/users.service';
import useAuthStore from '@/store/authStore';

/**
 * Tracks time spent on a chapter and logs it to the backend when the user
 * switches tabs or navigates away. Minimum session: 10 seconds.
 * Uses refs for names so flush always sends the latest loaded values.
 */
export default function useStudyTracker({ chapterSlug, chapterName, subjectSlug, subjectName }) {
  const { isAuthenticated } = useAuthStore();
  const startRef       = useRef(null);
  const pausedRef      = useRef(0);
  const metaRef        = useRef({ chapterSlug, chapterName, subjectSlug, subjectName });

  // Keep metaRef current on every render so flush always uses latest names
  metaRef.current = { chapterSlug, chapterName, subjectSlug, subjectName };

  useEffect(() => {
    if (!isAuthenticated || !chapterSlug) return;

    startRef.current = Date.now();
    pausedRef.current = 0;

    const flush = () => {
      const start = startRef.current;
      if (!start) return;
      const elapsed = Math.floor((Date.now() - start) / 1000) - pausedRef.current;
      if (elapsed < 10) return;
      const { chapterSlug: cs, chapterName: cn, subjectSlug: ss, subjectName: sn } = metaRef.current;
      studyService.log({
        chapter_slug: cs,
        chapter_name: cn,
        subject_slug: ss,
        subject_name: sn,
        duration: elapsed,
      }).catch(() => {});
    };

    const onVisibility = () => {
      if (document.hidden) {
        flush();
        startRef.current  = null;
        pausedRef.current = 0;
      } else {
        startRef.current  = Date.now();
        pausedRef.current = 0;
      }
    };

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('beforeunload', flush);

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('beforeunload', flush);
      flush();
      startRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterSlug, isAuthenticated]);
}
