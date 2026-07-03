import { z } from "zod";
import { ConfigurationError } from "@/lib/errors";

const serverSchema = z.object({
  ALAMATRACKS_API_URL: z.string().url(),
  ALAMATRACKS_EVENT_ID: z.string().uuid(),
});

const clientSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url(),
  NEXT_PUBLIC_EVENT_LOGO_URL: z.string().optional(),
  NEXT_PUBLIC_AUTO_REFRESH_SECONDS: z.coerce.number().int().min(0).default(45),
});

function parseEnv<T extends z.ZodTypeAny>(
  schema: T,
  source: Record<string, string | undefined>,
): z.infer<T> {
  const result = schema.safeParse(source);
  if (!result.success) {
    const formatted = result.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new ConfigurationError(
      `Invalid environment configuration:\n${formatted}`,
    );
  }
  return result.data;
}

const CANONICAL_PRODUCTION_URL = "https://alamatracks-results.vercel.app";

/** Resolve public site URL — supports Vercel auto-injected deployment URLs. */
export function resolveSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  if (process.env.VERCEL_ENV === "production") {
    return CANONICAL_PRODUCTION_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

export function getServerEnv() {
  return parseEnv(serverSchema, {
    ALAMATRACKS_API_URL: process.env.ALAMATRACKS_API_URL,
    ALAMATRACKS_EVENT_ID: process.env.ALAMATRACKS_EVENT_ID,
  });
}

export function getClientEnv() {
  return parseEnv(clientSchema, {
    NEXT_PUBLIC_SITE_URL: resolveSiteUrl(),
    NEXT_PUBLIC_EVENT_LOGO_URL: process.env.NEXT_PUBLIC_EVENT_LOGO_URL,
    NEXT_PUBLIC_AUTO_REFRESH_SECONDS:
      process.env.NEXT_PUBLIC_AUTO_REFRESH_SECONDS,
  });
}

/** Client-safe site URL — prefers the browser origin when available. */
export function getPublicSiteUrl(fallback?: string): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return fallback ?? resolveSiteUrl();
}
