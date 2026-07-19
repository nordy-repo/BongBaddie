import type { MetadataRoute } from "next";
import { listPublishedCollections } from "@/lib/services/collections";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const collections = await listPublishedCollections();

  return [
    { url: siteUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/collections`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/unlock`, changeFrequency: "monthly", priority: 0.6 },
    ...collections.map((c) => ({
      url: `${siteUrl}/collections/${c.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
