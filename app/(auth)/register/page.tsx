import { RegisterForm } from "@/components/register-form";

export default function RegisterPage() {
  return (
    <main className="grid min-h-screen lg:grid-cols-[minmax(0,0.9fr)_minmax(520px,1.1fr)]">
      <section
        aria-label="Tentang akun siswa Competra"
        className="hidden bg-[var(--foreground)] px-12 py-16 text-white lg:flex lg:flex-col lg:justify-between"
      >
        <p className="text-lg font-bold tracking-[-0.02em]">Competra</p>
        <div className="max-w-xl">
          <p className="text-[32px] font-bold leading-10">Mulai petakan kesiapan kompetensi praktik Anda.</p>
          <p className="mt-5 max-w-lg text-sm leading-6 text-slate-300">
            Akun yang dibuat melalui halaman ini selalu menjadi akun siswa. Akun guru disediakan secara terkontrol oleh pengelola.
          </p>
        </div>
        <p className="text-xs text-slate-400">MVP Peta Kompetensi SMK</p>
      </section>

      <section aria-labelledby="register-title" className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <p className="text-lg font-bold">Competra</p>
            <p className="mt-1 text-sm text-[var(--muted)]">Pendaftaran khusus akun siswa.</p>
          </div>
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
