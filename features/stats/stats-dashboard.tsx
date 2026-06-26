"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { MedalIcon } from "@/components/shared/medal-icon";
import { StatCard } from "@/components/shared/stat-card";
import { useResultsQuery } from "@/hooks/use-results-query";
import { computeEventStats } from "@/utils/stats";

const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

function ChartSkeleton() {
  return <Skeleton className="h-72 w-full rounded-2xl" />;
}

export function StatsDashboard() {
  const { data, isLoading, isError, error, refetch } = useResultsQuery();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <ChartSkeleton />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <ErrorState
        message={error instanceof Error ? error.message : undefined}
        onRetry={() => refetch()}
      />
    );
  }

  const stats = computeEventStats(data.event, data.results);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Statistics</h1>
        <p className="text-sm text-muted-foreground">{data.event.name}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Participants" value={stats.participants} />
        <StatCard label="Finishers" value={stats.finishers} />
        <StatCard
          label="DNS"
          value={stats.dns}
          hint="Public feed includes published finishers only"
        />
        <StatCard
          label="DNF"
          value={stats.dnf}
          hint="Public feed includes published finishers only"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Average Time" value={stats.averageFinishFormatted ?? "—"} />
        <StatCard label="Fastest" value={stats.fastestFormatted ?? "—"} />
        <StatCard label="Slowest" value={stats.slowestFormatted ?? "—"} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold">Gender Distribution</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={stats.genderDistribution}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent }) =>
                  `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                }
              >
                {stats.genderDistribution.map((_, index) => (
                  <Cell
                    key={index}
                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold">Category Distribution</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={stats.categoryDistribution.slice(0, 8)}
              layout="vertical"
              margin={{ left: 8, right: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" />
              <YAxis
                type="category"
                dataKey="name"
                width={100}
                tick={{ fontSize: 11 }}
              />
              <Tooltip />
              <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold">Finish Time Distribution</h2>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={stats.timeDistribution}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="bucket" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={60} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold">Top 10 Overall</h2>
        <ol className="space-y-2">
          {stats.topTen.map((athlete) => (
            <li
              key={athlete.id}
              className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-muted/50"
            >
              <span className="w-8 font-semibold tabular-nums text-muted-foreground">
                {athlete.overallRank}
              </span>
              <MedalIcon position={athlete.position} />
              <span className="flex-1 font-medium">{athlete.fullName}</span>
              <span className="text-xs text-muted-foreground">
                {athlete.category_name}
              </span>
              <span className="font-mono text-sm tabular-nums">
                {athlete.chipTimeFormatted}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
