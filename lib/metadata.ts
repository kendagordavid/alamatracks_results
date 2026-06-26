import type { Metadata } from "next";
import type { AthleteResult, PublicEvent } from "@/types/results";
import { getClientEnv } from "@/lib/env";

export function buildEventMetadata(event: PublicEvent): Metadata {
  const { NEXT_PUBLIC_SITE_URL } = getClientEnv();
  const title = `${event.name} — Official Results`;
  const description = `Live race results for ${event.name}${event.location ? ` at ${event.location}` : ""}. Powered by AlamaTracks.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: NEXT_PUBLIC_SITE_URL,
      siteName: "AlamaTracks",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export function buildAthleteMetadata(
  event: PublicEvent,
  athlete: AthleteResult,
): Metadata {
  const { NEXT_PUBLIC_SITE_URL } = getClientEnv();
  const title = `${athlete.fullName} — ${event.name}`;
  const description = `${athlete.fullName} finished ${athlete.chipTimeFormatted ?? "—"} in ${event.name}. Overall rank #${athlete.overallRank}, ${athlete.category_name} #${athlete.position}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "profile",
      url: `${NEXT_PUBLIC_SITE_URL}/athlete/${athlete.id}`,
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export function buildSportsEventJsonLd(event: PublicEvent, resultCount: number) {
  const { NEXT_PUBLIC_SITE_URL } = getClientEnv();

  return {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: event.name,
    startDate: event.date,
    location: event.location
      ? { "@type": "Place", name: event.location }
      : undefined,
    url: NEXT_PUBLIC_SITE_URL,
    organizer: {
      "@type": "Organization",
      name: "AlamaTracks",
    },
    sport: "Running",
    eventStatus: "https://schema.org/EventScheduled",
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      price: "0",
      priceCurrency: "USD",
    },
    maximumAttendeeCapacity: resultCount,
  };
}

export function buildResultsListJsonLd(
  event: PublicEvent,
  results: AthleteResult[],
) {
  const { NEXT_PUBLIC_SITE_URL } = getClientEnv();

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${event.name} Results`,
    numberOfItems: results.length,
    itemListElement: results.slice(0, 20).map((r, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${NEXT_PUBLIC_SITE_URL}/athlete/${r.id}`,
      name: r.fullName,
    })),
  };
}
