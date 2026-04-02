'use client';

import { useState } from 'react';
import Link from 'next/link';
import useNewsCategories from '@/hooks/useNewsCategories';
import { newsCategoriesService } from '@/services/news.service';
import { getErrorMessage } from '@/lib/utils';
import PageHeader from '@/components/admin/shared/PageHeader';

export default function NewsCategoriesPage() {
  const { categories, loading, error, refetch } = useNewsCategories();
  const [deleting, setDeleting] = useState(null);

  const handleDelete = async (id) => {
    if (!confirm('Delete this category? News in this category will be uncategorized.')) return;
    setDeleting(id);
    try {
      await newsCategoriesService.delete(id);
      refetch();
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="News Categories"
        subtitle="Manage categories for news articles"
        action={{ href: '/admin/news/categories/new', label: 'New Category' }}
      />

      <div className="mb-4">
        <Link href="/admin/news" className="text-xs text-[#1CA3FD] hover:underline font-medium">← Back to News</Link>
      </div>

      {loading && <p className="text-sm text-slate-500">Loading...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}

      {!loading && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Name</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Slug</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Order</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-slate-900">{cat.name}</td>
                  <td className="px-5 py-3.5 text-slate-500 font-mono text-xs">{cat.slug}</td>
                  <td className="px-5 py-3.5 text-slate-500">{cat.order}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <Link href={`/admin/news/categories/${cat.id}`} className="text-[#1CA3FD] hover:text-[#0e8fe0] text-xs font-medium">Edit</Link>
                      <button onClick={() => handleDelete(cat.id)} disabled={deleting === cat.id} className="text-red-500 hover:text-red-700 text-xs font-medium disabled:opacity-40">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {categories.length === 0 && <div className="text-center py-12 text-slate-400 text-sm">No categories yet.</div>}
        </div>
      )}
    </div>
  );
}
