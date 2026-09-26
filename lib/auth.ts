import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type AppRole = "teacher" | "student";

export async function requireProfile(role?: AppRole) {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (!userId) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id,name,role")
    .eq("id", userId)
    .single();

  if (!profile || (role && profile.role !== role)) redirect("/unauthorized");
  return profile as { id: string; name: string; role: AppRole };
}
