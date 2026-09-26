"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

type PortfolioField = "title" | "description" | "projectUrl" | "evidenceUrl" | "competencyIds";

export type PortfolioValues = {
  title: string;
  description: string;
  projectUrl: string;
  evidenceUrl: string;
  competencyIds: string[];
};

export type SavedPortfolio = {
  id: string;
  title: string;
  description: string;
  projectUrl: string;
  evidenceUrl: string;
  competencyIds: string[];
  createdAt: string;
};

export type PortfolioState = {
  ok?: boolean;
  code?: string;
  message?: string;
  fieldErrors?: Partial<Record<PortfolioField, string>>;
  values: PortfolioValues;
  revision: number;
  portfolio?: SavedPortfolio;
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return (url.protocol === "http:" || url.protocol === "https:") && Boolean(url.hostname);
  } catch {
    return false;
  }
}

export async function createPortfolio(
  previousState: PortfolioState,
  formData: FormData,
): Promise<PortfolioState> {
  const values: PortfolioValues = {
    title: String(formData.get("title") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    projectUrl: String(formData.get("projectUrl") ?? "").trim(),
    evidenceUrl: String(formData.get("evidenceUrl") ?? "").trim(),
    competencyIds: [...new Set(
      formData
        .getAll("competencyIds")
        .map((value) => String(value).trim())
        .filter(Boolean),
    )],
  };
  const revision = previousState.revision + 1;
  const fieldErrors: PortfolioState["fieldErrors"] = {};

  if (values.title.length < 1 || values.title.length > 120) {
    fieldErrors.title = "Judul harus terdiri dari 1–120 karakter.";
  }
  if (values.description.length > 1000) {
    fieldErrors.description = "Deskripsi maksimal 1000 karakter.";
  }
  if (!values.projectUrl && !values.evidenceUrl) {
    fieldErrors.projectUrl = "Isi minimal satu URL proyek atau URL bukti.";
  }
  if (values.projectUrl && !isHttpUrl(values.projectUrl)) {
    fieldErrors.projectUrl = "URL proyek harus diawali http:// atau https://.";
  }
  if (values.evidenceUrl && !isHttpUrl(values.evidenceUrl)) {
    fieldErrors.evidenceUrl = "URL bukti harus diawali http:// atau https://.";
  }
  if (values.competencyIds.length === 0) {
    fieldErrors.competencyIds = "Pilih minimal satu kompetensi.";
  } else if (values.competencyIds.some((id) => !uuidPattern.test(id))) {
    fieldErrors.competencyIds = "Pilihan kompetensi tidak valid.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      code: "VALIDATION_ERROR",
      message: "Periksa kembali data proyek.",
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

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (profileError || profile?.role !== "student") {
    return {
      ok: false,
      code: "FORBIDDEN",
      message: "Hanya siswa yang dapat menyimpan portofolio.",
      values,
      revision,
    };
  }

  const { data: competencies, error: competenciesError } = await supabase
    .from("competencies")
    .select("id")
    .in("id", values.competencyIds);

  if (competenciesError) {
    console.error("createPortfolio competency lookup failed", { code: competenciesError.code });
    return {
      ok: false,
      code: "PERSISTENCE_ERROR",
      message: "Portofolio belum dapat disimpan. Coba lagi.",
      values,
      revision,
    };
  }

  if ((competencies ?? []).length !== values.competencyIds.length) {
    return {
      ok: false,
      code: "COMPETENCY_NOT_FOUND",
      message: "Salah satu kompetensi sudah tidak tersedia.",
      fieldErrors: { competencyIds: "Pilih ulang kompetensi yang masih tersedia." },
      values,
      revision,
    };
  }

  const { data: portfolio, error: portfolioError } = await supabase
    .from("portfolios")
    .insert({
      student_id: userId,
      title: values.title,
      description: values.description || null,
      project_url: values.projectUrl || null,
      evidence_url: values.evidenceUrl || null,
    })
    .select("id,title,description,project_url,evidence_url,created_at")
    .single();

  if (portfolioError || !portfolio) {
    console.error("createPortfolio insert failed", { code: portfolioError?.code });
    return {
      ok: false,
      code: "PERSISTENCE_ERROR",
      message: "Portofolio belum dapat disimpan. Coba lagi.",
      values,
      revision,
    };
  }

  const { error: relationshipError } = await supabase
    .from("portfolio_competencies")
    .insert(values.competencyIds.map((competencyId) => ({
      portfolio_id: portfolio.id,
      competency_id: competencyId,
    })));

  if (relationshipError) {
    const { error: rollbackError } = await supabase
      .from("portfolios")
      .delete()
      .eq("id", portfolio.id)
      .eq("student_id", userId);
    console.error("createPortfolio relationship failed", {
      code: relationshipError.code,
      rollbackCode: rollbackError?.code,
    });
    return {
      ok: false,
      code: "PERSISTENCE_ERROR",
      message: "Portofolio belum dapat disimpan. Coba lagi.",
      values,
      revision,
    };
  }

  revalidatePath("/portfolio");
  revalidatePath("/dashboard");

  return {
    ok: true,
    message: "Proyek berhasil disimpan ke portofolio.",
    values: { title: "", description: "", projectUrl: "", evidenceUrl: "", competencyIds: [] },
    revision,
    portfolio: {
      id: portfolio.id,
      title: portfolio.title,
      description: portfolio.description ?? "",
      projectUrl: portfolio.project_url ?? "",
      evidenceUrl: portfolio.evidence_url ?? "",
      competencyIds: values.competencyIds,
      createdAt: portfolio.created_at,
    },
  };
}
