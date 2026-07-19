// Canonical production origin. nebexam.com (no www) 301-redirects to
// www.nebexam.com — every canonical/OG/sitemap URL must use the www form
// so we don't ship links that immediately redirect.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.nebexam.com';

export function absoluteUrl(path = '') {
  if (!path) return SITE_URL;
  const clean = path.startsWith('/') ? path : `/${path}`;
  const stripped = clean.length > 1 ? clean.replace(/\/$/, '') : clean;
  return `${SITE_URL}${stripped}`;
}
