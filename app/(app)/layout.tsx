import type { ReactNode } from "react";

import { signOut } from "@/app/actions/auth";
import { AppNavigation } from "@/components/app-navigation";
import { Button } from "@/components/ui";
import { requireProfile } from "@/lib/auth";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const profile = await requireProfile();
  const roleLabel = profile.role === "teacher" ? "Guru" : "Siswa";

  return (
    <div className="min-h-screen md:grid md:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-screen border-r border-[var(--border)] bg-[var(--surface)] md:flex md:flex-col">
        <div className="border-b border-[var(--border)] px-6 py-5">
          <p className="text-lg font-bold tracking-[-0.02em]">Competra</p>
          <p className="mt-0.5 text-xs text-[var(--muted)]">Peta kompetensi praktik</p>
        </div>
        <div className="flex-1 px-3 py-5">
          <AppNavigation role={profile.role} />
        </div>
        <div className="border-t border-[var(--border)] p-4">
          <p className="truncate text-sm font-medium">{profile.name}</p>
          <p className="mb-3 text-xs text-[var(--muted)]">{roleLabel}</p>
          <form action={signOut}>
            <Button className="w-full" size="small" type="submit" variant="secondary">Keluar</Button>
          </form>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-white/95 backdrop-blur md:hidden">
          <div className="flex h-14 items-center justify-between px-4">
            <div><p className="font-bold">Competra</p><p className="text-[11px] text-[var(--muted)]">{profile.name} · {roleLabel}</p></div>
            <form action={signOut}><button className="h-11 px-2 text-sm font-semibold text-[var(--primary)]">Keluar</button></form>
          </div>
          <div className="border-t border-[var(--border)] px-3 py-2"><AppNavigation role={profile.role} /></div>
        </header>
        {children}
      </div>
    </div>
  );
}
