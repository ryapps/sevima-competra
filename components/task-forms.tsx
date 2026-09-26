"use client";

import { useActionState } from "react";
import { publishTask, publishReview, submitPortfolio, type TaskFormState } from "@/app/actions/tasks";
import { Button, InlineAlert, InputField, SelectField, TextareaField } from "@/components/ui";

const initialState: TaskFormState = { values: {}, competencyIds: [], revision: 0 };

export function TaskForm({ competencies }: { competencies: { id: string; name: string }[] }) {
  const [state, action, pending] = useActionState(publishTask, initialState);
  return (
    <form action={action} className="mt-4 grid gap-4">
      {state.message ? <InlineAlert variant="error">{state.message}</InlineAlert> : null}
      <fieldset disabled={pending} key={state.revision} className="grid min-w-0 gap-4">
        <InputField id="task-title" label="Judul tugas" name="title" maxLength={120} defaultValue={state.values.title} placeholder="Bangun halaman profil usaha yang responsif" required />
        <TextareaField id="task-instructions" label="Instruksi dan bukti yang harus dikirim" name="instructions" maxLength={4000} defaultValue={state.values.instructions} helper="Jelaskan hasil akhir, tautan proyek, dan dokumentasi yang perlu disertakan." required />
        <fieldset className="rounded-[var(--radius-medium)] border border-[var(--border)] p-4">
          <legend className="px-1 text-sm font-medium">Kompetensi yang dinilai (pilih 1–20)</legend>
          <div className="grid gap-2 sm:grid-cols-2">{competencies.map((item) => <label key={item.id} className="flex min-h-10 items-center gap-3 text-sm"><input className="size-4 accent-[var(--primary)]" type="checkbox" name="competencyIds" value={item.id} defaultChecked={state.competencyIds.includes(item.id)} />{item.name}</label>)}</div>
        </fieldset>
        <TextareaField id="task-criteria" label="Kriteria penilaian" name="criteria" maxLength={1000} defaultValue={state.values.criteria} helper="Kriteria ini berlaku untuk setiap kompetensi terpilih. Guru memberi nilai 0–100 per kompetensi." required />
        <p className="text-xs leading-5 text-[var(--muted)]">Tugas langsung terlihat oleh seluruh siswa. Instruksi dan kompetensi dikunci setelah diterbitkan.</p>
        <Button type="submit" loading={pending} disabled={!competencies.length} className="justify-self-start">Terbitkan tugas</Button>
      </fieldset>
    </form>
  );
}

export function SubmissionForm({ taskId, portfolios }: { taskId: string; portfolios: { id: string; title: string }[] }) {
  const [state, action, pending] = useActionState(submitPortfolio.bind(null, taskId), initialState);
  return (
    <form action={action} className="mt-4 grid gap-4">
      {state.message ? <InlineAlert variant="error">{state.message}</InlineAlert> : null}
      <fieldset key={state.revision} disabled={pending} className="grid min-w-0 gap-4">
        <SelectField id="submission-portfolio" name="portfolioId" label="Proyek portofolio" required defaultValue={state.values.portfolioId ?? ""} options={portfolios.map((item) => ({ label: item.title, value: item.id }))} />
        <p className="text-sm leading-6 text-[var(--muted)]">Pastikan tautan dapat diakses guru. Satu kiriman per tugas; proyek dan salinan bukti akan dikunci setelah dikirim.</p>
        <Button type="submit" loading={pending} disabled={!portfolios.length} className="justify-self-start">Kirim bukti untuk dinilai</Button>
      </fieldset>
    </form>
  );
}

export function ReviewForm({ submissionId, competencies }: { submissionId: string; competencies: { id: string; name: string; criteria: string }[] }) {
  const [state, action, pending] = useActionState(publishReview.bind(null, submissionId), initialState);
  return (
    <form action={action} className="mt-4 grid gap-4">
      {state.message ? <InlineAlert variant={state.ok ? "success" : "error"}>{state.message}</InlineAlert> : null}
      <fieldset key={state.revision} disabled={pending || state.ok} className="grid min-w-0 gap-5">
        {competencies.map((item) => <section key={item.id} className="grid gap-4 rounded-[var(--radius-medium)] border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5">
          <div><h3 className="font-semibold">{item.name}</h3><p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-[var(--muted)]">{item.criteria}</p></div>
          <InputField id={`score-${item.id}`} name={`score:${item.id}`} label="Nilai (0–100)" type="number" min={0} max={100} step={1} required defaultValue={state.values[`score:${item.id}`] ?? ""} />
          <TextareaField id={`note-${item.id}`} name={`note:${item.id}`} label="Umpan balik dan langkah perbaikan" maxLength={500} defaultValue={state.values[`note:${item.id}`] ?? ""} />
        </section>)}
        <p className="text-xs leading-5 text-[var(--muted)]">Seluruh nilai diterbitkan bersamaan dan tidak dapat diubah. Periksa bukti sebelum menyimpan.</p>
        <Button type="submit" loading={pending} disabled={state.ok || !competencies.length} className="justify-self-start">Terbitkan penilaian</Button>
      </fieldset>
    </form>
  );
}
