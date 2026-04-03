const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nebexam.com';

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/dashboard/',
          '/auth/',
          '/checkout/',
          '/payment/',
          '/api/',
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
