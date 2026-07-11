"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Award, Clock, Download, Share2, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MedalIcon } from "@/components/shared/medal-icon";
import type { AthleteResult } from "@/types/results";
import {
  computePercentile,
  gapToWinner,
  getMedalType,
} from "@/utils/rankings";
import { formatDurationMs, getFinishBadges } from "@/utils/time";
import { getPublicSiteUrl } from "@/lib/env";

const QRCode = dynamic(
  () => import("qrcode.react").then((mod) => mod.QRCodeSVG),
  { ssr: false },
);

type AthleteProfileContentProps = {
  athlete: AthleteResult;
  allResults: AthleteResult[];
  eventName: string;
  showQr?: boolean;
};

export function AthleteProfileContent({
  athlete,
  allResults,
  eventName,
  showQr = true,
}: AthleteProfileContentProps) {
  const athleteUrl = `${getPublicSiteUrl()}/athlete/${athlete.id}`;
  const percentile = computePercentile(athlete, allResults);
  const gap = gapToWinner(athlete, allResults);
  const badges = getFinishBadges(athlete.chipTimeMs);
  const medal = getMedalType(athlete.position);

  async function handleShare() {
    const text = `${athlete.fullName} finished ${athlete.chipTimeFormatted ?? "—"} at ${eventName}. Overall #${athlete.overallRank}.`;

    if (navigator.share) {
      try {
        await navigator.share({ title: athlete.fullName, text, url: athleteUrl });
        return;
      } catch {
        // fall through to clipboard
      }
    }

    await navigator.clipboard.writeText(`${text}\n${athleteUrl}`);
    toast.success("Link copied to clipboard");
  }

  const stats = [
    { label: "Chip Time", value: athlete.chipTimeFormatted ?? "—" },
    { label: "Gun Time", value: athlete.gunTimeFormatted ?? "—" },
    { label: "Speed", value: athlete.speedKmh ? `${athlete.speedKmh} km/h` : "—" },
    { label: "Distance", value: `${athlete.distance} km` },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            {medal ? <MedalIcon position={athlete.position} className="size-5" /> : null}
            <Badge variant="secondary">Bib {athlete.participant.bib_number}</Badge>
          </div>
          <h2 className="mt-2 text-2xl font-bold tracking-tight">
            {athlete.fullName}
          </h2>
          <p className="text-sm text-muted-foreground">{athlete.category_name}</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold tabular-nums">#{athlete.overallRank}</p>
          <p className="text-xs text-muted-foreground">Overall</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-border/60 bg-muted/30 p-3"
          >
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className="mt-1 font-semibold tabular-nums">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border/60 p-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <Award className="size-4" aria-hidden />
          Rankings
        </h3>
        <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-muted-foreground">Overall</dt>
            <dd className="font-semibold">#{athlete.overallRank}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Category</dt>
            <dd className="font-semibold">#{athlete.position}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Gender</dt>
            <dd className="capitalize">{athlete.inferredGender}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Team</dt>
            <dd>—</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Country</dt>
            <dd>—</dd>
          </div>
        </dl>
      </div>

      <div className="rounded-xl border border-border/60 p-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <TrendingUp className="size-4" aria-hidden />
          Performance Summary
        </h3>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          <li>Top {percentile}% of all finishers</li>
          {gap != null && gap > 0 ? (
            <li>+{formatDurationMs(gap)} behind overall winner</li>
          ) : athlete.overallRank === 1 ? (
            <li>Overall winner</li>
          ) : null}
          {badges.map((b) => (
            <li key={b.label}>
              <Badge variant="outline">{b.label}</Badge>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl border border-dashed border-border/60 p-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <Clock className="size-4" aria-hidden />
          Split Times
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          No split data published for this athlete yet.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={handleShare} variant="outline" size="sm">
          <Share2 className="size-4" />
          Share
        </Button>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="sm" disabled>
              <Download className="size-4" />
              Certificate
            </Button>
          </TooltipTrigger>
          <TooltipContent>Coming soon</TooltipContent>
        </Tooltip>
        <Button asChild variant="ghost" size="sm">
          <Link href={`/athlete/${athlete.id}`}>Full profile</Link>
        </Button>
      </div>

      {showQr ? (
        <div className="flex flex-col items-center rounded-xl border border-border/60 p-4">
          <QRCode value={athleteUrl} size={120} level="M" />
          <p className="mt-2 text-xs text-muted-foreground">Scan for athlete result</p>
        </div>
      ) : null}
    </div>
  );
}

type AthleteSheetProps = {
  athlete: AthleteResult | null;
  allResults: AthleteResult[];
  eventName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AthleteSheet({
  athlete,
  allResults,
  eventName,
  open,
  onOpenChange,
}: AthleteSheetProps) {
  if (!athlete) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Athlete Profile</SheetTitle>
          <SheetDescription>{eventName}</SheetDescription>
        </SheetHeader>
        <div className="mt-6 px-4 pb-8">
          <AthleteProfileContent
            athlete={athlete}
            allResults={allResults}
            eventName={eventName}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
