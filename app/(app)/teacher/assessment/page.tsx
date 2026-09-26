import { requireProfile } from "@/lib/auth";

export default async function AssessmentPage() {
  const profile = await requireProfile("teacher");
  return <main className="mx-auto max-w-6xl px-4 py-8"><h1 className="text-2xl font-bold">Penilaian</h1><p className="mt-2 text-slate-600">Selamat datang, {profile.name}.</p></main>;
}
