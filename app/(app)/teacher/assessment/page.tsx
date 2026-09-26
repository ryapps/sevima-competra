import Link from "next/link";

import { AssessmentForm } from "@/components/assessment-form";
import { CompetencyIcon } from "@/components/icons";
import { EmptyState } from "@/components/product";
import { PageHeader, Screen } from "@/components/screen";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function AssessmentPage() {
  const profile = await requireProfile("teacher");
  const supabase = await createClient();
  const [studentsResult, competenciesResult, assessmentsResult] = await Promise.all([
    supabase.from("profiles").select("id,name").eq("role", "student").order("name"),
    supabase.from("competencies").select("id,name,industry_target").order("name"),
    supabase.from("assessments").select("id,student_id,competency_id,score,note"),
  ]);

  const students = (studentsResult.data ?? []).map((item) => ({ id: item.id, name: item.name }));
  const competencies = (competenciesResult.data ?? []).map((item) => ({
    id: item.id,
    name: item.name,
    target: item.industry_target,
  }));
  const assessments = (assessmentsResult.data ?? []).map((item) => ({
    id: item.id,
    studentId: item.student_id,
    competencyId: item.competency_id,
    score: item.score,
    note: item.note ?? "",
  }));
  const queryFailed = studentsResult.error || competenciesResult.error || assessmentsResult.error;

  return (
    <Screen>
      <PageHeader
        action={<Link className="inline-flex h-10 items-center gap-2 rounded-[var(--radius-medium)] border border-[var(--border)] bg-white px-4 text-sm font-semibold shadow-[var(--raised-shadow)] hover:border-slate-400 hover:bg-slate-50" href="/competencies"><CompetencyIcon className="size-4" />Kelola kompetensi</Link>}
        description={`${profile.name}, pilih siswa dan kompetensi untuk mencatat nilai praktik terbaru.`}
        eyebrow="Workspace guru"
        title="Penilaian kompetensi"
      />

      <div className="mt-8 max-w-2xl">
        {queryFailed ? (
          <EmptyState description="Data penilaian belum dapat dimuat. Muat ulang halaman untuk mencoba lagi." title="Gagal memuat workspace" />
        ) : students.length === 0 ? (
          <EmptyState description="Tambahkan akun siswa sebelum membuat penilaian." title="Belum ada siswa" />
        ) : competencies.length === 0 ? (
          <EmptyState description="Tambahkan kompetensi sebelum membuat penilaian." title="Belum ada kompetensi" />
        ) : (
          <AssessmentForm assessments={assessments} competencies={competencies} students={students} />
        )}
      </div>
    </Screen>
  );
}
