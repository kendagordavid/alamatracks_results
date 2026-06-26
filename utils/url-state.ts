import type { AthleteResult } from "@/types/results";

export type ResultsFilterState = {
  q: string;
  categories: string[];
  gender: "all" | "male" | "female" | "other";
  status: "all" | "finished";
  page: number;
  pageSize: number;
  sortBy: keyof AthleteResult | "fullName" | "bib";
  sortDir: "asc" | "desc";
};

export const DEFAULT_FILTER_STATE: ResultsFilterState = {
  q: "",
  categories: [],
  gender: "all",
  status: "all",
  page: 1,
  pageSize: 50,
  sortBy: "overallRank",
  sortDir: "asc",
};

export function filterResults(
  results: AthleteResult[],
  filters: ResultsFilterState,
): AthleteResult[] {
  let filtered = [...results];

  if (filters.q.trim()) {
    const q = filters.q.trim().toLowerCase();
    filtered = filtered.filter(
      (r) =>
        r.fullName.toLowerCase().includes(q) ||
        r.participant.bib_number.toLowerCase().includes(q) ||
        r.category_name.toLowerCase().includes(q),
    );
  }

  if (filters.categories.length) {
    filtered = filtered.filter((r) =>
      filters.categories.includes(r.category_name),
    );
  }

  if (filters.gender !== "all") {
    filtered = filtered.filter((r) => r.inferredGender === filters.gender);
  }

  if (filters.status === "finished") {
    filtered = filtered.filter((r) => r.finish_time != null);
  }

  filtered.sort((a, b) => {
    const dir = filters.sortDir === "asc" ? 1 : -1;

    switch (filters.sortBy) {
      case "fullName":
        return a.fullName.localeCompare(b.fullName) * dir;
      case "bib":
        return a.participant.bib_number.localeCompare(
          b.participant.bib_number,
          undefined,
          { numeric: true },
        ) * dir;
      case "overallRank":
        return (a.overallRank - b.overallRank) * dir;
      case "position":
        return (a.position - b.position) * dir;
      case "category_name":
        return a.category_name.localeCompare(b.category_name) * dir;
      case "chipTimeMs": {
        const aTime = a.chipTimeMs ?? Infinity;
        const bTime = b.chipTimeMs ?? Infinity;
        return (aTime - bTime) * dir;
      }
      default:
        return 0;
    }
  });

  return filtered;
}

export function paginateResults<T>(
  items: T[],
  page: number,
  pageSize: number,
): T[] {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

export function getUniqueCategories(results: AthleteResult[]): string[] {
  return [...new Set(results.map((r) => r.category_name))].sort();
}
