import Link from "next/link";
import { TaskForm } from "@/components/task-forms";
import { EmptyState } from "@/components/product";
import { PageHeader, Screen, SectionHeader } from "@/components/screen";
import { requireProfile } from "@/lib/auth";
import { formatDate } from "@/lib/evidence";
import { createClient } from "@/lib/supabase/server";

export default async function AssessmentPage() {
  const profile = await requireProfile("teacher");
  const client = await createClient();
  const [tasks, competencies, submissions] = await Promise.all([
    client.from("assessment_tasks").select("id,title,created_at").eq("teacher_id", profile.id).order("created_at", { ascending: false }),
    client.from("competencies").select("id,name").order("name"),
    client.from("submissions").select("id,task_id,title,status,submitted_at").order("submitted_at"),
  ]);
  const failed = tasks.error || competencies.error || submissions.error;
  const pending = (submissions.data ?? []).filter((item) => item.status === "submitted");
  return <Screen>
    <PageHeader title="Tugas & penilaian" eyebrow="Workspace guru" description={`${profile.name}, terbitkan tugas praktik lalu nilai kompetensi dari bukti siswa.`} action={<Link href="/competencies" className="text-sm font-semibold text-[var(--primary)] hover:underline">Kelola kompetensi</Link>} />
    {failed ? <div className="mt-8"><EmptyState title="Workspace belum dapat dimuat" description="Pastikan migrasi Competency Intelligence sudah diterapkan di Supabase, lalu muat ulang." /></div> : <>
      <section className="mt-8" aria-labelledby="review-queue">
        <SectionHeader id="review-queue" title={`Perlu ditinjau · ${pending.length}`} description="Penilaian yang diterbitkan langsung memperbarui profil kompetensi siswa." />
        <div className="mt-3 divide-y divide-[var(--border)] border-y border-[var(--border)]">
          {pending.length ? pending.map((item) => <Link key={item.id} href={`/submissions/${item.id}`} className="flex min-h-20 items-center justify-between gap-4 py-4 hover:bg-slate-50"><div><p className="font-medium">{item.title}</p><p className="mt-1 text-xs text-[var(--muted)]">{tasks.data?.find((task) => task.id === item.task_id)?.title} · {formatDate(item.submitted_at)}</p></div><span className="shrink-0 text-sm font-semibold text-[var(--primary)]">Tinjau bukti →</span></Link>) : <EmptyState title="Tidak ada antrean review" description="Kiriman siswa dari tugas Anda akan muncul di sini." />}
        </div>
      </section>
      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <section aria-labelledby="create-task"><SectionHeader id="create-task" title="Buat tugas praktik" description="Mulai dari pekerjaan nyata dan kompetensi yang ingin dibuktikan." />{competencies.data?.length ? <TaskForm competencies={competencies.data} /> : <EmptyState title="Tambahkan kompetensi dahulu" description="Tugas memerlukan minimal satu kompetensi untuk dinilai." action={<Link href="/competencies" className="text-[var(--primary)]">Kelola kompetensi →</Link>} />}</section>
        <section aria-labelledby="my-tasks"><SectionHeader id="my-tasks" title={`Tugas diterbitkan · ${tasks.data?.length ?? 0}`} /><div className="mt-4 divide-y divide-[var(--border)] border-y border-[var(--border)]">{tasks.data?.length ? tasks.data.map((item) => {
          const received = (submissions.data ?? []).filter((submission) => submission.task_id === item.id);
          return <Link key={item.id} href={`/tasks/${item.id}`} className="block py-4 hover:bg-slate-50"><p className="font-semibold text-[var(--primary)]">{item.title} →</p><p className="mt-1 text-xs text-[var(--muted)]">{received.length} kiriman · {received.filter((submission) => submission.status === "reviewed").length} dinilai</p></Link>;
        }) : <EmptyState title="Belum ada tugas" description="Terbitkan tugas pertama melalui formulir di samping." />}</div></section>
      </div>
    </>}
  </Screen>;
}
