import Link from "next/link";

import { CompetencyForm, type CompetencyOption } from "@/components/competency-form";
import { CompetencyMobileRow, DataTable, EmptyState, type DataTableColumn } from "@/components/product";
import { PageHeader, Screen } from "@/components/screen";
import { InlineAlert, StatusBadge } from "@/components/ui";
import { requireProfile } from "@/lib/auth";
import { formatDate } from "@/lib/evidence";
import { deriveCompetencies, type CompetencyView } from "@/lib/skill-gap";
import { createClient } from "@/lib/supabase/server";

export default async function CompetenciesPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const { edit } = await searchParams;
  const profile = await requireProfile();
  const teacher = profile.role === "teacher";
  const supabase = await createClient();
  const [competenciesResult, assessmentsResult] = await Promise.all([
    supabase.from("competencies").select("id,name,description,industry_target").order("name"),
    teacher
      ? Promise.resolve(null)
      : supabase.from("current_competency_assessments").select("competency_id,score,note,submission_id,task_title,reviewed_at,reviewer_name").eq("student_id", profile.id),
  ]);
  const queryFailed = competenciesResult.error || assessmentsResult?.error;
  const competencies = deriveCompetencies(
    (competenciesResult.data ?? []).map((item) => ({ id: item.id, name: item.name, description: item.description, target: item.industry_target })),
    (assessmentsResult?.data ?? []).map((item) => ({ competencyId: item.competency_id, score: item.score, note: item.note, submissionId: item.submission_id, taskTitle: item.task_title, reviewedAt: item.reviewed_at, reviewerName: item.reviewer_name })),
  );
  const columns: Array<DataTableColumn<CompetencyView>> = [
    {
      key: "name",
      header: "Kompetensi",
      render: (row) => <div><p className="font-medium">{row.name}</p><p className="mt-0.5 max-w-xl text-xs text-[var(--muted)]">{row.description}</p></div>,
    },
    { key: "target", header: "Acuan sekolah", align: "right", render: (row) => <span className="tabular-nums">{row.target}</span> },
    ...(!teacher ? [
      { key: "score", header: "Nilai", align: "right" as const, render: (row: CompetencyView) => <span className="tabular-nums">{row.score ?? "—"}</span> },
      { key: "gap", header: "Selisih", align: "right" as const, render: (row: CompetencyView) => <span className="tabular-nums">{row.gap ? `-${row.gap}` : "—"}</span> },
      { key: "status", header: "Status", render: (row: CompetencyView) => <StatusBadge status={row.status} /> },
      { key: "source", header: "Sumber nilai", render: (row: CompetencyView) => <AssessmentProvenance item={row} /> },
    ] : []),
    ...(teacher ? [{
      key: "action",
      header: "Aksi",
      align: "right" as const,
      render: (row: CompetencyView) => (
        <Link className="inline-flex h-11 items-center text-sm font-semibold text-[var(--primary)] hover:underline" href={`/competencies?edit=${row.id}#competency-form`}>Edit</Link>
      ),
    }] : []),
  ];
  const competencyOptions: CompetencyOption[] = competencies.map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description ?? "",
    industryTarget: item.target,
  }));
  const initialCompetency = teacher ? competencyOptions.find((item) => item.id === edit) : undefined;
  const invalidEdit = teacher && Boolean(edit) && !initialCompetency;

  return (
    <Screen>
      <PageHeader
        description={teacher ? "Kelola kompetensi dan acuan sekolah. Target role industri dikelola terpisah." : "Nilai berasal dari kiriman terbaru yang sudah dinilai. Riwayat lama ditandai tanpa bukti; target role tersedia di dashboard."}
        eyebrow={teacher ? "Data kompetensi" : "Rekam kompetensi"}
        title="Kompetensi"
      />

      {queryFailed ? (
        <EmptyState description="Daftar kompetensi belum dapat dimuat. Muat ulang halaman untuk mencoba lagi." title="Gagal memuat kompetensi" />
      ) : (
        <>
      {invalidEdit ? (
        <div className="mt-6">
          <InlineAlert variant="error">Kompetensi yang ingin diedit tidak ditemukan. Pilih kembali dari daftar.</InlineAlert>
        </div>
      ) : teacher ? (
        <CompetencyForm
          competencies={competencyOptions}
          initialCompetency={initialCompetency}
          key={initialCompetency?.id ?? "new"}
        />
      ) : null}

      <p className="mt-6 text-xs font-medium text-[var(--muted)]" role="status">Menampilkan {competencies.length} kompetensi</p>

      <div className="mt-3 hidden md:block"><DataTable caption="Daftar kompetensi" columns={columns} emptyMessage="Belum ada kompetensi." rows={competencies} /></div>
      <div className="mt-3 border-y border-[var(--border)] bg-[var(--surface)] md:hidden">
        {competencies.map((item) => <CompetencyMobileRow action={teacher ? <Link className="inline-flex h-11 items-center text-sm font-semibold text-[var(--primary)] hover:underline" href={`/competencies?edit=${item.id}#competency-form`}>Edit kompetensi</Link> : <AssessmentProvenance item={item} />} gap={teacher ? undefined : item.gap} key={item.id} name={item.name} note={teacher ? undefined : item.note} score={teacher ? undefined : item.score} status={teacher ? undefined : item.status} target={item.target} />)}
      </div>
        </>
      )}
    </Screen>
  );
}

function AssessmentProvenance({ item }: { item: CompetencyView }) {
  if (!item.submissionId) return <p className="text-xs text-[var(--muted)]">{item.score === null ? "Belum dinilai" : "Nilai historis · belum terhubung bukti"}</p>;
  return <div className="max-w-xs text-xs"><Link href={`/submissions/${item.submissionId}`} className="inline-flex min-h-10 items-center font-semibold text-[var(--primary)] hover:underline">{item.taskTitle ?? "Bukti & penilaian"} →</Link><p className="text-[var(--muted)]">{item.reviewerName}{item.reviewedAt ? ` · ${formatDate(item.reviewedAt)}` : ""}</p></div>;
}
