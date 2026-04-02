'use client';

import { useState, useEffect } from 'react';
import { blogService } from '@/services/news.service';
import { getErrorMessage } from '@/lib/utils';

export default function useBlog(params = {}) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await blogService.getAll(params);
      setPosts(res.data.results || res.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return { posts, loading, error, refetch: fetchPosts };
}
