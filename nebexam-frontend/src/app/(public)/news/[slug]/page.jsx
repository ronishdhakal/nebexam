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
    <div className="bg-white dark:bg-slate-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-400 mb-8 flex-wrap">
          <Link href="/" className="hover:text-[#1CA3FD] transition-colors">Home</Link>
          <span className="text-slate-300 dark:text-slate-600">/</span>
          <Link href="/news" className="hover:text-[#1CA3FD] transition-colors">News</Link>
          {item.category_name && (
            <>
              <span className="text-slate-300 dark:text-slate-600">/</span>
              <Link href={`/news/category/${item.category_slug}`} className="hover:text-[#1CA3FD] transition-colors">
                {item.category_name}
              </Link>
            </>
          )}
          <span className="text-slate-300 dark:text-slate-600">/</span>
          <span className="text-slate-500 dark:text-slate-400 line-clamp-1 max-w-xs">{item.title}</span>
        </nav>

        <div className="flex gap-12 items-start">

          {/* ── Main Article ── */}
          <article className="flex-1 min-w-0">

            {/* Category + Title + Meta */}
            <header className="mb-6">
              {item.category_name && (
                <Link
                  href={`/news/category/${item.category_slug}`}
                  className="inline-block mb-3 text-xs font-semibold uppercase tracking-widest text-[#1CA3FD] hover:text-[#0e8fd9] transition-colors"
                >
                  {item.category_name}
                </Link>
              )}
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white leading-tight mb-4">
                {item.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                <span className="flex items-center gap-1.5">
                  <CalendarIcon />
                  Published: {publishedDate}
                </span>
                {showModified && (
                  <span className="flex items-center gap-1.5">
                    <EditIcon />
                    Updated: {modifiedDate}
                  </span>
                )}
              </div>
            </header>

            {/* Featured Image */}
            {image && (
              <div className="w-full mb-8 rounded-xl overflow-hidden">
                <Image
                  src={image}
                  alt={item.title}
                  width={0}
                  height={0}
                  sizes="(max-width: 1280px) 100vw, 860px"
                  className="w-full h-auto block"
                  priority
                />
              </div>
            )}

            {/* Excerpt */}
            {item.excerpt && (
              <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-8 pb-8 border-b border-slate-100 dark:border-slate-800 font-medium">
                {item.excerpt}
              </p>
            )}

            {/* Rich text content */}
            {item.content && (
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <RichTextRenderer value={item.content} />
              </div>
            )}
          </article>

          {/* ── Sidebar ── */}
          <aside className="w-64 shrink-0 hidden lg:flex flex-col gap-8 sticky top-8">
            <Link
              href="/news"
              className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-[#1CA3FD] transition-colors"
            >
              <ArrowLeftIcon />
              Back to News
            </Link>

            {recentNews.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">Recent News</h3>
                  <Link href="/news" className="text-xs text-[#1CA3FD] hover:underline">View all</Link>
                </div>
                <ul className="space-y-5">
                  {recentNews.map((n) => (
                    <li key={n.id}>
                      <Link href={`/news/${n.slug}`} className="group flex gap-3 items-start">
                        {n.featured_image ? (
                          <div className="w-14 h-10 rounded-md overflow-hidden shrink-0 relative">
                            <Image
                              src={mediaUrl(n.featured_image)}
                              alt={n.title}
                              fill
                              sizes="56px"
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-14 h-10 rounded-md bg-slate-100 dark:bg-slate-800 shrink-0 flex items-center justify-center">
                            <ImgIcon />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-200 line-clamp-2 group-hover:text-[#1CA3FD] transition-colors leading-snug">
                            {n.title}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">{fmt(n.published_at || n.created_at)}</p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>

        {/* Mobile bottom nav */}
        <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800 lg:hidden">
          <Link href="/news" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-[#1CA3FD] transition-colors">
            <ArrowLeftIcon />
            Back to News
          </Link>

          {recentNews.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">Recent News</h3>
              <ul className="space-y-4">
                {recentNews.map((n) => (
                  <li key={n.id}>
                    <Link href={`/news/${n.slug}`} className="group flex gap-3 items-start">
                      {n.featured_image ? (
                        <div className="w-16 h-12 rounded-md overflow-hidden shrink-0 relative">
                          <Image src={mediaUrl(n.featured_image)} alt={n.title} fill sizes="64px" className="object-cover" />
                        </div>
                      ) : (
                        <div className="w-16 h-12 rounded-md bg-slate-100 dark:bg-slate-800 shrink-0 flex items-center justify-center">
                          <ImgIcon />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200 line-clamp-2 group-hover:text-[#1CA3FD] transition-colors">
                          {n.title}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">{fmt(n.published_at || n.created_at)}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  );
}
function EditIcon() {
  return (
    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  );
}
function ArrowLeftIcon() {
  return (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 5l-7 7 7 7"/>
    </svg>
  );
}
function ImgIcon() {
  return (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300">
      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
    </svg>
  );
}
