import Link from 'next/link';
import Image from 'next/image';
import { newsService, newsCategoriesService } from '@/services/news.service';
import { mediaUrl } from '@/lib/utils';

function fmt(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export const metadata = {
  title: 'News — NEB Exam',
  description: 'Latest news, notices and updates for NEB students in Nepal.',
  openGraph: {
    title: 'News — NEB Exam',
    description: 'Latest news, notices and updates for NEB students in Nepal.',
    type: 'website',
  },
};

const PAGE_SIZE = 10;

export default async function NewsListPage({ searchParams }) {
  const { page: pageParam } = await searchParams;
  const page = parseInt(pageParam) || 1;

  let news = [];
  let categories = [];
  let count = 0;

  try {
    const [newsRes, catRes] = await Promise.all([
      newsService.getAll({ page, page_size: PAGE_SIZE }),
      newsCategoriesService.getAll(),
    ]);

    const data = newsRes.data;
    news = data.results ?? data;
    count = data.count ?? data.length;
    categories = catRes.data.results || catRes.data;
  } catch {}

  const totalPages = Math.ceil(count / PAGE_SIZE);

  const buildHref = (p) => p > 1 ? `/news?page=${p}` : '/news';

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-3">
            <Link href="/" className="hover:text-[#1CA3FD] transition-colors">Home</Link>
            <span>/</span>
            <span className="text-slate-700 dark:text-slate-300 font-medium">News</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">News</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Latest news, notices and updates for NEB students
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex gap-10">
          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Category filter pills */}
            {categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-[#1CA3FD] text-white">
                  All
                </span>
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/news/category/${cat.slug}`}
                    className="px-3 py-1.5 rounded-full text-sm font-medium bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-gray-200 dark:border-slate-700 hover:border-[#1CA3FD] hover:text-[#1CA3FD] transition-colors"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            )}

            {news.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-slate-400 text-sm">No news articles available yet.</p>
              </div>
            ) : (
              <>
                <div className="space-y-5">
                  {news.map((item) => (
                    <NewsCard key={item.id} item={item} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <Pagination currentPage={page} totalPages={totalPages} buildHref={buildHref} />
                )}
              </>
            )}
          </div>

          {/* Sidebar */}
          {categories.length > 0 && (
            <aside className="w-64 shrink-0 hidden lg:block">
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5 sticky top-6">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Categories</h3>
                <ul className="space-y-1">
                  <li>
                    <Link href="/news" className="block px-3 py-2 rounded-lg text-sm bg-[#1CA3FD]/10 text-[#1CA3FD] font-medium">
                      All News
                    </Link>
                  </li>
                  {categories.map((cat) => (
                    <li key={cat.id}>
                      <Link href={`/news/category/${cat.slug}`} className="block px-3 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                        {cat.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}

function NewsCard({ item }) {
  const image = item.featured_image ? mediaUrl(item.featured_image) : null;
  const date = fmt(item.published_at || item.created_at);

  return (
    <Link href={`/news/${item.slug}`} className="group block">
      <article className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden hover:shadow-md hover:border-[#1CA3FD]/30 transition-all duration-200">
        <div className="flex">
          {image && (
            <div className="shrink-0 w-52 h-36 overflow-hidden relative">
              <Image
                src={image}
                alt={item.title}
                fill
                sizes="208px"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}
          <div className="flex-1 p-5 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
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
              <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{item.excerpt}</p>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}

function Pagination({ currentPage, totalPages, buildHref }) {
  const pages = [];
  const delta = 2;
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
      pages.push(i);
    }
  }

  // Insert ellipsis markers
  const items = [];
  let prev = null;
  for (const p of pages) {
    if (prev && p - prev > 1) items.push('…');
    items.push(p);
    prev = p;
  }

  return (
    <nav className="flex items-center justify-center gap-1 mt-10" aria-label="Pagination">
      {currentPage > 1 && (
        <Link
          href={buildHref(currentPage - 1)}
          className="px-3 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-gray-200 dark:hover:border-slate-700 transition-colors"
        >
          ← Prev
        </Link>
      )}

      {items.map((item, i) =>
        item === '…' ? (
          <span key={`ellipsis-${i}`} className="px-2 py-2 text-sm text-slate-400">…</span>
        ) : (
          <Link
            key={item}
            href={buildHref(item)}
            className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
              item === currentPage
                ? 'bg-[#1CA3FD] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-gray-200 dark:hover:border-slate-700'
            }`}
          >
            {item}
          </Link>
        )
      )}

      {currentPage < totalPages && (
        <Link
          href={buildHref(currentPage + 1)}
          className="px-3 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-gray-200 dark:hover:border-slate-700 transition-colors"
        >
          Next →
        </Link>
      )}
    </nav>
  );
}
