import type { Metadata } from "next";
import { Suspense } from "react";
import { StatsDashboard } from "@/features/stats/stats-dashboard";
import { buildEventMetadata } from "@/lib/metadata";
import { fetchPublicResultsFromApi } from "@/services/results-api";
import { Skeleton } from "@/components/ui/skeleton";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const data = await fetchPublicResultsFromApi();
    return {
      ...buildEventMetadata(data.event),
      title: `Statistics — ${data.event.name}`,
    };
  } catch {
    return { title: "Statistics — AlamaTracks" };
  }
}

function StatsSkeleton() {
  return <Skeleton className="h-96 w-full rounded-2xl" />;
}

export default function StatsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Suspense fallback={<StatsSkeleton />}>
        <StatsDashboard />
      </Suspense>
    </div>
  );
}
