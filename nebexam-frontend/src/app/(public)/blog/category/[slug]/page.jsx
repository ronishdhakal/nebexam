import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { blogService, blogCategoriesService } from '@/services/news.service';
import { mediaUrl } from '@/lib/utils';

function fmt(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

const PAGE_SIZE = 12;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  try {
    const res = await blogCategoriesService.getAll();
    const categories = res.data.results || res.data;
    const cat = categories.find((c) => c.slug === slug);
    if (!cat) return { title: 'Blog — NEB Exam' };
    return {
      title: `${cat.name} — NEB Exam Blog`,
      description: `${cat.name} articles and posts for NEB students in Nepal.`,
    };
  } catch {
    return { title: 'Blog — NEB Exam' };
  }
}

export default async function BlogCategoryPage({ params, searchParams }) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  const page = parseInt(pageParam) || 1;

  let posts = [];
  let categories = [];
  let count = 0;

  try {
    const [postsRes, catRes] = await Promise.all([
      blogService.getAll({ category: slug, page, page_size: PAGE_SIZE }),
      blogCategoriesService.getAll(),
    ]);

    const data = postsRes.data;
    posts = data.results ?? data;
    count = data.count ?? data.length;
    categories = catRes.data.results ?? catRes.data;
  } catch {}

  const activeCategory = categories.find((c) => c.slug === slug);
  if (categories.length > 0 && !activeCategory) notFound();

  const totalPages = Math.ceil(count / PAGE_SIZE);

  const buildHref = (p) =>
    p > 1 ? `/blog/category/${slug}?page=${p}` : `/blog/category/${slug}`;

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-3">
            <Link href="/" className="hover:text-[#1CA3FD] transition-colors">Home</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-[#1CA3FD] transition-colors">Blog</Link>
            <span>/</span>
            <span className="text-slate-700 dark:text-slate-300 font-medium">
              {activeCategory?.name ?? slug}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            {activeCategory?.name ?? slug}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {count} post{count !== 1 ? 's' : ''} in this category
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex gap-10">
          {/* Main */}
          <div className="flex-1 min-w-0">
            {/* Category pills */}
            {categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                <Link href="/blog" className="px-3 py-1.5 rounded-full text-sm font-medium bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-gray-200 dark:border-slate-700 hover:border-[#1CA3FD] hover:text-[#1CA3FD] transition-colors">
                  All
                </Link>
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/blog/category/${cat.slug}`}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      cat.slug === slug
                        ? 'bg-[#1CA3FD] text-white'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-gray-200 dark:border-slate-700 hover:border-[#1CA3FD] hover:text-[#1CA3FD]'
                    }`}
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            )}

            {posts.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-slate-400 text-sm">No posts in this category yet.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {posts.map((item) => <BlogCard key={item.id} item={item} />)}
                </div>
                {totalPages > 1 && (
                  <Pagination currentPage={page} totalPages={totalPages} buildHref={buildHref} />
                )}
              </>
            )}
          </div>

          {/* Sidebar */}
          <aside className="w-64 shrink-0 hidden lg:block">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5 sticky top-6">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Categories</h3>
              <ul className="space-y-1">
                <li>
                  <Link href="/blog" className="block px-3 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                    All Posts
                  </Link>
                </li>
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <Link
                      href={`/blog/category/${cat.slug}`}
                      className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                        cat.slug === slug
                          ? 'bg-[#1CA3FD]/10 text-[#1CA3FD] font-medium'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function BlogCard({ item }) {
  const image = item.featured_image ? mediaUrl(item.featured_image) : null;
  const date = fmt(item.published_at || item.created_at);
  return (
    <Link href={`/blog/${item.slug}`} className="group block h-full">
      <article className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden hover:shadow-md hover:border-[#1CA3FD]/30 transition-all duration-200 h-full flex flex-col">
        {image ? (
          <div className="aspect-video overflow-hidden shrink-0 relative">
            <Image
              src={image}
              alt={item.title}
              fill
              sizes="(max-width: 640px) 100vw, 50vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        ) : (
          <div className="aspect-video bg-gradient-to-br from-[#1CA3FD]/10 to-[#1CA3FD]/5 shrink-0 flex items-center justify-center">
            <svg width="32" height="32" fill="none" stroke="#1CA3FD" strokeWidth="1.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" opacity="0.4">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
            </svg>
          </div>
        )}
        <div className="p-5 flex flex-col flex-1">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {item.category_name && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#1CA3FD]/10 text-[#1CA3FD]">
                {item.category_name}
              </span>
            )}
            <span className="text-xs text-slate-400">{date}</span>
          </div>
          <h2 className="font-bold text-slate-900 dark:text-white text-base leading-snug group-hover:text-[#1CA3FD] transition-colors line-clamp-2 mb-2">
            {item.title}
          </h2>
          {item.excerpt && (
            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 flex-1">{item.excerpt}</p>
          )}
          <div className="mt-4 pt-3 border-t border-gray-50 dark:border-slate-700">
            <span className="text-xs font-medium text-[#1CA3FD] flex items-center gap-1">
              Read more
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

function Pagination({ currentPage, totalPages, buildHref }) {
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) pages.push(i);
  }
  const items = [];
  let prev = null;
  for (const p of pages) {
    if (prev && p - prev > 1) items.push('…');
    items.push(p);
    prev = p;
  }
  return (
    <nav className="flex items-center justify-center gap-1 mt-10">
      {currentPage > 1 && (
        <Link href={buildHref(currentPage - 1)} className="px-3 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-gray-200 transition-colors">← Prev</Link>
      )}
      {items.map((item, i) =>
        item === '…' ? (
          <span key={`e${i}`} className="px-2 py-2 text-sm text-slate-400">…</span>
        ) : (
          <Link key={item} href={buildHref(item)} className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${item === currentPage ? 'bg-[#1CA3FD] text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-gray-200'}`}>
            {item}
          </Link>
        )
      )}
      {currentPage < totalPages && (
        <Link href={buildHref(currentPage + 1)} className="px-3 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-gray-200 transition-colors">Next →</Link>
      )}
    </nav>
  );
}
