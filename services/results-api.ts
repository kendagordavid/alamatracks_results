import {
  publicResultsResponseSchema,
  ResultsApiError,
  type EnrichedResultsPayload,
} from "@/types/results";
import { enrichResults } from "@/utils/rankings";
import { getServerEnv } from "@/lib/env";

export async function fetchPublicResultsFromApi(): Promise<EnrichedResultsPayload> {
  const { ALAMATRACKS_API_URL, ALAMATRACKS_EVENT_ID } = getServerEnv();
  const url = `${ALAMATRACKS_API_URL}/tracks/public/results/?event=${ALAMATRACKS_EVENT_ID}`;

  const response = await fetch(url, {
    next: { revalidate: 30 },
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    let message = "Unable to load results";
    try {
      const body = (await response.json()) as { error?: string };
      if (body.error) message = body.error;
    } catch {
      // ignore parse errors
    }
    throw new ResultsApiError(message, response.status);
  }

  const json = await response.json();
  const parsed = publicResultsResponseSchema.parse(json);

  return {
    event: parsed.event,
    results: enrichResults(parsed.results),
    fetchedAt: new Date().toISOString(),
  };
}

export async function fetchPublicResultsFromProxy(
  origin: string,
): Promise<EnrichedResultsPayload> {
  const response = await fetch(`${origin}/api/results`, {
    next: { revalidate: 30 },
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    throw new ResultsApiError(
      body.error ?? "Unable to load results",
      response.status,
    );
  }

  return response.json() as Promise<EnrichedResultsPayload>;
}
