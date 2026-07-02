import Link from "next/link";
import { AlertTriangle, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

type ApiErrorPanelProps = {
  title?: string;
  message: string;
  showConfigHelp?: boolean;
};

export function ApiErrorPanel({
  title = "Results unavailable",
  message,
  showConfigHelp = false,
}: ApiErrorPanelProps) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <div
        role="alert"
        className="rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center"
      >
        <AlertTriangle className="mx-auto mb-4 size-10 text-destructive" />
        <h1 className="text-xl font-semibold">{title}</h1>
        <p className="mt-3 text-sm text-muted-foreground">{message}</p>

        {showConfigHelp ? (
          <div className="mt-6 rounded-xl border border-border/60 bg-card p-4 text-left text-sm">
            <p className="flex items-center gap-2 font-medium">
              <Settings className="size-4" aria-hidden />
              Vercel environment variables
            </p>
            <ul className="mt-3 space-y-2 text-muted-foreground">
              <li>
                <code className="text-foreground">ALAMATRACKS_API_URL</code> — public API base, e.g.{" "}
                <code>https://alamatracks-api.serow.app/api/v1</code>
              </li>
              <li>
                <code className="text-foreground">ALAMATRACKS_EVENT_ID</code> — UUID of a public event on that API
              </li>
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">
              After updating env vars in Vercel → Settings → Environment Variables, redeploy the project.
            </p>
          </div>
        ) : null}

        <div className="mt-6 flex justify-center gap-3">
          <Button asChild variant="outline">
            <Link href="/results">Try results page</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
