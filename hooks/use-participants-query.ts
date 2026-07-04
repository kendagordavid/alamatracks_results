"use client";

import { useQuery } from "@tanstack/react-query";
import type { ParticipantsPayload } from "@/types/participants";

async function fetchParticipants(): Promise<ParticipantsPayload> {
  const response = await fetch("/api/participants");
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? "Failed to load participants");
  }
  return response.json();
}

export function useParticipantsQuery() {
  const refreshSeconds = Number(
    process.env.NEXT_PUBLIC_AUTO_REFRESH_SECONDS ?? 45,
  );

  return useQuery({
    queryKey: ["participants"],
    queryFn: fetchParticipants,
    staleTime: 30_000,
    refetchInterval: refreshSeconds > 0 ? refreshSeconds * 1000 : false,
  });
}
