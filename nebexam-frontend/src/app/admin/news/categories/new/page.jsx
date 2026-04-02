'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { newsCategoriesService } from '@/services/news.service';
import CategoryForm from '@/components/admin/news/CategoryForm';

export default function NewNewsCategoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      await newsCategoriesService.create(data);
      router.push('/admin/news/categories');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.push('/admin/news/categories')} className="text-sm text-slate-500 hover:text-slate-800 flex items-center gap-1">
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Back
        </button>
        <h1 className="text-xl font-bold text-slate-900">New News Category</h1>
      </div>
      <CategoryForm onSubmit={handleSubmit} loading={loading} />
    </div>
  );
}
