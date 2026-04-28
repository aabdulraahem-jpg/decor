import type { MetadataRoute } from 'next';

const BASE = 'https://sufuf.pro';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const pages = [
    { url: '/', priority: 1.0, changeFrequency: 'weekly' as const },
    { url: '/studio', priority: 0.9, changeFrequency: 'weekly' as const },
    { url: '/pricing', priority: 0.8, changeFrequency: 'monthly' as const },
    { url: '/implementation', priority: 0.9, changeFrequency: 'weekly' as const },
    { url: '/about', priority: 0.7, changeFrequency: 'monthly' as const },
    { url: '/contact', priority: 0.7, changeFrequency: 'monthly' as const },
    { url: '/terms', priority: 0.4, changeFrequency: 'yearly' as const },
    { url: '/privacy', priority: 0.4, changeFrequency: 'yearly' as const },
    { url: '/shipping', priority: 0.4, changeFrequency: 'yearly' as const },
    { url: '/refund', priority: 0.4, changeFrequency: 'yearly' as const },
    { url: '/login', priority: 0.3, changeFrequency: 'yearly' as const },
    { url: '/register', priority: 0.5, changeFrequency: 'yearly' as const },
  ];
  return pages.map((p) => ({
    url: `${BASE}${p.url}`,
    lastModified: now,
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }));
}
