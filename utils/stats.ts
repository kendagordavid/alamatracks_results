import type { AthleteResult, PublicEvent } from "@/types/results";
import { averageDurationMs, formatDurationMs } from "@/utils/time";

export type EventStats = {
  participants: number;
  finishers: number;
  dns: number;
  dnf: number;
  categories: number;
  averageFinishMs: number | null;
  averageFinishFormatted: string | null;
  fastestMs: number | null;
  fastestFormatted: string | null;
  slowestMs: number | null;
  slowestFormatted: string | null;
  genderDistribution: { name: string; value: number }[];
  categoryDistribution: { name: string; value: number }[];
  timeDistribution: { bucket: string; count: number }[];
  topTen: AthleteResult[];
};

function buildTimeBuckets(times: number[]): { bucket: string; count: number }[] {
  if (!times.length) return [];

  const min = Math.min(...times);
  const max = Math.max(...times);
  const bucketCount = 8;
  const range = max - min || 1;
  const step = range / bucketCount;

  const buckets = Array.from({ length: bucketCount }, (_, i) => ({
    bucket: `${formatDurationMs(min + i * step)} – ${formatDurationMs(min + (i + 1) * step)}`,
    count: 0,
  }));

  times.forEach((time) => {
    const index = Math.min(
      bucketCount - 1,
      Math.floor((time - min) / step),
    );
    buckets[index].count += 1;
  });

  return buckets;
}

export function computeEventStats(
  event: PublicEvent,
  results: AthleteResult[],
): EventStats {
  const chipTimes = results
    .map((r) => r.chipTimeMs)
    .filter((t): t is number => t != null);

  const categoryMap = new Map<string, number>();
  results.forEach((r) => {
    categoryMap.set(r.category_name, (categoryMap.get(r.category_name) ?? 0) + 1);
  });

  const genderMap = new Map<string, number>();
  results.forEach((r) => {
    const label =
      r.inferredGender === "male"
        ? "Male"
        : r.inferredGender === "female"
          ? "Female"
          : "Other";
    genderMap.set(label, (genderMap.get(label) ?? 0) + 1);
  });

  const avg = averageDurationMs(chipTimes);

  return {
    participants: results.length,
    finishers: results.length,
    dns: 0,
    dnf: 0,
    categories: categoryMap.size,
    averageFinishMs: avg,
    averageFinishFormatted: formatDurationMs(avg),
    fastestMs: chipTimes.length ? Math.min(...chipTimes) : null,
    fastestFormatted: formatDurationMs(chipTimes.length ? Math.min(...chipTimes) : null),
    slowestMs: chipTimes.length ? Math.max(...chipTimes) : null,
    slowestFormatted: formatDurationMs(chipTimes.length ? Math.max(...chipTimes) : null),
    genderDistribution: Array.from(genderMap.entries()).map(([name, value]) => ({
      name,
      value,
    })),
    categoryDistribution: Array.from(categoryMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value),
    timeDistribution: buildTimeBuckets(chipTimes),
    topTen: [...results]
      .sort((a, b) => a.overallRank - b.overallRank)
      .slice(0, 10),
  };
}

export function getLandingStats(results: AthleteResult[]) {
  const stats = computeEventStats(
    { id: "", name: "", date: "", location: null, is_public: true },
    results,
  );

  return {
    totalFinishers: stats.finishers,
    categories: stats.categories,
    fastest: stats.fastestFormatted,
    average: stats.averageFinishFormatted,
  };
}
