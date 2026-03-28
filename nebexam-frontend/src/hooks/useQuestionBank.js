import { useState, useEffect } from 'react';
import { entriesService } from '@/services/questionbank.service';
import { getErrorMessage } from '@/lib/utils';

const useQuestionBank = (params = {}) => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const res = await entriesService.getAll(params);
      setEntries(res.data.results || res.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  return { entries, loading, error, refetch: fetchEntries };
};

export default useQuestionBank;