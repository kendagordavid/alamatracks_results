import Link from "next/link";
import { BadgeCheck, Shield } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function SiteFooter() {
  return (
    <footer className="no-print mt-auto border-t border-border/60 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <p className="text-lg font-semibold tracking-tight">
              Powered by <span className="text-primary">AlamaTracks</span>
            </p>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Enterprise-grade event timing trusted by organizers, athletes, and
              spectators worldwide.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-sm">
              <BadgeCheck className="size-4 text-primary" aria-hidden />
              <span>Results verification badge</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="size-4" aria-hidden />
              <span>Official published results</span>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium">Event Sponsors</p>
            <div className="mt-3 grid grid-cols-3 gap-3">
              {["Partner A", "Partner B", "Partner C"].map((sponsor) => (
                <div
                  key={sponsor}
                  className="flex h-12 items-center justify-center rounded-xl border border-dashed border-border bg-background/50 text-xs text-muted-foreground"
                >
                  {sponsor}
                </div>
              ))}
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} AlamaTracks. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/results" className="hover:text-foreground">
              Results
            </Link>
            <Link href="/stats" className="hover:text-foreground">
              Statistics
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
