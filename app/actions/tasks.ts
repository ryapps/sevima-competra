"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type TaskFormState = {
  message?: string;
  ok?: boolean;
  values: Record<string, string>;
  competencyIds: string[];
  revision: number;
};

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const value = (form: FormData, key: string) => String(form.get(key) ?? "").trim();

async function authorizedClient(role: "student" | "teacher") {
  const client = await createClient();
  const { data } = await client.auth.getClaims();
  if (!data?.claims?.sub) return null;
  const { data: profile } = await client.from("profiles").select("role").eq("id", data.claims.sub).single();
  return profile?.role === role ? client : null;
}

function refreshWorkflow() {
  for (const path of ["/tasks", "/teacher/assessment", "/dashboard", "/competencies", "/portfolio"]) revalidatePath(path);
}

export async function publishTask(previous: TaskFormState, form: FormData): Promise<TaskFormState> {
  const values = Object.fromEntries(["title", "instructions", "criteria"].map((key) => [key, value(form, key)]));
  const competencyIds = [...new Set(form.getAll("competencyIds").map(String))];
  const state = { values, competencyIds, revision: previous.revision + 1 };
  if (!values.title || values.title.length > 120 || !values.instructions || values.instructions.length > 4000 || !values.criteria || values.criteria.length > 1000 || competencyIds.length < 1 || competencyIds.length > 20 || competencyIds.some((id) => !uuid.test(id))) {
    return { ...state, message: "Lengkapi judul, instruksi, kriteria penilaian, dan 1–20 kompetensi." };
  }
  const client = await authorizedClient("teacher");
  if (!client) return { ...state, message: "Sesi guru diperlukan. Silakan masuk kembali." };
  const { data, error } = await client.rpc("publish_assessment_task", {
    p_title: values.title, p_instructions: values.instructions,
    p_criteria: values.criteria, p_competency_ids: competencyIds,
  });
  if (error || !data) {
    console.error("publishTask failed", { code: error?.code });
    return { ...state, message: "Tugas belum dapat diterbitkan. Periksa kompetensi dan coba lagi." };
  }
  refreshWorkflow();
  redirect(`/tasks/${data}`);
}

export async function submitPortfolio(taskId: string, previous: TaskFormState, form: FormData): Promise<TaskFormState> {
  const portfolioId = value(form, "portfolioId");
  const state = { values: { portfolioId }, competencyIds: [], revision: previous.revision + 1 };
  if (!uuid.test(taskId) || !uuid.test(portfolioId)) return { ...state, message: "Pilih proyek portofolio yang akan dikirim." };
  const client = await authorizedClient("student");
  if (!client) return { ...state, message: "Sesi siswa diperlukan. Silakan masuk kembali." };
  const { data, error } = await client.rpc("submit_portfolio", { p_task_id: taskId, p_portfolio_id: portfolioId });
  if (error || !data) {
    console.error("submitPortfolio failed", { code: error?.code });
    return { ...state, message: error?.code === "23505" ? "Anda sudah mengirim bukti untuk tugas ini. Muat ulang halaman untuk melihat kiriman." : "Bukti belum dapat dikirim. Pastikan proyek milik Anda memiliki tautan http/https yang valid (maksimal 2048 karakter)." };
  }
  refreshWorkflow();
  revalidatePath(`/tasks/${taskId}`);
  redirect(`/submissions/${data}`);
}

export async function publishReview(submissionId: string, previous: TaskFormState, form: FormData): Promise<TaskFormState> {
  const values: Record<string, string> = {};
  // Preserve input on recoverable errors, but never use client IDs to decide which scores are required.
  for (const [key, item] of form.entries()) if (/^(score|note):/.test(key) && typeof item === "string") values[key] = item.trim();
  const state = { values, competencyIds: [], revision: previous.revision + 1 };
  if (!uuid.test(submissionId)) return { ...state, message: "Kiriman tidak valid." };
  const client = await authorizedClient("teacher");
  if (!client) return { ...state, message: "Sesi guru diperlukan. Silakan masuk kembali." };
  const { data: submission, error: submissionError } = await client.from("submissions").select("task_id").eq("id", submissionId).single();
  if (submissionError || !submission) return { ...state, message: "Kiriman tidak tersedia atau bukan tugas Anda." };
  const { data: criteria, error: criteriaError } = await client.from("task_competencies").select("competency_id").eq("task_id", submission.task_id);
  if (criteriaError || !criteria?.length) return { ...state, message: "Kriteria penilaian belum dapat dimuat. Coba lagi." };
  const scores = criteria.map((item) => ({ competency_id: item.competency_id, score: Number(values[`score:${item.competency_id}`]), note: values[`note:${item.competency_id}`] ?? "" }));
  if (scores.some((item) => !/^\d{1,3}$/.test(values[`score:${item.competency_id}`] ?? "") || !Number.isInteger(item.score) || item.score < 0 || item.score > 100 || item.note.length > 500)) {
    return { ...state, message: "Isi seluruh nilai dengan bilangan bulat 0–100. Catatan maksimal 500 karakter." };
  }
  const { error } = await client.rpc("publish_submission_review", { p_submission_id: submissionId, p_scores: scores });
  if (error) {
    console.error("publishReview failed", { code: error.code });
    return { ...state, message: error.code === "23514" ? "Penilaian sudah diterbitkan dan dikunci. Muat ulang untuk melihat hasil." : "Penilaian belum dapat disimpan. Data tetap tersedia untuk dicoba kembali." };
  }
  refreshWorkflow();
  revalidatePath(`/tasks/${submission.task_id}`);
  revalidatePath(`/submissions/${submissionId}`);
  return { ...state, ok: true, message: "Penilaian diterbitkan. Profil kompetensi dan kesiapan role siswa diperbarui." };
}
