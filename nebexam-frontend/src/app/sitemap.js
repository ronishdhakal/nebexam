import { SITE_URL as BASE_URL } from '@/lib/siteUrl';

const API_URL =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:8000/api';

async function fetchJson(path) {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// Parse backend subject slug (e.g. "mathematics-class-11") into
// { classSlug: "class-11", subjectSlug: "mathematics" }
function parseSubjectSlug(slug) {
  const match = slug.match(/^(.+)-class-(10|11|12)$/);
  if (!match) return null;
  return { subjectSlug: match[1], classSlug: `class-${match[2]}` };
}

function flattenChapters(subject) {
  if (subject.areas?.length > 0) {
    return subject.areas.flatMap((area) => area.chapters || []);
  }
  return subject.direct_chapters || [];
}

export default async function sitemap() {
  const now = new Date();

  // ── Static pages ──────────────────────────────────────────────────────────
  const staticRoutes = [
    { url: BASE_URL, priority: 1.0, changeFrequency: 'daily' },
    { url: `${BASE_URL}/about`, priority: 0.6, changeFrequency: 'monthly' },
    { url: `${BASE_URL}/contact`, priority: 0.5, changeFrequency: 'monthly' },
    { url: `${BASE_URL}/how-to-use`, priority: 0.6, changeFrequency: 'monthly' },
    { url: `${BASE_URL}/subscription`, priority: 0.8, changeFrequency: 'weekly' },
    { url: `${BASE_URL}/referral-program`, priority: 0.5, changeFrequency: 'monthly' },
    { url: `${BASE_URL}/blog`, priority: 0.8, changeFrequency: 'daily' },
    { url: `${BASE_URL}/news`, priority: 0.8, changeFrequency: 'daily' },
    { url: `${BASE_URL}/disclaimer`, priority: 0.3, changeFrequency: 'yearly' },
    { url: `${BASE_URL}/privacy-policy`, priority: 0.3, changeFrequency: 'yearly' },
    { url: `${BASE_URL}/terms`, priority: 0.3, changeFrequency: 'yearly' },
  ].map((r) => ({ ...r, lastModified: now }));

  // ── Classes, subjects, tabs & chapters ──────────────────────────────────────
  const classEntries = [];
  const subjectEntries = [];
  const chapterEntries = [];
  const questionPaperEntries = [];

  for (const level of ['8', '9', '10', '11', '12']) {
    const data = await fetchJson(`/content/subjects/?class_level=${level}&page_size=100`);
    const subjects = data?.results ?? data ?? [];

    // Class page — only if it has subjects
    if (subjects.length > 0) {
      classEntries.push({
        url: `${BASE_URL}/class-${level}`,
        lastModified: now,
        priority: 0.9,
        changeFrequency: 'weekly',
      });
      if (level === '11' || level === '12') {
        classEntries.push({ url: `${BASE_URL}/class-${level}/science`, lastModified: now, priority: 0.8, changeFrequency: 'weekly' });
        classEntries.push({ url: `${BASE_URL}/class-${level}/management`, lastModified: now, priority: 0.8, changeFrequency: 'weekly' });
      }
    }

    for (const subjectStub of subjects) {
      const parsed = parseSubjectSlug(subjectStub.slug);
      if (!parsed) continue;
      const { classSlug, subjectSlug } = parsed;
      const base = `${BASE_URL}/${classSlug}/${subjectSlug}`;

      const subject = await fetchJson(`/content/subjects/${subjectStub.slug}/`);
      const chapters = subject ? flattenChapters(subject) : [];
      const hasChapters = chapters.length > 0;
      const hasSyllabus = !!subject?.syllabus;
      const hasTextbook = !!(subject?.book_text || subject?.book_pdf);

      const entries = await fetchJson(`/questionbank/entries/?subject=${subjectStub.slug}&page_size=200`);
      const papers = entries?.results ?? entries ?? [];

      // Skip subjects with no content at all (chapters, syllabus, or papers)
      if (!hasChapters && !hasSyllabus && papers.length === 0) continue;

      subjectEntries.push({
        url: base,
        lastModified: subjectStub.updated_at ? new Date(subjectStub.updated_at) : now,
        priority: 0.85,
        changeFrequency: 'weekly',
      });
      subjectEntries.push({
        url: `${base}/question-bank`,
        lastModified: now,
        priority: 0.75,
        changeFrequency: 'weekly',
      });
      if (hasSyllabus) {
        subjectEntries.push({
          url: `${base}/syllabus`,
          lastModified: now,
          priority: 0.65,
          changeFrequency: 'monthly',
        });
      }
      if (hasChapters) {
        subjectEntries.push({
          url: `${base}/chapter-questions`,
          lastModified: now,
          priority: 0.65,
          changeFrequency: 'weekly',
        });
      }
      if (hasTextbook) {
        subjectEntries.push({
          url: `${base}/textbook`,
          lastModified: now,
          priority: 0.6,
          changeFrequency: 'monthly',
        });
      }

      for (const chapter of chapters) {
        if (!chapter.slug) continue;
        chapterEntries.push({
          url: `${base}/${chapter.slug}`,
          lastModified: chapter.updated_at ? new Date(chapter.updated_at) : now,
          priority: 0.8,
          changeFrequency: 'weekly',
        });
      }

      for (const paper of papers) {
        if (!paper.slug) continue;
        questionPaperEntries.push({
          url: `${base}/question-bank/${paper.slug}`,
          lastModified: paper.updated_at ? new Date(paper.updated_at) : now,
          priority: 0.7,
          changeFrequency: 'monthly',
        });
      }
    }
  }

  // ── Blog posts ────────────────────────────────────────────────────────────
  const blogEntries = [];
  const blogData = await fetchJson('/blog/?page_size=200&is_published=true');
  const blogPosts = blogData?.results ?? blogData ?? [];
  for (const post of blogPosts) {
    if (!post.slug) continue;
    blogEntries.push({
      url: `${BASE_URL}/blog/${post.slug}`,
      lastModified: post.updated_at ? new Date(post.updated_at) : now,
      priority: 0.7,
      changeFrequency: 'monthly',
    });
  }

  // ── News articles ─────────────────────────────────────────────────────────
  const newsEntries = [];
  const newsData = await fetchJson('/news/?page_size=200&is_published=true');
  const newsItems = newsData?.results ?? newsData ?? [];
  for (const item of newsItems) {
    if (!item.slug) continue;
    newsEntries.push({
      url: `${BASE_URL}/news/${item.slug}`,
      lastModified: item.updated_at ? new Date(item.updated_at) : now,
      priority: 0.7,
      changeFrequency: 'monthly',
    });
  }

  return [
    ...staticRoutes,
    ...classEntries,
    ...subjectEntries,
    ...chapterEntries,
    ...questionPaperEntries,
    ...blogEntries,
    ...newsEntries,
  ];
}
