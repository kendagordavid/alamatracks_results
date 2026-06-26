"use client";

import { format, parseISO } from "date-fns";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedCounter } from "@/components/shared/animated-counter";
import { StatCard } from "@/components/shared/stat-card";
import { AthleteSearch } from "@/features/landing/athlete-search";
import type { AthleteResult, PublicEvent } from "@/types/results";
import { getLandingStats } from "@/utils/stats";

type LandingHeroProps = {
  event: PublicEvent;
  results: AthleteResult[];
  lastUpdated?: string;
};

export function LandingHero({ event, results, lastUpdated }: LandingHeroProps) {
  const stats = getLandingStats(results);
  const logoUrl = process.env.NEXT_PUBLIC_EVENT_LOGO_URL;
  const eventDate = format(parseISO(event.date), "EEEE, MMMM d, yyyy");

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl text-center"
        >
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={`${event.name} logo`}
              width={80}
              height={80}
              className="mx-auto mb-6 rounded-2xl"
            />
          ) : (
            <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/70 text-2xl font-bold text-primary-foreground shadow-lg">
              {event.name.slice(0, 2).toUpperCase()}
            </div>
          )}

          <p className="text-sm font-medium uppercase tracking-widest text-primary">
            Official Results
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            {event.name}
          </h1>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-4" aria-hidden />
              {eventDate}
            </span>
            {event.location ? (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-4" aria-hidden />
                {event.location}
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1.5">
              <Users className="size-4" aria-hidden />
              {stats.totalFinishers} finishers
            </span>
          </div>

          {lastUpdated ? (
            <p className="mt-3 text-xs text-muted-foreground">
              Last refreshed{" "}
              {format(parseISO(lastUpdated), "MMM d, yyyy · h:mm a")}
            </p>
          ) : null}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-auto mt-12 max-w-xl"
        >
          <AthleteSearch results={results} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-10 flex justify-center"
        >
          <Button asChild size="lg" className="rounded-xl px-8">
            <Link href="/results">View Results</Link>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <StatCard
            label="Finishers"
            value={<AnimatedCounter value={stats.totalFinishers} />}
          />
          <StatCard
            label="Categories"
            value={<AnimatedCounter value={stats.categories} />}
          />
          <StatCard label="Fastest Time" value={stats.fastest ?? "—"} />
          <StatCard label="Average Time" value={stats.average ?? "—"} />
        </motion.div>
      </div>
    </div>
  );
}
