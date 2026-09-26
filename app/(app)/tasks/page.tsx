import Link from "next/link";
import { EmptyState } from "@/components/product";
import { PageHeader, Screen } from "@/components/screen";
import { requireProfile } from "@/lib/auth";
import { formatDate } from "@/lib/evidence";
import { createClient } from "@/lib/supabase/server";

export default async function TasksPage() {
  const profile = await requireProfile("student");
  const client = await createClient();
  const [tasks, submissions] = await Promise.all([
    client.from("assessment_tasks").select("id,title,instructions,created_at").eq("status", "published").order("created_at", { ascending: false }),
    client.from("submissions").select("id,task_id,status").eq("student_id", profile.id),
  ]);
  return <Screen>
    <PageHeader title="Tugas praktik" eyebrow="Buktikan kompetensimu" description="Kerjakan tugas, simpan proyek di portofolio, lalu kirim bukti untuk mendapat penilaian guru." />
    <div className="mt-8 divide-y divide-[var(--border)] border-y border-[var(--border)]">
      {tasks.error || submissions.error ? <EmptyState title="Tugas belum dapat dimuat" description="Muat ulang atau hubungi guru jika masalah berlanjut." /> : tasks.data?.length ? tasks.data.map((item) => {
        const submission = submissions.data?.find((entry) => entry.task_id === item.id);
        return <article key={item.id} className="py-5 sm:flex sm:items-start sm:justify-between sm:gap-8"><div><p className="text-xs text-[var(--muted)]">{formatDate(item.created_at)}</p><h2 className="mt-1 text-lg font-semibold"><Link href={`/tasks/${item.id}`} className="hover:text-[var(--primary)] hover:underline">{item.title}</Link></h2><p className="mt-2 line-clamp-2 max-w-2xl whitespace-pre-wrap text-sm text-[var(--muted)]">{item.instructions}</p><p className="mt-3 text-xs font-semibold">{submission?.status === "reviewed" ? "Sudah dinilai" : submission ? "Menunggu review guru" : "Belum dikirim"}</p></div><Link href={submission ? `/submissions/${submission.id}` : `/tasks/${item.id}`} className="mt-4 inline-flex min-h-11 shrink-0 items-center text-sm font-semibold text-[var(--primary)] hover:underline sm:mt-0">{submission?.status === "reviewed" ? "Lihat hasil" : submission ? "Lihat kiriman" : "Kerjakan tugas"} →</Link></article>;
      }) : <EmptyState title="Belum ada tugas praktik" description="Tugas akan muncul setelah guru menerbitkannya." />}
    </div>
  </Screen>;
}
