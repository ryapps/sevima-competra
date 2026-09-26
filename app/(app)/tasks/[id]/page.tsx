import Link from "next/link";
import { notFound } from "next/navigation";
import { SubmissionForm } from "@/components/task-forms";
import { EmptyState } from "@/components/product";
import { PageHeader, Screen, SectionHeader } from "@/components/screen";
import { InlineAlert } from "@/components/ui";
import { requireProfile } from "@/lib/auth";
import { formatDate, isUuid } from "@/lib/evidence";
import { createClient } from "@/lib/supabase/server";

export default async function TaskPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await requireProfile();
  if (!isUuid(id)) notFound();
  const teacher = profile.role === "teacher";
  const client = await createClient();
  const [task, criteria, competencies, submissions, portfolios] = await Promise.all([
    client.from("assessment_tasks").select("id,title,instructions,teacher_id").eq("id", id).maybeSingle(),
    client.from("task_competencies").select("competency_id,criteria").eq("task_id", id),
    client.from("competencies").select("id,name"),
    client.from("submissions").select("id,student_id,title,status,submitted_at").eq("task_id", id).order("submitted_at"),
    teacher ? Promise.resolve(null) : client.from("portfolios").select("id,title").eq("student_id", profile.id).order("created_at", { ascending: false }),
  ]);
  if (task.error || criteria.error || competencies.error || submissions.error || portfolios?.error) return <Screen><EmptyState title="Tugas belum dapat dimuat" description="Muat ulang halaman untuk mencoba lagi." /></Screen>;
  if (!task.data) notFound();
  const ownSubmission = submissions.data?.find((item) => item.student_id === profile.id);
  const students = teacher && submissions.data?.length ? await client.from("profiles").select("id,name").in("id", submissions.data.map((item) => item.student_id)) : null;
  return <Screen>
    <Link href={teacher ? "/teacher/assessment" : "/tasks"} className="mb-4 inline-flex min-h-10 items-center text-sm text-[var(--primary)] hover:underline">← Daftar tugas</Link>
    <PageHeader title={task.data.title} eyebrow="Tugas praktik" description="Nilai diterbitkan per kompetensi setelah guru meninjau bukti proyek." />
    <div className="mt-8 grid items-start gap-8 lg:grid-cols-2">
      <section aria-labelledby="instructions"><SectionHeader id="instructions" title="Yang perlu dikerjakan" /><p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7">{task.data.instructions}</p><h2 className="mt-8 text-lg font-semibold">Kompetensi & kriteria</h2><div className="mt-3 divide-y divide-[var(--border)] border-y border-[var(--border)]">{criteria.data?.map((item) => <div key={item.competency_id} className="py-4"><h3 className="font-medium">{competencies.data?.find((competency) => competency.id === item.competency_id)?.name ?? "Kompetensi"}</h3><p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-[var(--muted)]">{item.criteria}</p></div>)}</div></section>
      <section aria-labelledby="task-submissions"><SectionHeader id="task-submissions" title={teacher ? `Kiriman siswa · ${submissions.data?.length ?? 0}` : "Kirim bukti praktik"} />
        {teacher ? <div className="mt-4 divide-y divide-[var(--border)] border-y border-[var(--border)]">{students?.error ? <InlineAlert variant="warning">Nama siswa belum dapat dimuat.</InlineAlert> : null}{submissions.data?.length ? submissions.data.map((item) => <Link href={`/submissions/${item.id}`} key={item.id} className="block py-4 hover:bg-slate-50"><p className="font-medium">{students?.data?.find((student) => student.id === item.student_id)?.name ?? "Siswa"} · {item.title}</p><p className="mt-1 text-xs text-[var(--muted)]">{formatDate(item.submitted_at)}</p><p className="mt-2 text-sm font-semibold text-[var(--primary)]">{item.status === "reviewed" ? "Sudah dinilai · Lihat hasil" : "Menunggu review · Tinjau"} →</p></Link>) : <EmptyState title="Belum ada kiriman" description="Siswa dapat memilih proyek portofolio dan mengirimkannya melalui halaman ini." />}</div> : ownSubmission ? <div className="mt-4"><InlineAlert variant="success">Bukti telah dikirim. {ownSubmission.status === "reviewed" ? "Penilaian sudah tersedia." : "Menunggu penilaian guru."}</InlineAlert><Link className="mt-4 inline-flex min-h-11 items-center font-semibold text-[var(--primary)] hover:underline" href={`/submissions/${ownSubmission.id}`}>Lihat kiriman & hasil →</Link></div> : <><p className="mt-3 text-sm text-[var(--muted)]">Gunakan proyek yang sudah tersimpan di portofolio.</p><Link href="/portfolio" className="mt-2 inline-flex min-h-11 items-center text-sm font-semibold text-[var(--primary)] hover:underline">Tambah proyek di portofolio →</Link>{portfolios?.data?.length ? <SubmissionForm taskId={id} portfolios={portfolios.data} /> : <EmptyState title="Belum ada proyek" description="Tambahkan proyek dengan URL bukti, lalu kembali ke tugas ini untuk mengirimkannya." />}</>}
      </section>
    </div>
  </Screen>;
}
