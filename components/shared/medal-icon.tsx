"use client";

import { Medal } from "lucide-react";
import { cn } from "@/lib/utils";
import { getMedalType } from "@/utils/rankings";

type MedalIconProps = {
  position: number;
  className?: string;
};

const medalStyles = {
  gold: "text-amber-500",
  silver: "text-slate-400",
  bronze: "text-orange-700",
};

export function MedalIcon({ position, className }: MedalIconProps) {
  const type = getMedalType(position);
  if (!type) return null;

  return (
    <Medal
      className={cn("size-4 shrink-0", medalStyles[type], className)}
      aria-label={`${type} medal, position ${position}`}
    />
  );
}
