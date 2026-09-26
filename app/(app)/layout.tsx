import type { ReactNode } from "react";

import { signOut } from "@/app/actions/auth";
import { AppNavigation } from "@/components/app-navigation";
import { SignOutIcon } from "@/components/icons";
import { Button } from "@/components/ui";
import { requireProfile } from "@/lib/auth";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const profile = await requireProfile();
  const roleLabel = profile.role === "teacher" ? "Guru" : "Siswa";

  return (
    <div className="min-h-screen md:grid md:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-screen border-r border-[var(--border)] bg-[var(--surface)] md:flex md:flex-col">
        <div className="px-5 pb-4 pt-6">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-[var(--radius-medium)] bg-[var(--foreground)] text-sm font-bold text-white">C</span>
            <div><p className="font-bold tracking-[-0.02em]">Competra</p><p className="text-[11px] text-[var(--muted)]">Peta kompetensi praktik</p></div>
          </div>
        </div>
        <div className="flex-1 px-3 py-3">
          <p className="mb-2 px-3 text-[11px] font-medium text-[var(--muted)]">Menu utama</p>
          <AppNavigation role={profile.role} />
        </div>
        <div className="m-3 rounded-[var(--radius-medium)] border border-[var(--border)] bg-slate-50 p-3">
          <div className="mb-3 flex items-center gap-3">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-slate-200 text-xs font-bold text-slate-700">{profile.name.slice(0, 1).toUpperCase()}</span>
            <div className="min-w-0"><p className="truncate text-sm font-medium">{profile.name}</p><p className="text-xs text-[var(--muted)]">{roleLabel}</p></div>
          </div>
          <form action={signOut}>
            <Button className="w-full" size="small" type="submit" variant="secondary"><SignOutIcon className="size-4" />Keluar</Button>
          </form>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-white/95 backdrop-blur md:hidden">
          <div className="flex h-14 items-center justify-between px-4">
            <div className="flex items-center gap-2.5"><span className="grid size-8 place-items-center rounded-[var(--radius-medium)] bg-[var(--foreground)] text-xs font-bold text-white">C</span><div><p className="font-bold">Competra</p><p className="text-[11px] text-[var(--muted)]">{profile.name} · {roleLabel}</p></div></div>
            <form action={signOut}><button className="h-11 px-2 text-sm font-semibold text-[var(--primary)]">Keluar</button></form>
          </div>
        </header>
        <div className="pb-20 md:pb-0">{children}</div>
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[var(--border)] bg-white/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1.5 backdrop-blur md:hidden">
          <AppNavigation mobile role={profile.role} />
        </div>
      </div>
    </div>
  );
}
