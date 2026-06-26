import type { Metadata } from "next";
import { Suspense } from "react";
import { ResultsExperience } from "@/features/results/results-table";
import { buildEventMetadata } from "@/lib/metadata";
import { fetchPublicResultsFromApi } from "@/services/results-api";
import { Skeleton } from "@/components/ui/skeleton";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const data = await fetchPublicResultsFromApi();
    return {
      ...buildEventMetadata(data.event),
      title: `Results — ${data.event.name}`,
    };
  } catch {
    return { title: "Results — AlamaTracks" };
  }
}

function ResultsSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-12 w-full rounded-xl" />
      <Skeleton className="h-96 w-full rounded-xl" />
    </div>
  );
}

export default function ResultsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Suspense fallback={<ResultsSkeleton />}>
        <ResultsExperience />
      </Suspense>
    </div>
  );
}
