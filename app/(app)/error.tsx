"use client";

import { Screen } from "@/components/screen";
import { Button } from "@/components/ui";

export default function AppError({ reset }: { reset: () => void }) {
  return <Screen><section className="mx-auto max-w-lg py-12 text-center"><h1 className="text-xl font-semibold">Halaman belum dapat diproses</h1><p className="mt-3 text-sm leading-6 text-[var(--muted)]">Data yang tersimpan tetap tersedia. Coba muat ulang; jika masalah berlanjut, hubungi pengelola.</p><Button className="mt-5" onClick={reset}>Coba lagi</Button></section></Screen>;
}
