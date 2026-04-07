'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { blogService } from '@/services/news.service';
import { getErrorMessage } from '@/lib/utils';
import BlogForm from '@/components/admin/blog/BlogForm';

export default function EditBlogPage({ params: rawParams }) {
  const params = use(rawParams);
  const router = useRouter();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    blogService.getOne(params.slug)
      .then((res) => setItem(res.data))
      .catch((err) => alert(getErrorMessage(err)));
  }, [params.slug]);

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      const { _file, ...rest } = data;
      const res = await blogService.update(params.slug, rest);
      const newSlug = res.data.slug || params.slug;
      if (_file) {
        await blogService.uploadFeaturedImage(newSlug, _file);
      }
      router.push('/admin/blog');
    } finally {
      setLoading(false);
    }
  };

  if (!item) return <p className="text-sm text-slate-500 p-6">Loading...</p>;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.push('/admin/blog')} className="text-sm text-slate-500 hover:text-slate-800 flex items-center gap-1">
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Back
        </button>
        <h1 className="text-xl font-bold text-slate-900">Edit Blog Post</h1>
      </div>
      <BlogForm initial={item} onSubmit={handleSubmit} loading={loading} />
    </div>
  );
}
