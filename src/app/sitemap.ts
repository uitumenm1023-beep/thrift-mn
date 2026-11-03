import type { MetadataRoute } from "next";
import { getCategories, getSitemapEntries } from "@/lib/data/catalog";

const base = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [{ products, shops }, categories] = await Promise.all([getSitemapEntries(), getCategories()]);
  return [
    { url: `${base}/`, changeFrequency: "daily", priority: 1 },
    { url: `${base}/products`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/shops`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/categories`, changeFrequency: "monthly", priority: 0.5 },
    ...categories.map((c) => ({ url: `${base}/products?category=${c.slug}`, changeFrequency: "daily" as const, priority: 0.7 })),
    ...shops.map((s) => ({ url: `${base}/shops/${s.id}`, lastModified: s.updated_at, priority: 0.7 })),
    ...products.map((p) => ({ url: `${base}/products/${p.id}`, lastModified: p.updated_at, priority: 0.6 })),
  ];
}
