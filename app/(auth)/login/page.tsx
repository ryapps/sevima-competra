import { signIn } from "@/app/actions/auth";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-4 py-12">
      <section className="w-full space-y-6" aria-labelledby="login-title">
        <div><p className="text-sm font-semibold text-blue-700">Competra</p><h1 id="login-title" className="text-2xl font-bold">Masuk</h1><p className="mt-2 text-sm text-slate-600">Pantau kesiapan kompetensi praktik berbasis bukti.</p></div>
        {error ? <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
        <form action={signIn} className="space-y-4">
          <label className="block text-sm font-medium">Email<input name="email" type="email" autoComplete="email" required className="mt-2 h-10 w-full rounded-lg border border-slate-300 bg-white px-3" /></label>
          <label className="block text-sm font-medium">Kata sandi<input name="password" type="password" autoComplete="current-password" required className="mt-2 h-10 w-full rounded-lg border border-slate-300 bg-white px-3" /></label>
          <button className="h-10 w-full rounded-lg bg-blue-700 px-4 font-semibold text-white">Masuk</button>
        </form>
      </section>
    </main>
  );
}
