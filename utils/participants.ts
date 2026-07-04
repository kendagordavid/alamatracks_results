import type {
  EnrichedParticipant,
  PublicParticipantEntry,
} from "@/types/participants";

export function enrichParticipants(
  participants: PublicParticipantEntry[],
): EnrichedParticipant[] {
  return participants.map((participant) => ({
    ...participant,
    fullName: `${participant.first_name} ${participant.last_name}`.trim(),
  }));
}

export function sortParticipants(
  participants: EnrichedParticipant[],
): EnrichedParticipant[] {
  return [...participants].sort((a, b) => {
    const categoryCompare = a.category_name.localeCompare(b.category_name);
    if (categoryCompare !== 0) return categoryCompare;

    const bibA = Number.parseInt(a.bib_number, 10);
    const bibB = Number.parseInt(b.bib_number, 10);
    if (!Number.isNaN(bibA) && !Number.isNaN(bibB) && bibA !== bibB) {
      return bibA - bibB;
    }

    return a.bib_number.localeCompare(b.bib_number, undefined, {
      numeric: true,
    });
  });
}

export function filterParticipants(
  participants: EnrichedParticipant[],
  query: string,
  category: string | null,
): EnrichedParticipant[] {
  const normalizedQuery = query.trim().toLowerCase();

  return participants.filter((participant) => {
    if (category && participant.category_name !== category) {
      return false;
    }

    if (!normalizedQuery) return true;

    return (
      participant.fullName.toLowerCase().includes(normalizedQuery) ||
      participant.bib_number.toLowerCase().includes(normalizedQuery) ||
      participant.category_name.toLowerCase().includes(normalizedQuery)
    );
  });
}

export function getUniqueParticipantCategories(
  participants: EnrichedParticipant[],
): string[] {
  return [...new Set(participants.map((p) => p.category_name))].sort();
}
