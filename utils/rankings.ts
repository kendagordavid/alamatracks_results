import type { AthleteResult, PublicResult } from "@/types/results";
import {
  computeGunTimeMs,
  computeSpeedKmh,
  formatDurationMs,
  inferGenderFromCategory,
  parseDurationToMs,
} from "@/utils/time";

export function enrichResults(results: PublicResult[]): AthleteResult[] {
  const withTimes = results.map((result) => {
    const chipTimeMs = parseDurationToMs(result.duration);
    const gunTimeMs = computeGunTimeMs(result.start_time, result.finish_time);

    return {
      ...result,
      fullName: `${result.participant.first_name} ${result.participant.last_name}`.trim(),
      overallRank: 0,
      chipTimeMs,
      gunTimeMs,
      speedKmh: computeSpeedKmh(chipTimeMs, result.distance),
      inferredGender: inferGenderFromCategory(result.category_name),
      chipTimeFormatted: formatDurationMs(chipTimeMs),
      gunTimeFormatted: formatDurationMs(gunTimeMs),
    };
  });

  const sorted = [...withTimes].sort((a, b) => {
    if (a.chipTimeMs == null && b.chipTimeMs == null) return 0;
    if (a.chipTimeMs == null) return 1;
    if (b.chipTimeMs == null) return -1;
    return a.chipTimeMs - b.chipTimeMs;
  });

  const rankMap = new Map<string, number>();
  sorted.forEach((result, index) => {
    rankMap.set(result.id, index + 1);
  });

  return withTimes.map((result) => ({
    ...result,
    overallRank: rankMap.get(result.id) ?? 0,
  }));
}

export function isCategoryMedalist(result: AthleteResult): boolean {
  return result.position <= 3;
}

export function getMedalType(position: number): "gold" | "silver" | "bronze" | null {
  if (position === 1) return "gold";
  if (position === 2) return "silver";
  if (position === 3) return "bronze";
  return null;
}

export function findAthleteById(
  results: AthleteResult[],
  id: string,
): AthleteResult | undefined {
  return results.find((r) => r.id === id);
}

export function findAthleteByBib(
  results: AthleteResult[],
  bib: string,
): AthleteResult | undefined {
  const normalized = bib.trim().toLowerCase();
  return results.find(
    (r) => r.participant.bib_number.toLowerCase() === normalized,
  );
}

export function computePercentile(result: AthleteResult, all: AthleteResult[]): number {
  if (!all.length || result.chipTimeMs == null) return 0;
  const faster = all.filter(
    (r) => r.chipTimeMs != null && r.chipTimeMs < result.chipTimeMs!,
  ).length;
  return Math.round((1 - faster / all.length) * 100);
}

export function gapToWinner(result: AthleteResult, all: AthleteResult[]): number | null {
  const winner = all.find((r) => r.overallRank === 1);
  if (!winner?.chipTimeMs || !result.chipTimeMs) return null;
  return result.chipTimeMs - winner.chipTimeMs;
}
