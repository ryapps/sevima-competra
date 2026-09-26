import { signIn } from "@/app/actions/auth";
import { Button, InlineAlert, InputField } from "@/components/ui";
import Link from "next/link";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; success?: string }> }) {
  const { error, success } = await searchParams;
  return (
    <main className="grid min-h-screen lg:grid-cols-[minmax(0,0.9fr)_minmax(520px,1.1fr)]">
      <section className="hidden bg-[var(--foreground)] px-12 py-16 text-white lg:flex lg:flex-col lg:justify-between" aria-label="Tentang Competra">
        <p className="text-lg font-bold tracking-[-0.02em]">Competra</p>
        <div className="max-w-xl">
          <p className="text-[32px] font-bold leading-10">Dari nilai praktik menjadi peta kesiapan yang dapat ditindaklanjuti.</p>
          <p className="mt-5 max-w-lg text-sm leading-6 text-slate-300">Guru mencatat penilaian dalam konteks target industri. Siswa melihat prioritas gap dan menyertakan bukti proyeknya.</p>
        </div>
        <p className="text-xs text-slate-400">MVP Peta Kompetensi SMK</p>
      </section>

      <section className="flex items-center justify-center px-4 py-10 sm:px-8" aria-labelledby="login-title">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden"><p className="text-lg font-bold">Competra</p><p className="mt-1 text-sm text-[var(--muted)]">Pantau kesiapan kompetensi praktik berbasis bukti.</p></div>
          <div><p className="text-xs font-medium text-[var(--primary)]">Selamat datang</p><h1 className="mt-1 text-2xl font-bold leading-8" id="login-title">Masuk ke akun Anda</h1><p className="mt-2 text-sm text-[var(--muted)]">Gunakan akun Anda untuk melanjutkan.</p></div>
          <div className="mt-6">{error ? <InlineAlert variant="error">{error}</InlineAlert> : success ? <InlineAlert variant="success">{success}</InlineAlert> : null}</div>
          <form action={signIn} className="mt-6 grid gap-4">
            <InputField autoComplete="email" id="email" label="Email" name="email" placeholder="nama@sekolah.id" required type="email" />
            <InputField autoComplete="current-password" id="password" label="Kata sandi" name="password" required type="password" />
            <Button className="mt-2" size="mobile" type="submit">Masuk</Button>
          </form>
          <p className="mt-5 text-center text-sm text-[var(--muted)]">
            Belum punya akun?{" "}
            <Link className="font-semibold text-[var(--primary)] hover:underline" href="/register">Daftar sebagai siswa</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
