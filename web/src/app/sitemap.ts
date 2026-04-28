import type { MetadataRoute } from 'next';
import { getAllPosts } from '@/lib/blog';

const BASE = 'https://sufuf.pro';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const pages = [
    { url: '/', priority: 1.0, changeFrequency: 'weekly' as const },
    { url: '/studio', priority: 0.9, changeFrequency: 'weekly' as const },
    { url: '/pricing', priority: 0.8, changeFrequency: 'monthly' as const },
    { url: '/implementation', priority: 0.9, changeFrequency: 'weekly' as const },
    { url: '/blog', priority: 0.8, changeFrequency: 'weekly' as const },
    { url: '/about', priority: 0.7, changeFrequency: 'monthly' as const },
    { url: '/contact', priority: 0.7, changeFrequency: 'monthly' as const },
    { url: '/terms', priority: 0.4, changeFrequency: 'yearly' as const },
    { url: '/privacy', priority: 0.4, changeFrequency: 'yearly' as const },
    { url: '/shipping', priority: 0.4, changeFrequency: 'yearly' as const },
    { url: '/refund', priority: 0.4, changeFrequency: 'yearly' as const },
    { url: '/login', priority: 0.3, changeFrequency: 'yearly' as const },
    { url: '/register', priority: 0.5, changeFrequency: 'yearly' as const },
  ];

  const posts = await getAllPosts().catch(() => []);
  const blogEntries = posts.map((p) => ({
    url: `${BASE}/blog/${p.slug}`,
    lastModified: p.date ? new Date(p.date) : now,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [
    ...pages.map((p) => ({
      url: `${BASE}${p.url}`,
      lastModified: now,
      changeFrequency: p.changeFrequency,
      priority: p.priority,
    })),
    ...blogEntries,
  ];
}
