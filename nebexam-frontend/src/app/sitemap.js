const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nebexam.com';
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
    { url: `${BASE_URL}/class-8`,  priority: 0.9, changeFrequency: 'weekly' },
    { url: `${BASE_URL}/class-9`,  priority: 0.9, changeFrequency: 'weekly' },
    { url: `${BASE_URL}/class-10`, priority: 0.9, changeFrequency: 'weekly' },
    { url: `${BASE_URL}/class-11`, priority: 0.9, changeFrequency: 'weekly' },
    { url: `${BASE_URL}/class-12`, priority: 0.9, changeFrequency: 'weekly' },
    { url: `${BASE_URL}/disclaimer`, priority: 0.3, changeFrequency: 'yearly' },
    { url: `${BASE_URL}/privacy-policy`, priority: 0.3, changeFrequency: 'yearly' },
    { url: `${BASE_URL}/terms`, priority: 0.3, changeFrequency: 'yearly' },
  ].map((r) => ({ ...r, lastModified: now }));

  // ── Subjects ──────────────────────────────────────────────────────────────
  const subjectEntries = [];
  for (const level of ['8', '9', '10', '11', '12']) {
    const data = await fetchJson(`/content/subjects/?class_level=${level}&page_size=100`);
    const subjects = data?.results ?? data ?? [];
    for (const subject of subjects) {
      const parsed = parseSubjectSlug(subject.slug);
      if (!parsed) continue;
      const { classSlug, subjectSlug } = parsed;
      subjectEntries.push({
        url: `${BASE_URL}/${classSlug}/${subjectSlug}`,
        lastModified: subject.updated_at ? new Date(subject.updated_at) : now,
        priority: 0.85,
        changeFrequency: 'weekly',
      });
      subjectEntries.push({
        url: `${BASE_URL}/${classSlug}/${subjectSlug}/question-bank`,
        lastModified: now,
        priority: 0.75,
        changeFrequency: 'weekly',
      });
      subjectEntries.push({
        url: `${BASE_URL}/${classSlug}/${subjectSlug}/syllabus`,
        lastModified: now,
        priority: 0.65,
        changeFrequency: 'monthly',
      });
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

  return [...staticRoutes, ...subjectEntries, ...blogEntries, ...newsEntries];
}
