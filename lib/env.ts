import { z } from "zod";

const serverSchema = z.object({
  ALAMATRACKS_API_URL: z.string().url(),
  ALAMATRACKS_EVENT_ID: z.string().uuid(),
});

const clientSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
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
    throw new Error(`Invalid environment configuration:\n${formatted}`);
  }
  return result.data;
}

export function getServerEnv() {
  return parseEnv(serverSchema, {
    ALAMATRACKS_API_URL: process.env.ALAMATRACKS_API_URL,
    ALAMATRACKS_EVENT_ID: process.env.ALAMATRACKS_EVENT_ID,
  });
}

export function getClientEnv() {
  return parseEnv(clientSchema, {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_EVENT_LOGO_URL: process.env.NEXT_PUBLIC_EVENT_LOGO_URL,
    NEXT_PUBLIC_AUTO_REFRESH_SECONDS:
      process.env.NEXT_PUBLIC_AUTO_REFRESH_SECONDS,
  });
}
