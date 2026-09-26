import Link from "next/link";

import { ArrowRightIcon, PlusIcon } from "@/components/icons";
import { EmptyState, GapRow, SkillSummary } from "@/components/product";
import { PageHeader, Screen, SectionHeader } from "@/components/screen";
import { requireProfile } from "@/lib/auth";
import { deriveCompetencies, summarizeReadiness } from "@/lib/skill-gap";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const profile = await requireProfile("student");
  const supabase = await createClient();
  const [competenciesResult, assessmentsResult] = await Promise.all([
    supabase.from("competencies").select("id,name,description,industry_target").order("name"),
    supabase.from("assessments").select("competency_id,score,note").eq("student_id", profile.id),
  ]);
  const queryFailed = competenciesResult.error || assessmentsResult.error;
  const competencies = deriveCompetencies(
    (competenciesResult.data ?? []).map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      target: item.industry_target,
    })),
    (assessmentsResult.data ?? []).map((item) => ({
      competencyId: item.competency_id,
      score: item.score,
      note: item.note,
    })),
  );
  const readiness = summarizeReadiness(competencies);

  return (
    <Screen>
      <PageHeader
        action={<Link className="inline-flex h-10 items-center gap-2 rounded-[var(--radius-medium)] bg-[var(--primary)] px-4 text-sm font-semibold text-white shadow-[var(--raised-shadow)] hover:bg-blue-800" href="/portfolio"><PlusIcon className="size-4" />Tambah bukti proyek</Link>}
        description={`Selamat datang, ${profile.name}. Berikut ringkasan kesiapan kompetensimu saat ini.`}
        eyebrow="Dashboard siswa"
        title="Kesiapan kompetensi"
      />

      {queryFailed ? (
        <div className="mt-8"><EmptyState description="Ringkasan kesiapan belum dapat dimuat. Muat ulang halaman untuk mencoba lagi." title="Gagal memuat dashboard" /></div>
      ) : (
        <>
      <div className="mt-8"><SkillSummary competentCount={readiness.counts.competent} emptyMessage="Belum ada kompetensi untuk dihitung." percentage={readiness.counts.total ? readiness.skillMatch : undefined} totalCount={readiness.counts.total} unassessedCount={readiness.counts.unassessed} /></div>

      <dl className="mt-6 grid divide-y divide-[var(--border)] border-y border-[var(--border)] bg-white sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:rounded-[var(--radius-medium)] sm:border">
        {[
          ["Memenuhi target", String(readiness.counts.competent)],
          ["Skill gap", String(readiness.counts.gap)],
          ["Belum dinilai", String(readiness.counts.unassessed)],
        ].map(([label, value]) => (
          <div className="px-4 py-4 sm:px-5" key={label}><dt className="text-xs font-medium text-[var(--muted)]">{label}</dt><dd className="mt-1 text-2xl font-bold tracking-[-0.03em] tabular-nums">{value}</dd></div>
        ))}
      </dl>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section aria-labelledby="priority-title">
          <SectionHeader description="Urutan berdasarkan selisih terbesar dari target industri." id="priority-title" title="Prioritas skill gap" />
          <div className="mt-3 border-t border-[var(--border)]">
            {readiness.priorityGaps.length ? readiness.priorityGaps.slice(0, 3).map((item) => (
              <GapRow href="/competencies" key={item.id} name={item.name} score={item.score ?? 0} target={item.target} />
            )) : (
              <EmptyState
                description={readiness.counts.total === 0 ? "Kompetensi akan muncul setelah guru menambahkannya." : readiness.counts.unassessed > 0 ? "Skill gap akan muncul setelah guru memberikan penilaian." : "Tidak ada kompetensi di bawah target industri."}
                title={readiness.counts.total === 0 ? "Belum ada kompetensi" : readiness.counts.unassessed > 0 ? "Belum ada skill gap" : "Semua target tercapai"}
              />
            )}
          </div>
        </section>
        <section aria-labelledby="portfolio-title">
          <SectionHeader description="Bukti praktik terbaru yang kamu simpan." id="portfolio-title" title="Portofolio terbaru" />
          <div className="mt-3 border-t border-[var(--border)]">
            <EmptyState action={<Link className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--primary)] hover:underline" href="/portfolio">Tambah bukti pertama <ArrowRightIcon className="size-4" /></Link>} description="Proyek tersimpan akan muncul di sini." title="Belum ada bukti proyek" />
          </div>
        </section>
      </div>
        </>
      )}
    </Screen>
  );
}
