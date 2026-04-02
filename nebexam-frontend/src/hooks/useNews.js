'use client';

import { useState, useEffect } from 'react';
import { newsService } from '@/services/news.service';
import { getErrorMessage } from '@/lib/utils';

export default function useNews(params = {}) {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await newsService.getAll(params);
      setNews(res.data.results || res.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  return { news, loading, error, refetch: fetchNews };
}
