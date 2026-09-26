"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

type AssessmentField = "studentId" | "competencyId" | "score" | "note";

export type SavedAssessment = {
  id: string;
  studentId: string;
  competencyId: string;
  score: number;
  note: string;
  updatedAt: string;
};

export type AssessmentState = {
  ok?: boolean;
  code?: string;
  message?: string;
  fieldErrors?: Partial<Record<AssessmentField, string>>;
  assessment?: SavedAssessment;
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function upsertAssessment(
  _previousState: AssessmentState,
  formData: FormData,
): Promise<AssessmentState> {
  const studentId = String(formData.get("studentId") ?? "").trim();
  const competencyId = String(formData.get("competencyId") ?? "").trim();
  const scoreInput = String(formData.get("score") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();
  const fieldErrors: AssessmentState["fieldErrors"] = {};

  if (!uuidPattern.test(studentId)) fieldErrors.studentId = "Pilih siswa yang valid.";
  if (!uuidPattern.test(competencyId)) fieldErrors.competencyId = "Pilih kompetensi yang valid.";

  const score = /^\d+$/.test(scoreInput) ? Number(scoreInput) : Number.NaN;
  if (!Number.isInteger(score) || score < 0 || score > 100) {
    fieldErrors.score = "Nilai harus berupa bilangan bulat dari 0 sampai 100.";
  }
  if (note.length > 500) fieldErrors.note = "Catatan maksimal 500 karakter.";

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, code: "VALIDATION_ERROR", message: "Periksa kembali data penilaian.", fieldErrors };
  }

  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (!userId) return { ok: false, code: "UNAUTHENTICATED", message: "Sesi Anda berakhir. Silakan masuk kembali." };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", userId).single();
  if (profile?.role !== "teacher") {
    return { ok: false, code: "FORBIDDEN", message: "Hanya guru yang dapat menyimpan penilaian." };
  }

  const [{ data: student }, { data: competency }] = await Promise.all([
    supabase.from("profiles").select("id").eq("id", studentId).eq("role", "student").maybeSingle(),
    supabase.from("competencies").select("id").eq("id", competencyId).maybeSingle(),
  ]);

  if (!student) {
    return {
      ok: false,
      code: "STUDENT_NOT_FOUND",
      message: "Siswa tidak ditemukan.",
      fieldErrors: { studentId: "Pilih siswa yang masih tersedia." },
    };
  }
  if (!competency) {
    return {
      ok: false,
      code: "COMPETENCY_NOT_FOUND",
      message: "Kompetensi tidak ditemukan.",
      fieldErrors: { competencyId: "Pilih kompetensi yang masih tersedia." },
    };
  }

  const { data: assessment, error } = await supabase
    .from("assessments")
    .upsert(
      { student_id: studentId, competency_id: competencyId, score, note: note || null },
      { onConflict: "student_id,competency_id" },
    )
    .select("id,student_id,competency_id,score,note,updated_at")
    .single();

  if (error || !assessment) {
    console.error("upsertAssessment failed", { code: error?.code });
    return { ok: false, code: "PERSISTENCE_ERROR", message: "Penilaian belum dapat disimpan. Coba lagi." };
  }

  revalidatePath("/teacher/assessment");
  revalidatePath("/dashboard");
  revalidatePath("/competencies");

  return {
    ok: true,
    message: "Penilaian berhasil disimpan.",
    assessment: {
      id: assessment.id,
      studentId: assessment.student_id,
      competencyId: assessment.competency_id,
      score: assessment.score,
      note: assessment.note ?? "",
      updatedAt: assessment.updated_at,
    },
  };
}
