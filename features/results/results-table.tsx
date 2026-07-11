"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type VisibilityState,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  ChevronLeft,
  ChevronRight,
  Columns3,
  Download,
  Printer,
  RefreshCw,
  Share2,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { MedalIcon } from "@/components/shared/medal-icon";
import { AthleteSheet } from "@/features/athlete/athlete-profile";
import { useDebouncedValue } from "@/hooks/use-debounced-search";
import { useResultsFilters } from "@/hooks/use-results-filters";
import { useResultsQuery } from "@/hooks/use-results-query";
import type { AthleteResult } from "@/types/results";
import { downloadCsv, exportResultsToCsv } from "@/utils/export";
import {
  filterResults,
  getUniqueCategories,
  paginateResults,
  type ResultsFilterState,
} from "@/utils/url-state";

const COLUMN_LABELS: Record<string, string> = {
  overallRank: "Rank",
  bib: "Bib",
  fullName: "Athlete",
  category_name: "Category",
  chipTimeFormatted: "Chip Time",
  speedKmh: "Speed (km/h)",
  gunTimeFormatted: "Gun Time",
};

export function ResultsExperience() {
  const { data, isLoading, isError, error, refetch, isFetching, dataUpdatedAt } =
    useResultsQuery();
  const [filters, setFilters] = useResultsFilters();
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    speedKmh: true,
    gunTimeFormatted: false,
    category_name: true,
  });
  const [selectedAthlete, setSelectedAthlete] = useState<AthleteResult | null>(
    null,
  );
  const [sheetOpen, setSheetOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(filters.q);
  const debouncedSearch = useDebouncedValue(searchInput, 200);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (debouncedSearch !== filters.q) {
      void setFilters({ q: debouncedSearch, page: 1 });
    }
  }, [debouncedSearch, filters.q, setFilters]);

  useEffect(() => {
    setSearchInput(filters.q);
  }, [filters.q]);

  const filterState: ResultsFilterState = useMemo(
    () => ({
      q: filters.q,
      categories: filters.category,
      gender: filters.gender,
      status: filters.status,
      page: filters.page,
      pageSize: filters.pageSize,
      sortBy: filters.sortBy as ResultsFilterState["sortBy"],
      sortDir: filters.sortDir,
    }),
    [filters],
  );

  const allResults = data?.results ?? [];
  const filtered = useMemo(
    () => filterResults(allResults, filterState),
    [allResults, filterState],
  );
  const paginated = useMemo(
    () => paginateResults(filtered, filters.page, filters.pageSize),
    [filtered, filters.page, filters.pageSize],
  );
  const categories = useMemo(
    () => getUniqueCategories(allResults),
    [allResults],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / filters.pageSize));

  const columns = useMemo<ColumnDef<AthleteResult>[]>(
    () => [
      {
        id: "overallRank",
        accessorKey: "overallRank",
        header: "Rank",
        cell: ({ row }) => (
          <span className="font-semibold tabular-nums">
            {row.original.overallRank}
          </span>
        ),
        size: 64,
      },
      {
        id: "medal",
        header: "",
        cell: ({ row }) => (
          <MedalIcon position={row.original.position} />
        ),
        size: 32,
      },
      {
        id: "bib",
        accessorFn: (row) => row.participant.bib_number,
        header: "Bib",
        cell: ({ row }) => (
          <span className="font-mono text-sm">
            {row.original.participant.bib_number}
          </span>
        ),
        size: 72,
      },
      {
        id: "fullName",
        accessorKey: "fullName",
        header: "Athlete",
        cell: ({ row }) => (
          <div>
            <span className="font-medium">{row.original.fullName}</span>
            <span className="mt-0.5 block text-xs text-muted-foreground md:hidden">
              {row.original.category_name}
            </span>
          </div>
        ),
        size: 200,
      },
      {
        id: "category_name",
        accessorKey: "category_name",
        header: "Category",
        cell: ({ row }) => (
          <Badge variant="secondary" className="font-normal">
            {row.original.category_name}
          </Badge>
        ),
        size: 140,
      },
      {
        id: "chipTimeFormatted",
        accessorKey: "chipTimeFormatted",
        header: "Chip Time",
        cell: ({ row }) => (
          <span className="font-mono tabular-nums">
            {row.original.chipTimeFormatted ?? "—"}
          </span>
        ),
        size: 100,
      },
      {
        id: "speedKmh",
        accessorKey: "speedKmh",
        header: "Speed (km/h)",
        cell: ({ row }) => (
          <span className="hidden font-mono text-sm tabular-nums sm:inline">
            {row.original.speedKmh ?? "—"}
          </span>
        ),
        size: 88,
      },
      {
        id: "gunTimeFormatted",
        accessorKey: "gunTimeFormatted",
        header: "Gun Time",
        cell: ({ row }) => (
          <span className="font-mono tabular-nums">
            {row.original.gunTimeFormatted ?? "—"}
          </span>
        ),
        size: 100,
      },
    ],
    [],
  );

  const table = useReactTable({
    data: paginated,
    columns,
    state: { columnVisibility },
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
  });

  const rowVirtualizer = useVirtualizer({
    count: paginated.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 52,
    overscan: 10,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();
  const paddingTop = virtualRows.length > 0 ? virtualRows[0].start : 0;
  const paddingBottom =
    virtualRows.length > 0
      ? rowVirtualizer.getTotalSize() - virtualRows[virtualRows.length - 1].end
      : 0;
  const visibleColumnCount = table.getVisibleLeafColumns().length;

  const openAthlete = useCallback((athlete: AthleteResult) => {
    setSelectedAthlete(athlete);
    setSheetOpen(true);
  }, []);

  function handleExport() {
    const csv = exportResultsToCsv(filtered);
    downloadCsv(
      `${data?.event.name ?? "results"}-results.csv`,
      csv,
    );
    toast.success("CSV downloaded");
  }

  function handlePrint() {
    window.print();
  }

  async function handleShareUrl() {
    await navigator.clipboard.writeText(window.location.href);
    toast.success("Filter link copied");
  }

  function toggleSort(column: ResultsFilterState["sortBy"]) {
    if (filters.sortBy === column) {
      void setFilters({
        sortDir: filters.sortDir === "asc" ? "desc" : "asc",
      });
    } else {
      void setFilters({
        sortBy: column as typeof filters.sortBy,
        sortDir: "asc",
      });
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-96 w-full rounded-xl" />
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

  return (
    <div className="space-y-4">
      <div className="no-print flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{data.event.name}</h1>
          <p className="text-sm text-muted-foreground">
            {filtered.length} of {allResults.length} results
            {isFetching ? " · Updating…" : null}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isFetching ? (
            <RefreshCw className="size-4 animate-spin text-muted-foreground" aria-hidden />
          ) : null}
          <Button variant="outline" size="sm" onClick={handleShareUrl}>
            <Share2 className="size-4" />
            Share
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="size-4" />
            CSV
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="size-4" />
            Print
          </Button>
        </div>
      </div>

      <div className="no-print flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-4 shadow-sm lg:flex-row">
        <Input
          placeholder="Search name or bib…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          aria-label="Search results"
          className="lg:max-w-xs"
        />

        <Select
          value={filters.category[0] ?? "all"}
          onValueChange={(value) =>
            void setFilters({
              category: value === "all" ? [] : [value],
              page: 1,
            })
          }
        >
          <SelectTrigger className="lg:w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.gender}
          onValueChange={(value) =>
            void setFilters({
              gender: value as typeof filters.gender,
              page: 1,
            })
          }
        >
          <SelectTrigger className="lg:w-36">
            <SelectValue placeholder="Gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All genders</SelectItem>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Columns3 className="size-4" />
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {table
              .getAllColumns()
              .filter((col) => col.getCanHide())
              .map((col) => (
                <DropdownMenuCheckboxItem
                  key={col.id}
                  checked={col.getIsVisible()}
                  onCheckedChange={(v) => col.toggleVisibility(!!v)}
                >
                  {COLUMN_LABELS[col.id] ?? col.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        Showing {filtered.length} results
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No results match your filters"
          description="Try adjusting your search or filter criteria."
          actionLabel="Clear search"
          onAction={() => {
            setSearchInput("");
            void setFilters({ q: "", category: [], gender: "all", page: 1 });
          }}
        />
      ) : (
        <>
          <div
            ref={tableContainerRef}
            className="relative max-h-[min(70vh,720px)] overflow-auto rounded-2xl border border-border/60 bg-card shadow-sm"
          >
            <table className="print-table w-full min-w-[640px] border-collapse text-sm">
              <caption className="sr-only">
                Race results for {data.event.name}
              </caption>
              <thead className="sticky top-0 z-20 bg-card/95 backdrop-blur">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id} className="border-b border-border/60">
                    {headerGroup.headers.map((header, index) => (
                      <th
                        key={header.id}
                        scope="col"
                        className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground ${
                          index === 0
                            ? "sticky left-0 z-30 bg-card/95 backdrop-blur"
                            : ""
                        }`}
                        style={{ width: header.getSize() }}
                      >
                        {header.isPlaceholder ? null : (
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 hover:text-foreground"
                            onClick={() => {
                              const sortKey = header.column.id as ResultsFilterState["sortBy"];
                              if (
                                [
                                  "overallRank",
                                  "fullName",
                                  "bib",
                                  "category_name",
                                  "chipTimeMs",
                                  "position",
                                ].includes(sortKey)
                              ) {
                                toggleSort(sortKey);
                              }
                            }}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                          </button>
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {paddingTop > 0 ? (
                  <tr aria-hidden>
                    <td
                      colSpan={visibleColumnCount}
                      style={{ height: paddingTop, padding: 0, border: 0 }}
                    />
                  </tr>
                ) : null}
                {virtualRows.map((virtualRow) => {
                  const row = table.getRowModel().rows[virtualRow.index];
                  if (!row) return null;
                  return (
                    <tr
                      key={row.id}
                      data-index={virtualRow.index}
                      ref={rowVirtualizer.measureElement}
                      className="cursor-pointer border-b border-border/40 transition-colors hover:bg-muted/50 focus-within:bg-muted/50"
                      onClick={() => openAthlete(row.original)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") openAthlete(row.original);
                      }}
                      tabIndex={0}
                      aria-label={`View profile for ${row.original.fullName}`}
                    >
                      {row.getVisibleCells().map((cell, index) => (
                        <td
                          key={cell.id}
                          className={`px-4 py-3 ${
                            index === 0
                              ? "sticky left-0 z-10 bg-card"
                              : ""
                          }`}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </td>
                      ))}
                    </tr>
                  );
                })}
                {paddingBottom > 0 ? (
                  <tr aria-hidden>
                    <td
                      colSpan={visibleColumnCount}
                      style={{ height: paddingBottom, padding: 0, border: 0 }}
                    />
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          <div className="no-print flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Rows per page</span>
              <Select
                value={String(filters.pageSize)}
                onValueChange={(v) =>
                  void setFilters({ pageSize: Number(v), page: 1 })
                }
              >
                <SelectTrigger className="h-8 w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[25, 50, 100].map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon-sm"
                disabled={filters.page <= 1}
                onClick={() => void setFilters({ page: filters.page - 1 })}
                aria-label="Previous page"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <span className="text-sm tabular-nums">
                Page {filters.page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon-sm"
                disabled={filters.page >= totalPages}
                onClick={() => void setFilters({ page: filters.page + 1 })}
                aria-label="Next page"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </>
      )}

      <AthleteSheet
        athlete={selectedAthlete}
        allResults={allResults}
        eventName={data.event.name}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />

      {dataUpdatedAt ? (
        <p className="text-xs text-muted-foreground">
          Last refreshed {new Date(dataUpdatedAt).toLocaleString()}
        </p>
      ) : null}
    </div>
  );
}
