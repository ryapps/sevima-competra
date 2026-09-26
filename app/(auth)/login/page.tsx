import { signIn } from "@/app/actions/auth";
import { ArrowRightIcon } from "@/components/icons";
import { PasswordField } from "@/components/password-field";
import { Button, InlineAlert, InputField } from "@/components/ui";
import Link from "next/link";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; success?: string }> }) {
  const { error, success } = await searchParams;
  return (
    <main className="grid min-h-screen lg:grid-cols-[minmax(0,0.9fr)_minmax(520px,1.1fr)]">
      <section className="hidden bg-[var(--foreground)] px-12 py-12 text-white lg:flex lg:flex-col lg:justify-between" aria-label="Tentang Competra">
        <div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-[var(--radius-medium)] bg-white text-sm font-bold text-[var(--foreground)]">C</span><p className="text-lg font-bold tracking-[-0.02em]">Competra</p></div>
        <div className="max-w-xl">
          <p className="text-[34px] font-bold leading-[1.2] tracking-[-0.03em]">Dari nilai praktik menjadi langkah belajar berikutnya.</p>
          <p className="mt-5 max-w-lg text-sm leading-6 text-slate-300">Guru mencatat penilaian dalam konteks target industri. Siswa melihat prioritas gap dan menyertakan bukti proyeknya.</p>
          <ul className="mt-8 grid gap-3 text-sm text-slate-200">
            <li className="flex gap-3"><span className="text-blue-300">01</span> Nilai dibandingkan langsung dengan target.</li>
            <li className="flex gap-3"><span className="text-blue-300">02</span> Prioritas perbaikan terlihat dalam satu scan.</li>
            <li className="flex gap-3"><span className="text-blue-300">03</span> Proyek menjadi bukti kompetensi.</li>
          </ul>
        </div>
        <p className="text-xs text-slate-400">MVP Competra</p>
      </section>

      <section className="flex items-center justify-center px-4 py-10 sm:px-8" aria-labelledby="login-title">
        <div className="w-full max-w-md">
          <div className="mb-10 flex items-center gap-3 lg:hidden"><span className="grid size-9 place-items-center rounded-[var(--radius-medium)] bg-[var(--foreground)] text-sm font-bold text-white">C</span><div><p className="font-bold">Competra</p><p className="text-xs text-[var(--muted)]">Peta kompetensi praktik</p></div></div>
          <div><p className="text-xs font-medium text-[var(--primary)]">Selamat datang</p><h1 className="mt-1 text-2xl font-bold leading-8" id="login-title">Masuk ke akun Anda</h1><p className="mt-2 text-sm text-[var(--muted)]">Gunakan akun Anda untuk melanjutkan.</p></div>
          <div className="mt-6">{error ? <InlineAlert variant="error">{error}</InlineAlert> : success ? <InlineAlert variant="success">{success}</InlineAlert> : null}</div>
          <form action={signIn} className="mt-6 grid gap-4">
            <InputField autoComplete="email" id="email" label="Email" name="email" placeholder="nama@sekolah.id" required type="email" />
            <PasswordField autoComplete="current-password" id="password" label="Kata sandi" name="password" required />
            <Button className="mt-2" size="mobile" type="submit">Masuk</Button>
          </form>
          <p className="mt-5 text-center text-sm text-[var(--muted)]">
            Belum punya akun?{" "}
            <Link className="inline-flex items-center gap-0.5 font-semibold text-[var(--primary)] hover:underline" href="/register">Daftar sebagai siswa <ArrowRightIcon className="size-4" /></Link>
          </p>
        </div>
      </section>
    </main>
  );
}
