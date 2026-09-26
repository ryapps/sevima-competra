import type { ReactNode } from "react";
import { signOut } from "@/app/actions/auth";
import { requireProfile } from "@/lib/auth";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const profile = await requireProfile();
  return <><header className="border-b bg-white"><div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3"><span className="font-semibold">Competra</span><div className="flex items-center gap-3 text-sm"><span>{profile.name} · {profile.role === "teacher" ? "Guru" : "Siswa"}</span><form action={signOut}><button className="text-blue-700">Keluar</button></form></div></div></header>{children}</>;
}
