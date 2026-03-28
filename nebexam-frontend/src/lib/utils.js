/**
 * Resolve a Django FileField path to a full URL.
 * - If it's already absolute (http/https) → return as-is (R2 / CDN URL).
 * - If NEXT_PUBLIC_MEDIA_URL is set (e.g. https://media.nebexam.com) → prepend it.
 * - Otherwise fall back to the API origin so local dev still works.
 */
export const mediaUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const base =
    process.env.NEXT_PUBLIC_MEDIA_URL ||
    (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api').replace('/api', '');
  return `${base}/${path.replace(/^\//, '')}`;
};

export const classNames = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-NP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const slugify = (text) => {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .trim();
};

export const getErrorMessage = (error) => {
  if (error.response?.data) {
    const data = error.response.data;
    if (typeof data === 'string') return data;
    if (data.detail) return data.detail;
    const firstKey = Object.keys(data)[0];
    if (firstKey) return `${firstKey}: ${data[firstKey]}`;
  }
  return 'Something went wrong.';
};