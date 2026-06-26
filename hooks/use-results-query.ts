"use client";

import { useQuery } from "@tanstack/react-query";
import type { EnrichedResultsPayload } from "@/types/results";

async function fetchResults(): Promise<EnrichedResultsPayload> {
  const response = await fetch("/api/results");
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? "Failed to load results");
  }
  return response.json();
}

export function useResultsQuery() {
  const refreshSeconds = Number(
    process.env.NEXT_PUBLIC_AUTO_REFRESH_SECONDS ?? 45,
  );

  return useQuery({
    queryKey: ["results"],
    queryFn: fetchResults,
    staleTime: 30_000,
    refetchInterval: refreshSeconds > 0 ? refreshSeconds * 1000 : false,
  });
}
