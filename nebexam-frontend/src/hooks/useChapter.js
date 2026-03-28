import { useState, useEffect } from 'react';
import { chaptersService } from '@/services/chapters.service';
import { getErrorMessage } from '@/lib/utils';

const useChapter = (slug) => {
  const [chapter, setChapter] = useState(null);
  const [importantQuestions, setImportantQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) return;
    const fetch = async () => {
      try {
        setLoading(true);
        const chapterRes = await chaptersService.getOne(slug);
        setChapter(chapterRes.data);
        try {
          const questionsRes = await chaptersService.getImportantQuestions(slug);
          setImportantQuestions(questionsRes.data);
        } catch {
          setImportantQuestions([]);
        }
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [slug]);

  return { chapter, importantQuestions, loading, error };
};

export default useChapter;