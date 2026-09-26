import { EmptyState } from "@/components/product";
import { PlusIcon } from "@/components/icons";
import { PageHeader, Screen } from "@/components/screen";
import { Button, InputField, TextareaField } from "@/components/ui";
import { requireProfile } from "@/lib/auth";
import { demoCompetencies } from "@/lib/demo-data";

export default async function PortfolioPage() {
  await requireProfile("student");

  return (
    <Screen>
      <PageHeader description="Simpan tautan proyek sebagai bukti penerapan kompetensi praktikmu." eyebrow="Bukti praktik" title="Portofolio" />

      <details className="group mt-6 border-y border-[var(--border)] bg-[var(--surface)] sm:rounded-[var(--radius-medium)] sm:border">
        <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between px-4 font-semibold text-[var(--primary)] sm:px-6">
          <span className="inline-flex items-center gap-2"><PlusIcon className="size-4" />Tambah proyek</span>
          <span aria-hidden="true" className="text-xs font-medium text-[var(--muted)] group-open:hidden">Buka formulir</span>
          <span aria-hidden="true" className="hidden text-xs font-medium text-[var(--muted)] group-open:inline">Tutup</span>
        </summary>
        <form className="grid gap-5 border-t border-[var(--border)] px-4 py-6 sm:px-6">
          <InputField id="title" label="Judul proyek" maxLength={120} name="title" placeholder="Contoh: Website profil UMKM" required />
          <TextareaField id="description" label="Deskripsi" maxLength={1000} name="description" placeholder="Jelaskan kontribusi dan hasil proyek…" />
          <div className="grid gap-4 sm:grid-cols-2">
            <InputField helper="Gunakan URL http atau https." id="project-url" label="URL proyek" name="projectUrl" placeholder="https://…" type="url" />
            <InputField helper="Repo, dokumentasi, atau bukti lainnya." id="evidence-url" label="URL bukti" name="evidenceUrl" placeholder="https://…" type="url" />
          </div>
          <fieldset>
            <legend className="text-sm font-medium">Kompetensi terkait <span className="text-[var(--destructive)]">*</span></legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {demoCompetencies.map((item) => (
                <label className="flex min-h-11 items-center gap-3 border-b border-[var(--border)] py-2 text-sm" key={item.id}>
                  <input className="size-4 accent-[var(--primary)]" name="competencyIds" type="checkbox" value={item.id} />
                  {item.name}
                </label>
              ))}
            </div>
          </fieldset>
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button type="reset" variant="secondary">Bersihkan</Button>
            <Button className="sm:w-auto" size="mobile" type="button">Simpan proyek</Button>
          </div>
        </form>
      </details>

      <section className="mt-8 border-t border-[var(--border)]" aria-label="Daftar portofolio">
        <EmptyState description="Tambahkan proyek yang menunjukkan kompetensi praktikmu." title="Belum ada bukti portofolio" />
      </section>
    </Screen>
  );
}
