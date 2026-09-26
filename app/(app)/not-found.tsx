import Link from "next/link";
import { Screen } from "@/components/screen";

export default function NotFound() {
  return <Screen><section className="mx-auto max-w-lg py-12 text-center"><h1 className="text-xl font-semibold">Data tidak tersedia</h1><p className="mt-3 text-sm text-[var(--muted)]">Data tidak ditemukan atau akun Anda tidak memiliki akses.</p><Link className="mt-5 inline-flex min-h-11 items-center font-semibold text-[var(--primary)] hover:underline" href="/">Kembali ke halaman utama →</Link></section></Screen>;
}
