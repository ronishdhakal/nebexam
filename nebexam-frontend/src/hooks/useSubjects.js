import { useState, useEffect } from 'react';
import { subjectsService } from '@/services/subjects.service';
import { getErrorMessage } from '@/lib/utils';

const useSubjects = (params = {}) => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const res = await subjectsService.getAll(params);
      setSubjects(res.data.results || res.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  return { subjects, loading, error, refetch: fetchSubjects };
};

export default useSubjects;