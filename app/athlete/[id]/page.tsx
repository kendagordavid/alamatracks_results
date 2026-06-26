import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AthleteProfileContent } from "@/features/athlete/athlete-profile";
import {
  buildAthleteMetadata,
  buildSportsEventJsonLd,
} from "@/lib/metadata";
import { fetchPublicResultsFromApi } from "@/services/results-api";
import { findAthleteById } from "@/utils/rankings";

type AthletePageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: AthletePageProps): Promise<Metadata> {
  try {
    const { id } = await params;
    const data = await fetchPublicResultsFromApi();
    const athlete = findAthleteById(data.results, id);
    if (!athlete) return { title: "Athlete Not Found" };
    return buildAthleteMetadata(data.event, athlete);
  } catch {
    return { title: "Athlete — AlamaTracks" };
  }
}

export default async function AthletePage({ params }: AthletePageProps) {
  const { id } = await params;
  const data = await fetchPublicResultsFromApi();
  const athlete = findAthleteById(data.results, id);

  if (!athlete) {
    notFound();
  }

  const jsonLd = {
    ...buildSportsEventJsonLd(data.event, data.results.length),
    performer: {
      "@type": "Person",
      name: athlete.fullName,
      identifier: athlete.participant.bib_number,
    },
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Button asChild variant="ghost" size="sm" className="mb-6">
        <Link href="/results">
          <ArrowLeft className="size-4" />
          Back to results
        </Link>
      </Button>
      <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
        <AthleteProfileContent
          athlete={athlete}
          allResults={data.results}
          eventName={data.event.name}
        />
      </div>
    </div>
  );
}
