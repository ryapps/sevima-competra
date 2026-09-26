import Link from "next/link";

import { ArrowRightIcon } from "@/components/icons";

export default function UnauthorizedPage() {
  return <main className="mx-auto flex min-h-screen max-w-xl items-center px-4 py-16"><section className="w-full border-l-2 border-[var(--destructive)] pl-5"><p className="text-sm font-semibold text-[var(--destructive)]">Akses dibatasi</p><h1 className="mt-2 text-2xl font-bold tracking-[-0.02em]">Halaman ini bukan untuk peran Anda</h1><p className="mt-2 text-[var(--muted)]">Akun Anda tidak memiliki izin untuk membuka halaman ini.</p><Link className="mt-6 inline-flex h-11 items-center gap-1 font-semibold text-[var(--primary)] hover:underline" href="/">Kembali ke halaman utama <ArrowRightIcon className="size-4" /></Link></section></main>;
}
