'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { newsService } from '@/services/news.service';
import { getErrorMessage } from '@/lib/utils';
import NewsForm from '@/components/admin/news/NewsForm';

export default function EditNewsPage({ params: rawParams }) {
  const params = use(rawParams);
  const router = useRouter();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    newsService.getOne(params.slug)
      .then((res) => setItem(res.data))
      .catch((err) => alert(getErrorMessage(err)));
  }, [params.slug]);

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      const { _file, ...rest } = data;
      await newsService.update(params.slug, rest);
      if (_file) {
        await newsService.uploadFeaturedImage(params.slug, _file);
      }
      router.push('/admin/news');
    } finally {
      setLoading(false);
    }
  };

  if (!item) return <p className="text-sm text-slate-500 p-6">Loading...</p>;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.push('/admin/news')} className="text-sm text-slate-500 hover:text-slate-800 flex items-center gap-1">
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Back
        </button>
        <h1 className="text-xl font-bold text-slate-900">Edit News Article</h1>
      </div>
      <NewsForm initial={item} onSubmit={handleSubmit} loading={loading} />
    </div>
  );
}
