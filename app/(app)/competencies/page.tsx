import { CompetencyMobileRow, DataTable, type DataTableColumn } from "@/components/product";
import { PlusIcon } from "@/components/icons";
import { EmptyState } from "@/components/product";
import { PageHeader, Screen } from "@/components/screen";
import { Button, StatusBadge } from "@/components/ui";
import { requireProfile } from "@/lib/auth";
import { deriveCompetencies, type CompetencyView } from "@/lib/skill-gap";
import { createClient } from "@/lib/supabase/server";

export default async function CompetenciesPage() {
  const profile = await requireProfile();
  const teacher = profile.role === "teacher";
  const supabase = await createClient();
  const [competenciesResult, assessmentsResult] = await Promise.all([
    supabase.from("competencies").select("id,name,description,industry_target").order("name"),
    teacher
      ? Promise.resolve(null)
      : supabase.from("assessments").select("competency_id,score,note").eq("student_id", profile.id),
  ]);
  const queryFailed = competenciesResult.error || assessmentsResult?.error;
  const competencies = deriveCompetencies(
    (competenciesResult.data ?? []).map((item) => ({ id: item.id, name: item.name, description: item.description, target: item.industry_target })),
    (assessmentsResult?.data ?? []).map((item) => ({ competencyId: item.competency_id, score: item.score, note: item.note })),
  );
  const columns: Array<DataTableColumn<CompetencyView>> = [
    {
      key: "name",
      header: "Kompetensi",
      render: (row) => <div><p className="font-medium">{row.name}</p><p className="mt-0.5 max-w-xl text-xs text-[var(--muted)]">{row.description}</p></div>,
    },
    { key: "target", header: "Target", align: "right", render: (row) => <span className="tabular-nums">{row.target}</span> },
    ...(!teacher ? [
      { key: "score", header: "Nilai", align: "right" as const, render: (row: CompetencyView) => <span className="tabular-nums">{row.score ?? "—"}</span> },
      { key: "gap", header: "Selisih", align: "right" as const, render: (row: CompetencyView) => <span className="tabular-nums">{row.gap ? `-${row.gap}` : "—"}</span> },
      { key: "status", header: "Status", render: (row: CompetencyView) => <StatusBadge status={row.status} /> },
    ] : []),
    ...(teacher ? [{ key: "action", header: "Aksi", align: "right" as const, render: () => <button className="h-11 text-sm font-semibold text-[var(--primary)]">Edit</button> }] : []),
  ];

  return (
    <Screen>
      <PageHeader
        action={teacher ? <Button><PlusIcon className="size-4" />Tambah kompetensi</Button> : undefined}
        description={teacher ? "Kelola target industri yang menjadi acuan penilaian siswa." : "Bandingkan nilai praktikmu dengan target industri pada setiap kompetensi."}
        eyebrow={teacher ? "Data kompetensi" : "Rekam kompetensi"}
        title="Kompetensi"
      />

      {queryFailed ? (
        <EmptyState description="Daftar kompetensi belum dapat dimuat. Muat ulang halaman untuk mencoba lagi." title="Gagal memuat kompetensi" />
      ) : (
        <>
      <p className="mt-6 text-xs font-medium text-[var(--muted)]" role="status">Menampilkan {competencies.length} kompetensi</p>

      <div className="mt-3 hidden md:block"><DataTable caption="Daftar kompetensi" columns={columns} emptyMessage="Belum ada kompetensi." rows={competencies} /></div>
      <div className="mt-3 border-y border-[var(--border)] bg-[var(--surface)] md:hidden">
        {competencies.map((item) => <CompetencyMobileRow action={teacher ? <button className="h-11 text-sm font-semibold text-[var(--primary)]">Edit kompetensi</button> : undefined} gap={teacher ? undefined : item.gap} key={item.id} name={item.name} note={teacher ? undefined : item.note} score={teacher ? undefined : item.score} status={teacher ? undefined : item.status} target={item.target} />)}
      </div>
        </>
      )}
    </Screen>
  );
}
