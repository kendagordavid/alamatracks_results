"use client";

import {
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from "nuqs";

const sortByOptions = [
  "overallRank",
  "fullName",
  "bib",
  "category_name",
  "chipTimeMs",
  "position",
] as const;

export function useResultsFilters() {
  return useQueryStates(
    {
      q: parseAsString.withDefault(""),
      category: parseAsArrayOf(parseAsString).withDefault([]),
      gender: parseAsStringLiteral(["all", "male", "female", "other"]).withDefault(
        "all",
      ),
      status: parseAsStringLiteral(["all", "finished"]).withDefault("all"),
      page: parseAsInteger.withDefault(1),
      pageSize: parseAsInteger.withDefault(50),
      sortBy: parseAsStringLiteral([...sortByOptions]).withDefault("overallRank"),
      sortDir: parseAsStringLiteral(["asc", "desc"]).withDefault("asc"),
    },
    { history: "push", shallow: true },
  );
}

export type SortByOption = (typeof sortByOptions)[number];
