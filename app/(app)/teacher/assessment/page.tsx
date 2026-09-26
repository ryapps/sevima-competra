import Link from "next/link";

import { PageHeader, Screen } from "@/components/screen";
import { Button, InlineAlert, InputField, SelectField, StatusBadge, TextareaField } from "@/components/ui";
import { requireProfile } from "@/lib/auth";
import { demoCompetencies } from "@/lib/demo-data";

export default async function AssessmentPage() {
  const profile = await requireProfile("teacher");
  return (
    <Screen>
      <PageHeader
        action={<Link className="inline-flex h-10 items-center rounded-[var(--radius-medium)] border border-[var(--border)] bg-white px-4 text-sm font-semibold hover:bg-slate-50" href="/competencies">Kelola kompetensi</Link>}
        description={`${profile.name}, pilih siswa dan kompetensi untuk mencatat nilai praktik terbaru.`}
        eyebrow="Workspace guru"
        title="Penilaian kompetensi"
      />

      <div className="mt-8 max-w-2xl">
        <form className="grid gap-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField defaultValue="andi" id="student" label="Siswa" name="student" options={[{ label: "Andi Pratama", value: "andi" }]} required />
            <SelectField defaultValue={demoCompetencies[0].id} id="competency" label="Kompetensi" name="competency" options={demoCompetencies.map((item) => ({ label: item.name, value: item.id }))} required />
          </div>

          <section className="border-y border-[var(--border)] bg-slate-50 px-4 py-4" aria-label="Konteks penilaian">
            <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div><dt className="text-xs text-[var(--muted)]">Target industri</dt><dd className="mt-1 font-semibold tabular-nums">80</dd></div>
              <div><dt className="text-xs text-[var(--muted)]">Nilai saat ini</dt><dd className="mt-1 font-semibold">—</dd></div>
              <div className="col-span-2 sm:col-span-1"><dt className="mb-1 text-xs text-[var(--muted)]">Status</dt><dd><StatusBadge status="unassessed" /></dd></div>
            </dl>
          </section>

          <InlineAlert variant="info">Nilai baru akan menggantikan penilaian aktif untuk pasangan siswa dan kompetensi ini.</InlineAlert>
          <InputField helper="Masukkan bilangan bulat dari 0 sampai 100." id="score" inputMode="numeric" label="Nilai" max={100} min={0} name="score" placeholder="Contoh: 85" required type="number" />
          <TextareaField helper="Opsional, maksimal 500 karakter." id="note" label="Catatan guru" maxLength={500} name="note" placeholder="Tuliskan konteks atau fokus perbaikan…" />
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button type="reset" variant="secondary">Bersihkan</Button>
            <Button className="sm:w-auto" size="mobile" type="button">Simpan penilaian</Button>
          </div>
        </form>
      </div>
    </Screen>
  );
}
