export function PageLoading({ label }: { label: string }) {
  return (
    <main aria-busy="true" aria-label={label} className="mx-auto w-full max-w-[1200px] px-4 py-6 sm:px-6 md:px-8 md:py-10" role="status">
      <div className="animate-pulse">
        <div className="h-3 w-28 rounded bg-slate-200" />
        <div className="mt-3 h-8 w-64 max-w-full rounded bg-slate-200" />
        <div className="mt-3 h-4 w-96 max-w-full rounded bg-slate-200" />
        <div className="mt-8 h-40 rounded-[var(--radius-large)] border border-[var(--border)] bg-white" />
        <div className="mt-6 h-48 border-y border-[var(--border)] bg-white" />
      </div>
      <span className="sr-only">Memuat…</span>
    </main>
  );
}
