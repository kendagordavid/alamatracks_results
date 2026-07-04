"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, RefreshCw, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { useParticipantsQuery } from "@/hooks/use-participants-query";

function formatClock(date: Date) {
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatEventDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function ParticipantsBoard() {
  const { data, isLoading, isError, error, refetch, isFetching, dataUpdatedAt } =
    useParticipantsQuery();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [now, setNow] = useState(() => new Date());

  const participants = data?.participants ?? [];

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    let paused = false;
    const pause = () => {
      paused = true;
    };
    const resume = () => {
      paused = false;
    };

    container.addEventListener("mouseenter", pause);
    container.addEventListener("mouseleave", resume);
    container.addEventListener("touchstart", pause, { passive: true });
    container.addEventListener("touchend", resume);

    const tick = window.setInterval(() => {
      if (paused || container.scrollHeight <= container.clientHeight + 4) {
        return;
      }

      if (container.scrollTop + container.clientHeight >= container.scrollHeight - 4) {
        container.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      container.scrollTop += 2;
    }, 40);

    return () => {
      window.clearInterval(tick);
      container.removeEventListener("mouseenter", pause);
      container.removeEventListener("mouseleave", resume);
      container.removeEventListener("touchstart", pause);
      container.removeEventListener("touchend", resume);
    };
  }, [participants.length]);

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const participant of participants) {
      counts.set(
        participant.category_name,
        (counts.get(participant.category_name) ?? 0) + 1,
      );
    }
    return [...counts.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [participants]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col bg-slate-950 p-6 text-white">
        <Skeleton className="h-16 w-full bg-white/10" />
        <Skeleton className="mt-6 h-full w-full bg-white/10" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950 p-6">
        <div className="max-w-lg">
          <ErrorState
            title="Unable to load participants"
            message={error instanceof Error ? error.message : "Unknown error"}
            onRetry={() => void refetch()}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col overflow-hidden bg-slate-950 text-white">
      <header className="border-b border-white/10 bg-slate-950/95 px-6 py-5 backdrop-blur">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-emerald-400">
              <Users className="size-6" aria-hidden />
              <span className="text-sm font-semibold uppercase tracking-[0.2em]">
                Registered Participants
              </span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl xl:text-6xl">
              {data?.event.name}
            </h1>
            <p className="mt-2 text-lg text-slate-300 md:text-xl">
              {data?.event.location ? `${data.event.location} · ` : ""}
              {data?.event.date ? formatEventDate(data.event.date) : ""}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 xl:justify-end">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-right">
              <p className="text-sm uppercase tracking-wide text-slate-400">
                Total Athletes
              </p>
              <p className="text-4xl font-bold tabular-nums md:text-5xl">
                {participants.length}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-right">
              <p className="text-sm uppercase tracking-wide text-slate-400">
                Live Clock
              </p>
              <p className="font-mono text-3xl font-semibold tabular-nums md:text-4xl">
                {formatClock(now)}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="lg"
                onClick={() => void refetch()}
                disabled={isFetching}
                className="bg-white/10 text-white hover:bg-white/20"
              >
                <RefreshCw
                  className={`mr-2 size-4 ${isFetching ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-white/20 bg-transparent text-white hover:bg-white/10"
              >
                <Link href="/participants">
                  <ArrowLeft className="mr-2 size-4" />
                  Exit
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {categoryCounts.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {categoryCounts.map(([name, count]) => (
              <span
                key={name}
                className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-1.5 text-sm font-medium text-emerald-100 md:text-base"
              >
                {name} · {count}
              </span>
            ))}
          </div>
        ) : null}
      </header>

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-4 md:px-6">
        {participants.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center">
            <div>
              <p className="text-3xl font-semibold md:text-4xl">
                No participants registered yet
              </p>
              <p className="mt-3 text-lg text-slate-400 md:text-xl">
                The roster will appear here once athletes are added in AlamaTracks.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
            <table className="min-w-full table-fixed">
              <thead className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur">
                <tr className="border-b border-white/10">
                  <th className="w-[14%] px-4 py-5 text-left text-xl font-bold uppercase tracking-wide text-emerald-300 md:px-6 md:py-6 md:text-2xl">
                    Bib
                  </th>
                  <th className="w-[46%] px-4 py-5 text-left text-xl font-bold uppercase tracking-wide text-emerald-300 md:px-6 md:py-6 md:text-2xl">
                    Athlete
                  </th>
                  <th className="w-[40%] px-4 py-5 text-left text-xl font-bold uppercase tracking-wide text-emerald-300 md:px-6 md:py-6 md:text-2xl">
                    Category
                  </th>
                </tr>
              </thead>
              <tbody>
                {participants.map((participant, index) => (
                  <tr
                    key={participant.id}
                    className={`border-b border-white/5 ${
                      index % 2 === 0 ? "bg-white/[0.02]" : "bg-transparent"
                    }`}
                  >
                    <td className="px-4 py-4 font-mono text-3xl font-bold tabular-nums text-emerald-300 md:px-6 md:py-5 md:text-5xl xl:text-6xl">
                      {participant.bib_number}
                    </td>
                    <td className="px-4 py-4 text-2xl font-semibold leading-tight md:px-6 md:py-5 md:text-4xl xl:text-5xl">
                      {participant.fullName}
                    </td>
                    <td className="px-4 py-4 text-xl font-medium text-slate-300 md:px-6 md:py-5 md:text-3xl xl:text-4xl">
                      {participant.category_name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <footer className="border-t border-white/10 px-6 py-3 text-sm text-slate-400 md:text-base">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span>AlamaTracks · Event Roster Display</span>
          <span>
            Updated{" "}
            {dataUpdatedAt
              ? new Date(dataUpdatedAt).toLocaleTimeString()
              : "just now"}
          </span>
        </div>
      </footer>
    </div>
  );
}
