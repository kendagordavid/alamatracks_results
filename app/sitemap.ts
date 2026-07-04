import type { MetadataRoute } from "next";
import { fetchPublicResultsFromApi } from "@/services/results-api";
import { getClientEnv } from "@/lib/env";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { NEXT_PUBLIC_SITE_URL } = getClientEnv();

  try {
    const data = await fetchPublicResultsFromApi();
    const athleteUrls = data.results.slice(0, 50).map((r) => ({
      url: `${NEXT_PUBLIC_SITE_URL}/athlete/${r.id}`,
      lastModified: new Date(data.fetchedAt),
      changeFrequency: "hourly" as const,
      priority: 0.6,
    }));

    return [
      {
        url: NEXT_PUBLIC_SITE_URL,
        lastModified: new Date(data.fetchedAt),
        changeFrequency: "hourly",
        priority: 1,
      },
      {
        url: `${NEXT_PUBLIC_SITE_URL}/participants`,
        lastModified: new Date(data.fetchedAt),
        changeFrequency: "hourly",
        priority: 0.9,
      },
      {
        url: `${NEXT_PUBLIC_SITE_URL}/participants/board`,
        lastModified: new Date(data.fetchedAt),
        changeFrequency: "hourly",
        priority: 0.8,
      },
      {
        url: `${NEXT_PUBLIC_SITE_URL}/results`,
        lastModified: new Date(data.fetchedAt),
        changeFrequency: "hourly",
        priority: 0.9,
      },
      {
        url: `${NEXT_PUBLIC_SITE_URL}/stats`,
        lastModified: new Date(data.fetchedAt),
        changeFrequency: "daily",
        priority: 0.7,
      },
      ...athleteUrls,
    ];
  } catch {
    return [
      {
        url: NEXT_PUBLIC_SITE_URL,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 1,
      },
    ];
  }
}
