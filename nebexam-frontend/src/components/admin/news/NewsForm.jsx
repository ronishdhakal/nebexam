'use client';

import { useState, useEffect } from 'react';
import { getErrorMessage, mediaUrl } from '@/lib/utils';
import RichTextEditor from '@/components/ui/RichTextEditor';
import { newsCategoriesService } from '@/services/news.service';

const inp = 'w-full border border-slate-300 bg-white rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1CA3FD] focus:border-transparent transition';
const lbl = 'block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide';

function toSlug(str) {
  return str.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/^-+|-+$/g, '');
}

const defaultForm = {
  title: '',
  slug: '',
  excerpt: '',
  content: null,
  category: '',
  is_published: false,
  published_at: '',
};

export default function NewsForm({ initial = {}, onSubmit, loading }) {
  const [form, setForm] = useState({ ...defaultForm, ...initial });
  // Track whether admin has manually edited slug (stops auto-sync from title)
  const [slugTouched, setSlugTouched] = useState(!!initial.slug);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [pendingFile, setPendingFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    newsCategoriesService.getAll().then((res) => {
      setCategories(res.data.results || res.data);
    }).catch(() => {});
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const payload = { ...form };
      if (!payload.category) payload.category = null;
      if (!payload.published_at) payload.published_at = null;
      // Pass the pending file so the parent can upload it after creation/update
      if (pendingFile) payload._file = pendingFile;
      await onSubmit(payload);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const displayImage = previewUrl || (initial.featured_image ? mediaUrl(initial.featured_image) : null);

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-5 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">{error}</div>
        )}

        {/* Title */}
        <div>
          <label className={lbl}>Title</label>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => {
              const title = e.target.value;
              setForm((f) => ({
                ...f,
                title,
                slug: slugTouched ? f.slug : toSlug(title),
              }));
            }}
            placeholder="Enter news title"
            className={inp}
          />
        </div>

        {/* Slug */}
        <div>
          <label className={lbl}>
            Slug
            <span className="ml-1.5 text-slate-400 font-normal normal-case tracking-normal">
              — URL identifier (changing this breaks existing links)
            </span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={form.slug}
              onChange={(e) => {
                setSlugTouched(true);
                setForm((f) => ({ ...f, slug: e.target.value }));
              }}
              placeholder="auto-generated-from-title"
              className={inp}
            />
            {slugTouched && (
              <button
                type="button"
                onClick={() => { setSlugTouched(false); setForm((f) => ({ ...f, slug: toSlug(f.title) })); }}
                className="shrink-0 text-xs text-slate-400 hover:text-[#1CA3FD] border border-gray-200 px-2.5 py-2 rounded-lg transition-colors whitespace-nowrap"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Excerpt */}
        <div>
          <label className={lbl}>Excerpt / Short Description</label>
          <textarea
            rows={3}
            value={form.excerpt}
            onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
            placeholder="Brief summary shown in news listings..."
            className={inp}
          />
        </div>

        {/* Category + Published At */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={lbl}>Category</label>
            <select
              value={form.category || ''}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className={inp}
            >
              <option value="">— No Category —</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={lbl}>Published Date</label>
            <input
              type="datetime-local"
              value={form.published_at ? form.published_at.slice(0, 16) : ''}
              onChange={(e) => setForm({ ...form, published_at: e.target.value })}
              className={inp}
            />
          </div>
        </div>

        {/* Featured Image */}
        <div>
          <label className={lbl}>Featured Image</label>
          {displayImage && (
            <div className="mb-3">
              <img src={displayImage} alt="Featured" className="h-40 w-auto rounded-lg object-cover border border-gray-200" />
              {pendingFile && <p className="mt-1 text-xs text-amber-600">Image will be saved when you click Save.</p>}
            </div>
          )}
          <div className="flex items-center gap-3">
            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors">
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              {pendingFile ? pendingFile.name.slice(0, 20) + (pendingFile.name.length > 20 ? '…' : '') : 'Choose Image'}
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>
            <span className="text-xs text-slate-400">JPG, PNG, WebP recommended</span>
          </div>
        </div>

        {/* Published toggle */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is_published_news"
            checked={form.is_published}
            onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
            className="rounded border-slate-300 text-[#1CA3FD] focus:ring-[#1CA3FD]"
          />
          <label htmlFor="is_published_news" className="text-sm text-slate-700 font-medium">Published</label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 bg-[#1CA3FD] hover:bg-[#0e8fe0] text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-colors disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save News'}
        </button>
      </form>

      {/* Rich text editor */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <label className={lbl + ' mb-3'}>Content</label>
        <RichTextEditor
          value={form.content}
          onChange={(content) => setForm((f) => ({ ...f, content }))}
          placeholder="Write the full news article here..."
        />
      </div>
    </div>
  );
}
