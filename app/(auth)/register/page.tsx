import { RegisterForm } from "@/components/register-form";

export default function RegisterPage() {
  return (
    <main className="grid min-h-screen lg:grid-cols-[minmax(0,0.9fr)_minmax(520px,1.1fr)]">
      <section
        aria-label="Tentang akun siswa Competra"
        className="hidden bg-[var(--foreground)] px-12 py-12 text-white lg:flex lg:flex-col lg:justify-between"
      >
        <div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-[var(--radius-medium)] bg-white text-sm font-bold text-[var(--foreground)]">C</span><p className="text-lg font-bold tracking-[-0.02em]">Competra</p></div>
        <div className="max-w-xl">
          <p className="text-[34px] font-bold leading-[1.2] tracking-[-0.03em]">Bangun rekam kompetensi dari praktik nyata.</p>
          <p className="mt-5 max-w-lg text-sm leading-6 text-slate-300">
            Akun yang dibuat melalui halaman ini selalu menjadi akun siswa. Akun guru disediakan secara terkontrol oleh pengelola.
          </p>
        </div>
        <p className="text-xs text-slate-400">MVP Peta Kompetensi SMK</p>
      </section>

      <section aria-labelledby="register-title" className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-10 flex items-center gap-3 lg:hidden"><span className="grid size-9 place-items-center rounded-[var(--radius-medium)] bg-[var(--foreground)] text-sm font-bold text-white">C</span><div><p className="font-bold">Competra</p><p className="text-xs text-[var(--muted)]">Pendaftaran akun siswa</p></div></div>
          <div>
            <p className="text-xs font-medium text-[var(--primary)]">Akun siswa</p>
            <h1 className="mt-1 text-2xl font-bold leading-8" id="register-title">Buat akun baru</h1>
            <p className="mt-2 text-sm text-[var(--muted)]">Isi data berikut untuk mulai menggunakan Competra.</p>
          </div>
          <RegisterForm />
        </div>
      </section>
    </main>
  );
}
