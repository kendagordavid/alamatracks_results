import type { Metadata } from "next";
import { ParticipantsBoard } from "@/features/participants/participants-board";
import { fetchPublicParticipantsFromApi } from "@/services/participants-api";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const data = await fetchPublicParticipantsFromApi();
    return {
      title: `Participant Board — ${data.event.name}`,
      description: `Live participant roster display for ${data.event.name}.`,
    };
  } catch {
    return { title: "Participant Board — AlamaTracks" };
  }
}

export default function ParticipantsBoardPage() {
  return <ParticipantsBoard />;
}
