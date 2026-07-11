/** Parse chip duration to milliseconds — API returns seconds as a float, legacy values may be HH:MM:SS strings */
export function parseDurationToMs(
  duration: string | number | null | undefined,
): number | null {
  if (duration == null) return null;

  if (typeof duration === "number") {
    if (Number.isNaN(duration) || duration < 0) return null;
    return Math.round(duration * 1000);
  }

  if (!duration) return null;

  const parts = duration.split(":");
  if (parts.length < 2) return null;

  const secondsPart = parts.pop()!;
  const minutes = Number(parts.pop() ?? 0);
  const hours = parts.length ? Number(parts.pop()) : 0;
  const seconds = Number(secondsPart);

  if ([hours, minutes, seconds].some((n) => Number.isNaN(n))) return null;

  return Math.round((hours * 3600 + minutes * 60 + seconds) * 1000);
}

export function formatDurationMs(ms: number | null | undefined): string | null {
  if (ms == null || ms < 0) return null;

  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const millis = Math.floor((ms % 1000) / 10);

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return `${minutes}:${String(seconds).padStart(2, "0")}.${String(millis).padStart(2, "0")}`;
}

export function computeGunTimeMs(
  startTime: string | null,
  finishTime: string | null,
): number | null {
  if (!startTime || !finishTime) return null;
  const start = new Date(startTime).getTime();
  const finish = new Date(finishTime).getTime();
  if (Number.isNaN(start) || Number.isNaN(finish)) return null;
  return finish - start;
}

export function computeSpeedKmh(
  durationMs: number | null,
  distanceKm: number,
): string | null {
  if (!durationMs || distanceKm <= 0) return null;
  const speedKmh = (distanceKm * 3_600_000) / durationMs;
  return speedKmh.toFixed(1);
}

export function inferGenderFromCategory(categoryName: string): "male" | "female" | "other" {
  const name = categoryName.toLowerCase();
  if (/\b(men|male|boys|u\d+\s*men)\b/.test(name) && !/\bwomen\b/.test(name)) {
    return "male";
  }
  if (/\b(women|female|girls|u\d+\s*women)\b/.test(name)) {
    return "female";
  }
  return "other";
}

export type FinishBadge = {
  label: string;
  variant: "gold" | "silver" | "default";
};

export function getFinishBadges(chipTimeMs: number | null): FinishBadge[] {
  if (chipTimeMs == null) return [];
  const badges: FinishBadge[] = [];
  const hourMs = 60 * 60 * 1000;

  if (chipTimeMs < hourMs) {
    badges.push({ label: "Sub 1:00", variant: "gold" });
  } else if (chipTimeMs < 1.25 * hourMs) {
    badges.push({ label: "Sub 1:15", variant: "silver" });
  }

  return badges;
}

export function averageDurationMs(values: number[]): number | null {
  if (!values.length) return null;
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}
