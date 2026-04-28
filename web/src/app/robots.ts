import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/account', '/history'],
      },
    ],
    sitemap: 'https://sufuf.pro/sitemap.xml',
    host: 'https://sufuf.pro',
  };
}
