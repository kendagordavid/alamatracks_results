"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Monitor, RefreshCw, Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { useDebouncedValue } from "@/hooks/use-debounced-search";
import { useParticipantsQuery } from "@/hooks/use-participants-query";
import {
  filterParticipants,
  getUniqueParticipantCategories,
} from "@/utils/participants";

export function ParticipantsExperience() {
  const { data, isLoading, isError, error, refetch, isFetching } =
    useParticipantsQuery();
  const [searchInput, setSearchInput] = useState("");
  const [category, setCategory] = useState<string>("all");
  const debouncedSearch = useDebouncedValue(searchInput, 200);

  const allParticipants = data?.participants ?? [];
  const categories = useMemo(
    () => getUniqueParticipantCategories(allParticipants),
    [allParticipants],
  );

  const filtered = useMemo(
    () =>
      filterParticipants(
        allParticipants,
        debouncedSearch,
        category === "all" ? null : category,
      ),
    [allParticipants, debouncedSearch, category],
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Unable to load participants"
        message={error instanceof Error ? error.message : "Unknown error"}
        onRetry={() => void refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-primary">
            <Users className="size-5" aria-hidden />
            <span className="text-sm font-semibold uppercase tracking-wide">
              Event Roster
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            {data?.event.name ?? "Participants"}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {filtered.length} of {allParticipants.length} registered athletes
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => void refetch()}
            disabled={isFetching}
          >
            <RefreshCw
              className={`mr-2 size-4 ${isFetching ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button asChild size="sm">
            <Link href="/participants/board">
              <Monitor className="mr-2 size-4" />
              Big Screen
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search name, bib, or category…"
            className="pl-9"
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No participants found"
          description={
            allParticipants.length === 0
              ? "The participant roster has not been published yet."
              : "Try adjusting your search or category filter."
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="border-b border-border/60 bg-muted/40">
                <tr>
                  <th className="px-4 py-3 text-sm font-semibold">Bib</th>
                  <th className="px-4 py-3 text-sm font-semibold">Athlete</th>
                  <th className="px-4 py-3 text-sm font-semibold">Category</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((participant) => (
                  <tr
                    key={participant.id}
                    className="border-b border-border/40 last:border-b-0 odd:bg-muted/20"
                  >
                    <td className="px-4 py-3 font-mono text-base font-semibold tabular-nums">
                      {participant.bib_number}
                    </td>
                    <td className="px-4 py-3 text-base font-medium">
                      {participant.fullName}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {participant.category_name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
