import Link from "next/link";
import { notFound } from "next/navigation";
import { ReviewForm } from "@/components/task-forms";
import { EmptyState } from "@/components/product";
import { PageHeader, Screen, SectionHeader } from "@/components/screen";
import { InlineAlert } from "@/components/ui";
import { requireProfile } from "@/lib/auth";
import { formatDate, isUuid, safeEvidenceUrl } from "@/lib/evidence";
import { createClient } from "@/lib/supabase/server";

export default async function SubmissionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await requireProfile();
  if (!isUuid(id)) notFound();
  const client = await createClient();
  const submission = await client.from("submissions").select("id,task_id,student_id,title,description,project_url,evidence_url,status,submitted_at,reviewed_at,reviewer_name").eq("id", id).maybeSingle();
  if (submission.error) return <Screen><EmptyState title="Kiriman belum dapat dimuat" description="Muat ulang halaman untuk mencoba lagi." /></Screen>;
  if (!submission.data) notFound();
  const item = submission.data;
  const [task, criteria, competencies, grades, student] = await Promise.all([
    client.from("assessment_tasks").select("title,teacher_id").eq("id", item.task_id).single(),
    client.from("task_competencies").select("competency_id,criteria").eq("task_id", item.task_id),
    client.from("competencies").select("id,name"),
    client.from("assessments").select("competency_id,score,note").eq("submission_id", id),
    client.from("profiles").select("name").eq("id", item.student_id).single(),
  ]);
  if (task.error || criteria.error || competencies.error || grades.error || student.error) return <Screen><EmptyState title="Detail penilaian belum dapat dimuat" description="Muat ulang halaman untuk mencoba lagi." /></Screen>;
  const reviewCompetencies = (criteria.data ?? []).map((criterion) => ({ id: criterion.competency_id, name: competencies.data?.find((entry) => entry.id === criterion.competency_id)?.name ?? "Kompetensi", criteria: criterion.criteria }));
  const teacher = profile.role === "teacher" && task.data?.teacher_id === profile.id;
  return <Screen>
    <Link href={`/tasks/${item.task_id}`} className="mb-4 inline-flex min-h-10 items-center text-sm text-[var(--primary)] hover:underline">← {task.data?.title}</Link>
    <PageHeader title={item.title} eyebrow={item.status === "reviewed" ? "Penilaian diterbitkan" : "Menunggu review"} description={`${student.data?.name} · Dikirim ${formatDate(item.submitted_at)}`} />
    <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
      <section aria-labelledby="evidence-title"><SectionHeader id="evidence-title" title="Bukti yang dikirim" description="Salinan proyek pada saat pengiriman; isi tautan eksternal masih dapat berubah." /><p className="mt-4 whitespace-pre-wrap break-words text-sm leading-7">{item.description || "Tidak ada deskripsi tambahan."}</p><div className="mt-4 grid gap-3">{[["Buka proyek", item.project_url], ["Buka dokumentasi / bukti", item.evidence_url]].map(([label, raw]) => {
        const url = safeEvidenceUrl(raw);
        return url ? <a href={url} key={label} target="_blank" rel="noopener noreferrer" className="rounded-[var(--radius-medium)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm font-semibold text-[var(--primary)] hover:bg-blue-50">{label} ↗<span className="mt-1 block break-all text-xs font-normal text-[var(--muted)]">{new URL(url).hostname}</span></a> : null;
      })}</div><p className="mt-4 text-xs leading-5 text-[var(--muted)]">Tautan berasal dari siswa. Jangan masukkan kredensial atau menjalankan file yang tidak dipercaya.</p></section>
      <section aria-labelledby="review-title"><SectionHeader id="review-title" title={item.status === "reviewed" ? "Hasil per kompetensi" : teacher ? "Tinjau kompetensi" : "Penilaian guru"} />
        {item.status === "reviewed" ? <><p className="mt-2 text-xs text-[var(--muted)]">Dinilai oleh {item.reviewer_name ?? "Guru"}{item.reviewed_at ? ` · ${formatDate(item.reviewed_at)}` : ""}</p><div className="mt-4 divide-y divide-[var(--border)] border-y border-[var(--border)]">{reviewCompetencies.map((competency) => {
          const grade = grades.data?.find((entry) => entry.competency_id === competency.id);
          return <article key={competency.id} className="py-4"><div className="flex items-start justify-between gap-4"><h3 className="font-semibold">{competency.name}</h3><span className="shrink-0 text-xl font-bold tabular-nums">{grade?.score ?? "—"}<span className="text-xs font-normal text-[var(--muted)]"> / 100</span></span></div><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[var(--muted)]">{grade?.note || "Tidak ada catatan tambahan."}</p></article>;
        })}</div>{!teacher ? <Link href="/dashboard" className="mt-4 inline-flex min-h-11 items-center font-semibold text-[var(--primary)] hover:underline">Lihat dampak pada kesiapan role →</Link> : null}</> : teacher ? <ReviewForm submissionId={id} competencies={reviewCompetencies} /> : <div className="mt-4"><InlineAlert variant="info">Guru belum menerbitkan penilaian. Bukti ini belum memengaruhi skor kesiapanmu.</InlineAlert></div>}
      </section>
    </div>
  </Screen>;
}
