import Link from "next/link";
import { EmptyState, PortfolioItem } from "@/components/product";
import { PageHeader, Screen, SectionHeader } from "@/components/screen";
import { InlineAlert } from "@/components/ui";
import { requireProfile } from "@/lib/auth";
import { formatDate, safeEvidenceUrl } from "@/lib/evidence";
import { deriveRoleReadiness } from "@/lib/readiness";
import { deriveCompetencies, summarizeReadiness } from "@/lib/skill-gap";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const profile = await requireProfile("student");
  const client = await createClient();
  const roleId = "40000000-0000-0000-0000-000000000001";
  const [competenciesResult, assessmentsResult, roleResult, requirementsResult, portfoliosResult] = await Promise.all([
    client.from("competencies").select("id,name,description,industry_target").order("name"),
    client.from("current_competency_assessments").select("competency_id,score,note,submission_id").eq("student_id", profile.id),
    client.from("industry_roles").select("id,name,description,benchmark_source,is_simulation").eq("id", roleId).maybeSingle(),
    client.from("role_requirements").select("competency_id,target,practice").eq("role_id", roleId),
    client.from("portfolios").select("id,title,description,project_url,evidence_url,created_at").eq("student_id", profile.id).order("created_at", { ascending: false }).limit(3),
  ]);
  const failed = competenciesResult.error || assessmentsResult.error || roleResult.error || requirementsResult.error;
  const competencies = deriveCompetencies(
    (competenciesResult.data ?? []).map((item) => ({ id: item.id, name: item.name, description: item.description, target: item.industry_target })),
    (assessmentsResult.data ?? []).map((item) => ({ competencyId: item.competency_id, score: item.score, note: item.note })),
  );
  const school = summarizeReadiness(competencies);
  const role = roleResult.data;
  const readiness = deriveRoleReadiness(
    (requirementsResult.data ?? []).map((item) => ({ competencyId: item.competency_id, name: competencies.find((competency) => competency.id === item.competency_id)?.name ?? "Kompetensi", target: item.target, practice: item.practice })),
    (assessmentsResult.data ?? []).map((item) => ({ competencyId: item.competency_id, score: item.score, submissionId: item.submission_id })),
  );
  return <Screen>
    <PageHeader title="Kesiapan kariermu" eyebrow="Competency intelligence" description={`${profile.name}, lihat kemampuan yang sudah terbukti dan langkah praktik berikutnya.`} action={<Link href="/tasks" className="inline-flex h-11 items-center rounded-[var(--radius-medium)] bg-[var(--primary)] px-4 text-sm font-semibold text-white hover:bg-blue-800">Kerjakan tugas praktik →</Link>} />
    {failed ? <div className="mt-8"><EmptyState title="Dashboard belum dapat dimuat" description="Pastikan migrasi Competency Intelligence sudah diterapkan, lalu muat ulang." /></div> : <>
      <section className="mt-8 rounded-[var(--radius-large)] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6" aria-labelledby="role-title">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-xl"><p className="text-xs font-medium text-[var(--muted)]">Role tujuan · {role?.is_simulation ? "Benchmark simulasi" : "Benchmark terdaftar"}</p><h2 id="role-title" className="mt-1 text-xl font-semibold">{role?.name ?? "Role belum dikonfigurasi"}</h2><p className="mt-2 text-sm text-[var(--muted)]">{role?.description ?? "Guru perlu menyiapkan kebutuhan kompetensi role."}</p></div>
          <div><p className="text-xs text-[var(--muted)]">Career readiness</p><p className="mt-1 text-[40px] font-bold leading-none tracking-tight tabular-nums">{readiness.percentage === null ? "—" : `${readiness.percentage}%`}</p></div>
        </div>
        {readiness.percentage !== null ? <><progress aria-label="Skor career readiness" className="mt-6 h-2 w-full accent-[var(--primary)]" value={readiness.percentage} max={100} /><p className="mt-2 text-xs leading-5 text-[var(--muted)]">Rata-rata pencapaian nilai terhadap target role, dibatasi 100% per kompetensi. Kompetensi tanpa nilai berbukti menyumbang 0 pada perhitungan, bukan dianggap tidak mampu.</p></> : <div className="mt-5"><InlineAlert variant="info">{readiness.total ? "Belum cukup data. Kirim bukti dan tunggu penilaian guru untuk menghitung kesiapan." : "Kebutuhan kompetensi role belum tersedia. Skor tidak dihitung."}</InlineAlert></div>}
        <dl className="mt-6 grid grid-cols-3 gap-3 border-t border-[var(--border)] pt-4">
          <div><dt className="text-xs text-[var(--muted)]">Cakupan bukti dinilai</dt><dd className="mt-1 font-semibold tabular-nums">{readiness.assessed}/{readiness.total} <span className="text-xs font-normal">({readiness.coverage}%)</span></dd></div>
          <div><dt className="text-xs text-[var(--muted)]">Memenuhi target role</dt><dd className="mt-1 font-semibold tabular-nums">{readiness.fulfilled}/{readiness.total}</dd></div>
          <div><dt className="text-xs text-[var(--muted)]">Belum ada nilai berbukti</dt><dd className="mt-1 font-semibold tabular-nums">{readiness.total - readiness.assessed}</dd></div>
        </dl>
        <p className="mt-4 text-xs leading-5 text-[var(--muted)]">{role?.benchmark_source} Skor ini bukan sertifikasi atau jaminan diterima kerja.</p>
      </section>
      <div className="mt-8 grid items-start gap-8 lg:grid-cols-2">
        <section aria-labelledby="priorities"><SectionHeader id="priorities" title="Langkah peningkatan berikutnya" description="Maksimal tiga prioritas dengan pencapaian terendah terhadap target role." /><div className="mt-3 divide-y divide-[var(--border)] border-y border-[var(--border)]">
          {readiness.priorities.length ? readiness.priorities.map((item, index) => <article key={item.competencyId} className="py-4"><p className="text-xs font-semibold text-[var(--muted)]">PRIORITAS {index + 1} · {item.score === null ? "PERLU BUKTI DINILAI" : `GAP ${item.gap} POIN`}</p><h3 className="mt-1 font-semibold">{item.name}</h3><p className="mt-1 text-xs text-[var(--muted)]">Nilai berbukti {item.score ?? "—"} · Target role {item.target}</p><p className="mt-3 text-sm leading-6">{item.practice}</p><Link href={item.submissionId ? `/submissions/${item.submissionId}` : "/tasks"} className="mt-2 inline-flex min-h-10 items-center text-sm font-semibold text-[var(--primary)] hover:underline">{item.submissionId ? "Baca umpan balik guru" : "Cari tugas untuk membuktikan skill"} →</Link></article>) : <EmptyState title={readiness.total ? "Seluruh target role terpenuhi" : "Prioritas belum tersedia"} description={readiness.total ? "Pertahankan kualitas bukti dan lanjutkan proyek yang lebih menantang." : "Prioritas akan muncul setelah kebutuhan role dikonfigurasi."} />}
        </div></section>
        <section aria-labelledby="role-mapping"><SectionHeader id="role-mapping" title="Peta kompetensi → role" description="Hanya nilai dari bukti yang telah ditinjau guru yang digunakan." /><div className="mt-3 divide-y divide-[var(--border)] border-y border-[var(--border)]">{readiness.skills.map((item) => <div key={item.competencyId} className="py-4"><div className="flex items-start justify-between gap-4"><h3 className="text-sm font-medium">{item.name}</h3><span className="shrink-0 text-sm tabular-nums">{item.score ?? "—"} / {item.target}</span></div><p className="mt-1 text-xs text-[var(--muted)]">{item.score === null ? "Belum ada nilai berbukti" : item.gap ? `Skill gap · kurang ${item.gap} poin` : "Memenuhi target role"}</p>{item.submissionId ? <Link href={`/submissions/${item.submissionId}`} className="mt-1 inline-flex min-h-8 items-center text-xs font-semibold text-[var(--primary)] hover:underline">Telusuri bukti & penilaian →</Link> : null}</div>)}</div></section>
      </div>
      <section className="mt-8 border-t border-[var(--border)] pt-6" aria-labelledby="school-summary"><SectionHeader id="school-summary" title="Profil kompetensi sekolah" description="Acuan guru berbeda dari target role. Nilai historis tanpa bukti tetap terlihat di sini." /><p className="mt-3 text-sm">{school.counts.competent} memenuhi acuan · {school.counts.gap} skill gap · {school.counts.unassessed} belum dinilai</p><Link href="/competencies" className="mt-2 inline-flex min-h-11 items-center text-sm font-semibold text-[var(--primary)] hover:underline">Buka profil & sumber nilai →</Link></section>
      <section className="mt-8" aria-labelledby="recent-projects"><SectionHeader id="recent-projects" title="Portofolio terbaru" description="Proyek tersimpan baru memengaruhi readiness setelah dikirim ke tugas dan dinilai guru." /><div className="mt-3 border-t border-[var(--border)]">
        {portfoliosResult.error ? <InlineAlert variant="warning">Portofolio terbaru belum dapat dimuat.</InlineAlert> : portfoliosResult.data?.length ? portfoliosResult.data.map((item) => <PortfolioItem key={item.id} title={item.title} description={item.description ?? ""} date={formatDate(item.created_at)} competencies={[]} projectUrl={safeEvidenceUrl(item.project_url) ?? undefined} evidenceUrl={safeEvidenceUrl(item.evidence_url) ?? undefined} />) : <EmptyState title="Belum ada bukti proyek" description="Simpan proyek pertama lalu kirimkan ke tugas praktik." action={<Link href="/portfolio" className="font-semibold text-[var(--primary)]">Tambah proyek →</Link>} />}
      </div><Link href="/portfolio" className="mt-2 inline-flex min-h-11 items-center text-sm font-semibold text-[var(--primary)] hover:underline">Semua portofolio →</Link></section>
    </>}
  </Screen>;
}
