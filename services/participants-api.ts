import {
  ParticipantsApiError,
  publicParticipantsResponseSchema,
  type ParticipantsPayload,
} from "@/types/participants";
import { enrichParticipants, sortParticipants } from "@/utils/participants";
import { getServerEnv } from "@/lib/env";

export async function fetchPublicParticipantsFromApi(): Promise<ParticipantsPayload> {
  const { ALAMATRACKS_API_URL, ALAMATRACKS_EVENT_ID } = getServerEnv();
  const url = `${ALAMATRACKS_API_URL}/tracks/public/participants/?event=${ALAMATRACKS_EVENT_ID}`;

  const response = await fetch(url, {
    next: { revalidate: 30 },
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    let message = "Unable to load participants";
    try {
      const body = (await response.json()) as { error?: string };
      if (body.error) message = body.error;
    } catch {
      // ignore parse errors
    }
    throw new ParticipantsApiError(message, response.status);
  }

  const json = await response.json();
  const parsed = publicParticipantsResponseSchema.parse(json);

  return {
    event: parsed.event,
    participants: sortParticipants(enrichParticipants(parsed.participants)),
    fetchedAt: new Date().toISOString(),
  };
}
