import type { AthleteResult } from "@/types/results";

function escapeCsv(value: string | number | null | undefined): string {
  const str = String(value ?? "");
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportResultsToCsv(results: AthleteResult[]): string {
  const headers = [
    "Overall Rank",
    "Category Rank",
    "Bib",
    "First Name",
    "Last Name",
    "Category",
    "Gender",
    "Distance (km)",
    "Chip Time",
    "Gun Time",
    "Speed (km/h)",
  ];

  const rows = results.map((r) =>
    [
      r.overallRank,
      r.position,
      r.participant.bib_number,
      r.participant.first_name,
      r.participant.last_name,
      r.category_name,
      r.inferredGender,
      r.distance,
      r.chipTimeFormatted,
      r.gunTimeFormatted,
      r.speedKmh,
    ]
      .map(escapeCsv)
      .join(","),
  );

  return [headers.join(","), ...rows].join("\n");
}

export function downloadCsv(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
