export function PhotoGalleryPlaceholder() {
  const placeholders = Array.from({ length: 6 }, (_, i) => i + 1);

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-semibold tracking-tight">Event Gallery</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Photos from the event will appear here.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {placeholders.map((n) => (
          <div
            key={n}
            className="aspect-[4/3] rounded-2xl border border-dashed border-border bg-muted/30"
            aria-hidden
          />
        ))}
      </div>
    </section>
  );
}
