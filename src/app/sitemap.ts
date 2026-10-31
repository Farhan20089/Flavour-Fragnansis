import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://flavourandfragrances.com';
  return [
    { url: siteUrl, changeFrequency: 'daily', priority: 1.0 },
    { url: `${siteUrl}/shop`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${siteUrl}/flavours`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${siteUrl}/fragrances`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${siteUrl}/about`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrl}/contact`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrl}/privacy`, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${siteUrl}/terms`, changeFrequency: 'yearly', priority: 0.5 },
  ];
}
