'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import NextImage from 'next/image';
import { newsService } from '@/services/news.service';
import { getErrorMessage, mediaUrl } from '@/lib/utils';
import PageHeader from '@/components/admin/shared/PageHeader';
import Pagination from '@/components/admin/shared/Pagination';

const PAGE_SIZE = 20;

const selectCls = 'text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1CA3FD]/30 focus:border-[#1CA3FD]';

function fmt(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function StatusBadge({ published }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
      published ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
    }`}>
      {published ? 'Published' : 'Draft'}
    </span>
  );
}

export default function NewsListPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deleting, setDeleting] = useState(null);

  const fetchItems = useCallback(async (p, q, s) => {
    setLoading(true);
    setError(null);
    try {
      const params = { page: p, page_size: PAGE_SIZE };
      if (q) params.search = q;
      if (s === 'published') params.is_published = 'true';
      if (s === 'draft') params.is_published = 'false';
      const res = await newsService.getAll(params);
      setItems(res.data.results || res.data);
      setCount(res.data.count ?? (res.data.results ? res.data.count : res.data.length));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1); }, [search, statusFilter]);

  useEffect(() => {
    const t = setTimeout(() => fetchItems(page, search, statusFilter), search ? 300 : 0);
    return () => clearTimeout(t);
  }, [page, search, statusFilter, fetchItems]);

  const handleDelete = async (slug) => {
    if (!confirm('Delete this news article?')) return;
    setDeleting(slug);
    try {
      await newsService.delete(slug);
      fetchItems(page, search, statusFilter);
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="News"
        subtitle="Manage news articles"
        action={{ href: '/admin/news/new', label: 'New Article' }}
      />

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={selectCls + ' min-w-[200px]'}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={selectCls}>
          <option value="">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
        {(statusFilter || search) && (
          <button onClick={() => { setStatusFilter(''); setSearch(''); }} className="text-xs text-slate-400 hover:text-slate-600 underline">
            Clear
          </button>
        )}
        <Link href="/admin/news/categories" className="ml-auto text-xs text-[#1CA3FD] hover:underline font-medium">
          Manage Categories →
        </Link>
        {!loading && (
          <span className="text-xs text-slate-400">{count} article{count !== 1 ? 's' : ''}</span>
        )}
      </div>

      {loading && <p className="text-sm text-slate-500">Loading...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}

      {!loading && (
        <>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[700px]">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Title</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Category</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Published</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Modified</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {item.featured_image && (
                            <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-gray-100 relative">
                              <NextImage src={mediaUrl(item.featured_image)} alt="" fill sizes="40px" className="object-cover" />
                            </div>
                          )}
                          <span className="font-medium text-slate-900 line-clamp-1">{item.title}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-500">{item.category_name || '—'}</td>
                      <td className="px-5 py-3.5 text-slate-500 text-xs">{fmt(item.published_at || item.created_at)}</td>
                      <td className="px-5 py-3.5 text-slate-500 text-xs">{fmt(item.updated_at)}</td>
                      <td className="px-5 py-3.5">
                        <StatusBadge published={item.is_published} />
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <Link href={`/admin/news/${item.slug}`} className="text-[#1CA3FD] hover:text-[#0e8fe0] text-xs font-medium">Edit</Link>
                          <button onClick={() => handleDelete(item.slug)} disabled={deleting === item.slug} className="text-red-500 hover:text-red-700 text-xs font-medium disabled:opacity-40">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {items.length === 0 && <div className="text-center py-12 text-slate-400 text-sm">No news articles found.</div>}
          </div>
          <Pagination page={page} count={count} pageSize={PAGE_SIZE} onPage={setPage} />
        </>
      )}
    </div>
  );
}
