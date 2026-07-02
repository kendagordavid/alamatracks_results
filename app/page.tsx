import type { Metadata } from "next";
import { Suspense } from "react";
import { AnnouncementsBanner } from "@/features/landing/announcements-banner";
import { LandingHero } from "@/features/landing/landing-hero";
import { PhotoGalleryPlaceholder } from "@/features/landing/photo-gallery";
import { ApiErrorPanel } from "@/components/shared/api-error-panel";
import {
  buildEventMetadata,
  buildResultsListJsonLd,
  buildSportsEventJsonLd,
} from "@/lib/metadata";
import { ConfigurationError, getConfigurationHint } from "@/lib/errors";
import { fetchPublicResultsFromApi } from "@/services/results-api";
import { Skeleton } from "@/components/ui/skeleton";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const data = await fetchPublicResultsFromApi();
    return buildEventMetadata(data.event);
  } catch {
    return { title: "AlamaTracks — Official Race Results" };
  }
}

function LandingSkeleton() {
  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-16">
      <Skeleton className="mx-auto h-12 w-64" />
      <Skeleton className="mx-auto h-96 max-w-xl rounded-2xl" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

async function LandingContent() {
  try {
    const data = await fetchPublicResultsFromApi();
    const sportsJsonLd = buildSportsEventJsonLd(data.event, data.results.length);
    const listJsonLd = buildResultsListJsonLd(data.event, data.results);

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(sportsJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(listJsonLd) }}
        />
        <AnnouncementsBanner />
        <LandingHero
          event={data.event}
          results={data.results}
          lastUpdated={data.fetchedAt}
        />
        <PhotoGalleryPlaceholder />
      </>
    );
  } catch (error) {
    const hint = getConfigurationHint(error);
    const showConfigHelp =
      error instanceof ConfigurationError || hint.includes("environment variables") || hint.includes("event ID");
    return (
      <ApiErrorPanel
        message={hint}
        showConfigHelp={showConfigHelp}
      />
    );
  }
}

export default function HomePage() {
  return (
    <Suspense fallback={<LandingSkeleton />}>
      <LandingContent />
    </Suspense>
  );
}
