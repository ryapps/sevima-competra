"use server";

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

// Compatibility for already-open legacy forms; direct grading is no longer allowed.
export async function upsertAssessment(previousState: AssessmentState, formData: FormData): Promise<AssessmentState> {
  void previousState;
  void formData;
  return { ok: false, code: "WORKFLOW_UPDATED", message: "Penilaian kini dilakukan melalui review bukti pada menu Tugas & penilaian. Muat ulang halaman." };
}
