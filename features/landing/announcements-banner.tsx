"use client";

import { useState } from "react";
import { Megaphone, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AnnouncementsBanner() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div
      role="status"
      className="border-b border-primary/20 bg-primary/5 px-4 py-3"
    >
      <div className="mx-auto flex max-w-7xl items-center gap-3 sm:px-6 lg:px-8">
        <Megaphone className="size-4 shrink-0 text-primary" aria-hidden />
        <p className="flex-1 text-sm">
          <span className="font-medium">Live results</span> — Rankings update
          automatically as new finishers are published.
        </p>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setVisible(false)}
          aria-label="Dismiss announcement"
        >
          <X className="size-4" />
        </Button>
      </div>
    </div>
  );
}
