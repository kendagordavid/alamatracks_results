import type { Metadata } from "next";
import { Suspense } from "react";
import { ParticipantsExperience } from "@/features/participants/participants-view";
import { buildEventMetadata } from "@/lib/metadata";
import { fetchPublicParticipantsFromApi } from "@/services/participants-api";
import { Skeleton } from "@/components/ui/skeleton";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const data = await fetchPublicParticipantsFromApi();
    return {
      ...buildEventMetadata(data.event),
      title: `Participants — ${data.event.name}`,
    };
  } catch {
    return { title: "Participants — AlamaTracks" };
  }
}

function ParticipantsSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-12 w-full rounded-xl" />
      <Skeleton className="h-96 w-full rounded-xl" />
    </div>
  );
}

export default function ParticipantsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Suspense fallback={<ParticipantsSkeleton />}>
        <ParticipantsExperience />
      </Suspense>
    </div>
  );
}
