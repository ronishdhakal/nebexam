'use client';

import { useState } from 'react';
import Link from 'next/link';
import NextImage from 'next/image';
import useBlog from '@/hooks/useBlog';
import { blogService } from '@/services/news.service';
import { getErrorMessage, mediaUrl } from '@/lib/utils';
import PageHeader from '@/components/admin/shared/PageHeader';

const selectCls = 'text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1CA3FD]/30 focus:border-[#1CA3FD]';

function fmt(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function BlogListPage() {
  const { posts, loading, error, refetch } = useBlog();
  const [deleting, setDeleting] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const handleDelete = async (slug) => {
    if (!confirm('Delete this blog post?')) return;
    setDeleting(slug);
    try {
      await blogService.delete(slug);
      refetch();
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setDeleting(null);
    }
  };

  const filtered = posts.filter((p) => {
    if (statusFilter === 'published' && !p.is_published) return false;
    if (statusFilter === 'draft' && p.is_published) return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <PageHeader
        title="Blog"
        subtitle="Manage blog posts"
        action={{ href: '/admin/blog/new', label: 'New Post' }}
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
        <Link href="/admin/blog/categories" className="ml-auto text-xs text-[#1CA3FD] hover:underline font-medium">
          Manage Categories →
        </Link>
        {!loading && (
          <span className="text-xs text-slate-400">{filtered.length} of {posts.length}</span>
        )}
      </div>

      {loading && <p className="text-sm text-slate-500">Loading...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}

      {!loading && (
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
                {filtered.map((item) => (
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
                        <Link href={`/admin/blog/${item.slug}`} className="text-[#1CA3FD] hover:text-[#0e8fe0] text-xs font-medium">Edit</Link>
                        <button onClick={() => handleDelete(item.slug)} disabled={deleting === item.slug} className="text-red-500 hover:text-red-700 text-xs font-medium disabled:opacity-40">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && <div className="text-center py-12 text-slate-400 text-sm">No blog posts found.</div>}
        </div>
      )}
    </div>
  );
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
