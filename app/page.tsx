import Link from "next/link";

import { ArrowRightIcon } from "@/components/icons";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-6 sm:px-8">
      <header className="flex items-center justify-between border-b border-[var(--border)] pb-5">
        <div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-[var(--radius-medium)] bg-[var(--foreground)] text-sm font-bold text-white">C</span><span className="font-bold">Competra</span></div>
        <Link className="inline-flex h-10 items-center px-2 text-sm font-semibold text-[var(--primary)]" href="/login">Masuk</Link>
      </header>
      <section aria-labelledby="page-title" className="my-auto max-w-3xl py-16">
        <p className="text-sm font-semibold text-[var(--primary)]">Peta kompetensi SMK</p>
        <h1 id="page-title" className="mt-3 text-4xl font-bold leading-tight tracking-[-0.04em] text-[var(--foreground)] sm:text-5xl">
          Kesiapan praktik yang jelas, terukur, dan berbasis bukti.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--muted)]">
          Catat penilaian praktik, lihat prioritas skill gap, dan hubungkan proyek siswa dengan
          kompetensi yang relevan.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link className="inline-flex h-11 items-center gap-2 rounded-[var(--radius-medium)] bg-[var(--primary)] px-5 text-sm font-semibold text-white" href="/login">Masuk ke Competra <ArrowRightIcon className="size-4" /></Link>
          <Link className="inline-flex h-11 items-center rounded-[var(--radius-medium)] border border-[var(--border)] bg-white px-5 text-sm font-semibold" href="/register">Daftar sebagai siswa</Link>
        </div>
      </section>
    </main>
  );
}
