'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { blogService } from '@/services/news.service';
import BlogForm from '@/components/admin/blog/BlogForm';

export default function NewBlogPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      const { _file, ...rest } = data;
      const res = await blogService.create(rest);
      if (_file) {
        await blogService.uploadFeaturedImage(res.data.slug, _file);
      }
      router.push('/admin/blog');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.push('/admin/blog')} className="text-sm text-slate-500 hover:text-slate-800 flex items-center gap-1">
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Back
        </button>
        <h1 className="text-xl font-bold text-slate-900">New Blog Post</h1>
      </div>
      <BlogForm onSubmit={handleSubmit} loading={loading} />
    </div>
  );
}
