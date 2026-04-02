'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { newsCategoriesService } from '@/services/news.service';
import { getErrorMessage } from '@/lib/utils';
import CategoryForm from '@/components/admin/news/CategoryForm';

export default function EditNewsCategoryPage({ params: rawParams }) {
  const params = use(rawParams);
  const router = useRouter();
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    newsCategoriesService.getOne(params.id)
      .then((res) => setCategory(res.data))
      .catch((err) => alert(getErrorMessage(err)));
  }, [params.id]);

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      await newsCategoriesService.update(params.id, data);
      router.push('/admin/news/categories');
    } finally {
      setLoading(false);
    }
  };

  if (!category) return <p className="text-sm text-slate-500 p-6">Loading...</p>;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.push('/admin/news/categories')} className="text-sm text-slate-500 hover:text-slate-800 flex items-center gap-1">
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Back
        </button>
        <h1 className="text-xl font-bold text-slate-900">Edit Category: {category.name}</h1>
      </div>
      <CategoryForm initial={category} onSubmit={handleSubmit} loading={loading} submitLabel="Update Category" />
    </div>
  );
}
