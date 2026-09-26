import Link from "next/link";

import { ArrowRightIcon, PlusIcon } from "@/components/icons";
import { EmptyState, SkillSummary } from "@/components/product";
import { PageHeader, Screen, SectionHeader } from "@/components/screen";
import { requireProfile } from "@/lib/auth";
import { demoCompetencies } from "@/lib/demo-data";

export default async function DashboardPage() {
  const profile = await requireProfile("student");
  return (
    <Screen>
      <PageHeader
        action={<Link className="inline-flex h-10 items-center gap-2 rounded-[var(--radius-medium)] bg-[var(--primary)] px-4 text-sm font-semibold text-white shadow-[var(--raised-shadow)] hover:bg-blue-800" href="/portfolio"><PlusIcon className="size-4" />Tambah bukti proyek</Link>}
        description={`Selamat datang, ${profile.name}. Berikut ringkasan kesiapan kompetensimu saat ini.`}
        eyebrow="Dashboard siswa"
        title="Kesiapan kompetensi"
      />

      <div className="mt-8"><SkillSummary competentCount={0} percentage={0} totalCount={demoCompetencies.length} unassessedCount={demoCompetencies.length} /></div>

      <dl className="mt-6 grid divide-y divide-[var(--border)] border-y border-[var(--border)] bg-white sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:rounded-[var(--radius-medium)] sm:border">
        {[
          ["Memenuhi target", "0"],
          ["Skill gap", "0"],
          ["Belum dinilai", String(demoCompetencies.length)],
        ].map(([label, value]) => (
          <div className="px-4 py-4 sm:px-5" key={label}><dt className="text-xs font-medium text-[var(--muted)]">{label}</dt><dd className="mt-1 text-2xl font-bold tracking-[-0.03em] tabular-nums">{value}</dd></div>
        ))}
      </dl>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section aria-labelledby="priority-title">
          <SectionHeader description="Urutan berdasarkan selisih terbesar dari target industri." id="priority-title" title="Prioritas skill gap" />
          <div className="mt-3 border-t border-[var(--border)]">
            <EmptyState description="Skill gap akan muncul setelah guru memberikan penilaian." title="Belum ada penilaian" />
          </div>
        </section>
        <section aria-labelledby="portfolio-title">
          <SectionHeader description="Bukti praktik terbaru yang kamu simpan." id="portfolio-title" title="Portofolio terbaru" />
          <div className="mt-3 border-t border-[var(--border)]">
            <EmptyState action={<Link className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--primary)] hover:underline" href="/portfolio">Tambah bukti pertama <ArrowRightIcon className="size-4" /></Link>} description="Proyek tersimpan akan muncul di sini." title="Belum ada bukti proyek" />
          </div>
        </section>
      </div>
    </Screen>
  );
}
