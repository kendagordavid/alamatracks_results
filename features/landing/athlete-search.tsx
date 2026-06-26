"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import type { AthleteResult } from "@/types/results";
import { findAthleteByBib } from "@/utils/rankings";

type AthleteSearchProps = {
  results: AthleteResult[];
  placeholder?: string;
};

export function AthleteSearch({
  results,
  placeholder = "Search by athlete name or bib number…",
}: AthleteSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const matches = query.trim()
    ? results
        .filter((r) => {
          const q = query.toLowerCase();
          return (
            r.fullName.toLowerCase().includes(q) ||
            r.participant.bib_number.toLowerCase().includes(q)
          );
        })
        .slice(0, 8)
    : [];

  function handleSelect(athlete: AthleteResult) {
    router.push(`/athlete/${athlete.id}`);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const bibMatch = findAthleteByBib(results, query);
    if (bibMatch) {
      router.push(`/athlete/${bibMatch.id}`);
      return;
    }
    router.push(`/results?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <Command className="rounded-2xl border border-border/60 bg-card shadow-sm">
        <div className="flex items-center gap-2 border-b px-4">
          <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          <CommandInput
            value={query}
            onValueChange={setQuery}
            placeholder={placeholder}
            className="h-12 border-0"
            aria-label="Search athletes"
          />
        </div>
        {query.trim() ? (
          <CommandList>
            <CommandEmpty>No athletes found.</CommandEmpty>
            <CommandGroup heading="Athletes">
              {matches.map((athlete) => (
                <CommandItem
                  key={athlete.id}
                  value={athlete.fullName}
                  onSelect={() => handleSelect(athlete)}
                >
                  <span className="font-medium">{athlete.fullName}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    Bib {athlete.participant.bib_number}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        ) : null}
      </Command>
    </form>
  );
}
