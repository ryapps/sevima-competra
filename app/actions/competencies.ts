"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

type CompetencyField = "id" | "name" | "description" | "industryTarget";

export type CompetencyValues = {
  id: string;
  name: string;
  description: string;
  industryTarget: string;
};

export type SavedCompetency = {
  id: string;
  name: string;
  description: string;
  industryTarget: number;
};

export type CompetencyState = {
  ok?: boolean;
  code?: string;
  message?: string;
  fieldErrors?: Partial<Record<CompetencyField, string>>;
  values: CompetencyValues;
  revision: number;
  competency?: SavedCompetency;
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const emptyValues: CompetencyValues = { id: "", name: "", description: "", industryTarget: "" };

export async function saveCompetency(
  previousState: CompetencyState,
  formData: FormData,
): Promise<CompetencyState> {
  const values: CompetencyValues = {
    id: String(formData.get("id") ?? "").trim(),
    name: String(formData.get("name") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    industryTarget: String(formData.get("industryTarget") ?? "").trim(),
  };
  const revision = previousState.revision + 1;
  const fieldErrors: CompetencyState["fieldErrors"] = {};

  if (values.id && !uuidPattern.test(values.id)) {
    fieldErrors.id = "Kompetensi yang dipilih tidak valid.";
  }
  if (values.name.length < 1 || values.name.length > 100) {
    fieldErrors.name = "Nama harus terdiri dari 1–100 karakter.";
  }
  if (values.description.length > 500) {
    fieldErrors.description = "Deskripsi maksimal 500 karakter.";
  }

  const industryTarget = /^\d+$/.test(values.industryTarget)
    ? Number(values.industryTarget)
    : Number.NaN;
  if (!Number.isInteger(industryTarget) || industryTarget < 0 || industryTarget > 100) {
    fieldErrors.industryTarget = "Target harus berupa bilangan bulat dari 0 sampai 100.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      code: "VALIDATION_ERROR",
      message: "Periksa kembali data kompetensi.",
      fieldErrors,
      values,
      revision,
    };
  }

  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (!userId) {
    return {
      ok: false,
      code: "UNAUTHENTICATED",
      message: "Sesi Anda berakhir. Silakan masuk kembali.",
      values,
      revision,
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();
  if (profile?.role !== "teacher") {
    return {
      ok: false,
      code: "FORBIDDEN",
      message: "Hanya guru yang dapat mengelola kompetensi.",
      values,
      revision,
    };
  }

  const { data: existingCompetencies, error: lookupError } = await supabase
    .from("competencies")
    .select("id,name");
  if (lookupError) {
    console.error("saveCompetency duplicate lookup failed", { code: lookupError.code });
    return {
      ok: false,
      code: "PERSISTENCE_ERROR",
      message: "Kompetensi belum dapat disimpan. Coba lagi.",
      values,
      revision,
    };
  }

  const duplicate = (existingCompetencies ?? []).find((item) => (
    item.id !== values.id
    && item.name.localeCompare(values.name, "id", { sensitivity: "base" }) === 0
  ));
  if (duplicate) {
    return {
      ok: false,
      code: "DUPLICATE_NAME",
      message: "Nama kompetensi sudah digunakan.",
      fieldErrors: { name: "Gunakan nama kompetensi yang berbeda." },
      values,
      revision,
    };
  }

  const payload = {
    name: values.name,
    description: values.description || null,
    industry_target: industryTarget,
  };
  const result = values.id
    ? await supabase
        .from("competencies")
        .update(payload)
        .eq("id", values.id)
        .select("id,name,description,industry_target")
        .maybeSingle()
    : await supabase
        .from("competencies")
        .insert(payload)
        .select("id,name,description,industry_target")
        .single();

  if (result.error?.code === "23505") {
    return {
      ok: false,
      code: "DUPLICATE_NAME",
      message: "Nama kompetensi sudah digunakan.",
      fieldErrors: { name: "Gunakan nama kompetensi yang berbeda." },
      values,
      revision,
    };
  }
  if (result.error) {
    console.error("saveCompetency persistence failed", { code: result.error.code });
    return {
      ok: false,
      code: "PERSISTENCE_ERROR",
      message: "Kompetensi belum dapat disimpan. Coba lagi.",
      values,
      revision,
    };
  }
  if (!result.data) {
    return {
      ok: false,
      code: "NOT_FOUND",
      message: "Kompetensi tidak ditemukan.",
      fieldErrors: { id: "Pilih kompetensi yang masih tersedia." },
      values,
      revision,
    };
  }

  revalidatePath("/competencies");
  revalidatePath("/dashboard");
  revalidatePath("/teacher/assessment");
  revalidatePath("/portfolio");

  const saved: SavedCompetency = {
    id: result.data.id,
    name: result.data.name,
    description: result.data.description ?? "",
    industryTarget: result.data.industry_target,
  };

  return {
    ok: true,
    message: values.id ? "Perubahan kompetensi berhasil disimpan." : "Kompetensi berhasil ditambahkan.",
    values: values.id
      ? {
          id: saved.id,
          name: saved.name,
          description: saved.description,
          industryTarget: String(saved.industryTarget),
        }
      : emptyValues,
    revision,
    competency: saved,
  };
}
