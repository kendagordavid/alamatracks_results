import { NextResponse } from "next/server";
import { resolveSiteUrl } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function GET() {
  const apiUrl = process.env.ALAMATRACKS_API_URL;
  const eventId = process.env.ALAMATRACKS_EVENT_ID;

  let apiStatus: "ok" | "error" | "skipped" = "skipped";
  let apiMessage = "Not configured";
  let resultCount: number | null = null;
  let eventName: string | null = null;

  if (apiUrl && eventId) {
    try {
      const url = `${apiUrl.replace(/\/$/, "")}/tracks/public/results/?event=${eventId}`;
      const response = await fetch(url, { cache: "no-store" });
      const body = (await response.json()) as {
        error?: string;
        event?: { name?: string };
        results?: unknown[];
      };

      if (response.ok && body.event) {
        apiStatus = "ok";
        apiMessage = "Connected";
        eventName = body.event.name ?? null;
        resultCount = body.results?.length ?? 0;
      } else {
        apiStatus = "error";
        apiMessage = body.error ?? `HTTP ${response.status}`;
      }
    } catch (error) {
      apiStatus = "error";
      apiMessage = error instanceof Error ? error.message : "Fetch failed";
    }
  }

  return NextResponse.json({
    status: apiStatus === "ok" ? "healthy" : "misconfigured",
    siteUrl: resolveSiteUrl(),
    config: {
      ALAMATRACKS_API_URL: apiUrl ? "set" : "missing",
      ALAMATRACKS_EVENT_ID: eventId ? "set" : "missing",
    },
    api: {
      status: apiStatus,
      message: apiMessage,
      eventName,
      resultCount,
    },
  });
}
