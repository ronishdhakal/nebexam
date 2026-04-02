import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { newsService } from '@/services/news.service';
import { mediaUrl } from '@/lib/utils';
import RichTextRenderer from '@/components/ui/RichTextRenderer';

function fmt(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  try {
    const res = await newsService.getOne(slug);
    const item = res.data;
    return {
      title: `${item.title} — NEB Exam`,
      description: item.excerpt || '',
      openGraph: item.featured_image
        ? { images: [{ url: mediaUrl(item.featured_image) }] }
        : undefined,
    };
  } catch {
    return { title: 'News — NEB Exam' };
  }
}

export default async function NewsDetailPage({ params }) {
  const { slug } = await params;

  let item;
  let recentNews = [];

  try {
    const res = await newsService.getOne(slug);
    item = res.data;
  } catch {
    notFound();
  }

  try {
    const res = await newsService.getAll({ page_size: 6 });
    const all = res.data.results || res.data;
    recentNews = all.filter((n) => n.slug !== slug).slice(0, 5);
  } catch {}

  const image = item.featured_image ? mediaUrl(item.featured_image) : null;
  const publishedDate = fmt(item.published_at || item.created_at);
  const modifiedDate = fmt(item.updated_at);
  const showModified = item.updated_at && item.updated_at !== item.created_at;

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6 flex-wrap">
          <Link href="/" className="hover:text-[#1CA3FD] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/news" className="hover:text-[#1CA3FD] transition-colors">News</Link>
          {item.category_name && (
            <>
              <span>/</span>
              <Link href={`/news/category/${item.category_slug}`} className="hover:text-[#1CA3FD] transition-colors">
                {item.category_name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-slate-600 dark:text-slate-300 line-clamp-1 max-w-xs">{item.title}</span>
        </nav>

        <div className="flex gap-8 items-start">
          {/* ── Main Article ── */}
          <article className="flex-1 min-w-0 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden shadow-sm">
            <div className="p-6 sm:p-8">
              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white leading-tight mb-3">
                {item.title}
              </h1>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-3 mb-6 pb-6 border-b border-gray-100 dark:border-slate-700">
                {item.category_name && (
                  <Link
                    href={`/news/category/${item.category_slug}`}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#1CA3FD]/10 text-[#1CA3FD] hover:bg-[#1CA3FD]/20 transition-colors"
                  >
                    {item.category_name}
                  </Link>
                )}
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    Published: {publishedDate}
                  </span>
                  {showModified && (
                    <span className="flex items-center gap-1.5">
                      <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                      Updated: {modifiedDate}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Featured Image — full width, natural height, after meta */}
            {image && (
              <div className="w-full bg-slate-100 dark:bg-slate-900">
                <Image
                  src={image}
                  alt={item.title}
                  width={0}
                  height={0}
                  sizes="(max-width: 1280px) 100vw, 900px"
                  className="w-full h-auto block"
                  priority
                />
              </div>
            )}

            <div className="p-6 sm:p-8">
              {/* Excerpt */}
              {item.excerpt && (
                <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed mb-6 pb-6 border-b border-gray-100 dark:border-slate-700">
                  {item.excerpt}
                </p>
              )}

              {/* Rich text content */}
              {item.content && (
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  <RichTextRenderer value={item.content} />
                </div>
              )}
            </div>
          </article>

          {/* ── Right Sidebar ── */}
          <aside className="w-72 shrink-0 hidden lg:block space-y-5">
            {recentNews.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center justify-between">
                  Recent News
                  <Link href="/news" className="text-xs font-medium text-[#1CA3FD] hover:underline">View all</Link>
                </h3>
                <ul className="space-y-4">
                  {recentNews.map((n) => (
                    <li key={n.id}>
                      <Link href={`/news/${n.slug}`} className="group flex gap-3 items-start">
                        {n.featured_image ? (
                          <div className="w-16 h-12 rounded-lg overflow-hidden shrink-0 border border-gray-100 dark:border-slate-700 relative">
                            <Image
                              src={mediaUrl(n.featured_image)}
                              alt={n.title}
                              fill
                              sizes="64px"
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-12 rounded-lg bg-slate-100 dark:bg-slate-700 shrink-0 flex items-center justify-center">
                            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300">
                              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                            </svg>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-2 group-hover:text-[#1CA3FD] transition-colors leading-snug">
                            {n.title}
                          </p>
                          <p className="text-xs text-slate-400 mt-1">{fmt(n.published_at || n.created_at)}</p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Back link */}
            <Link
              href="/news"
              className="flex items-center gap-2 text-sm text-slate-500 hover:text-[#1CA3FD] transition-colors"
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 5l-7 7 7 7"/>
              </svg>
              Back to News
            </Link>
          </aside>
        </div>

        {/* Mobile back link */}
        <div className="mt-8 lg:hidden">
          <Link href="/news" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#1CA3FD] transition-colors">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            Back to News
          </Link>
        </div>
      </div>
    </div>
  );
}
