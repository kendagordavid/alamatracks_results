import type { MetadataRoute } from "next";
import { getClientEnv } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  const { NEXT_PUBLIC_SITE_URL } = getClientEnv();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${NEXT_PUBLIC_SITE_URL}/sitemap.xml`,
  };
}
