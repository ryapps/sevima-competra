"use client";

import { useActionState, useState } from "react";

import { type AssessmentState, upsertAssessment } from "@/app/actions/assessments";
import { Button, InlineAlert, InputField, SelectField, StatusBadge, TextareaField } from "@/components/ui";

type StudentOption = { id: string; name: string };
type CompetencyOption = { id: string; name: string; target: number };
type AssessmentValue = { id: string; studentId: string; competencyId: string; score: number; note: string };

type AssessmentFormProps = {
  students: StudentOption[];
  competencies: CompetencyOption[];
  assessments: AssessmentValue[];
};

const initialState: AssessmentState = {};

function assessmentKey(studentId: string, competencyId: string) {
  return `${studentId}:${competencyId}`;
}

export function AssessmentForm({ students, competencies, assessments }: AssessmentFormProps) {
  const initialStudentId = students[0]?.id ?? "";
  const initialCompetencyId = competencies[0]?.id ?? "";
  const initialAssessment = assessments.find(
    (item) => item.studentId === initialStudentId && item.competencyId === initialCompetencyId,
  );
  const [state, formAction, pending] = useActionState(upsertAssessment, initialState);
  const [studentId, setStudentId] = useState(initialStudentId);
  const [competencyId, setCompetencyId] = useState(initialCompetencyId);
  const [score, setScore] = useState(initialAssessment ? String(initialAssessment.score) : "");
  const [note, setNote] = useState(initialAssessment?.note ?? "");

  const savedAssessment = state.assessment;
  const assessmentMap = new Map(assessments.map((item) => [assessmentKey(item.studentId, item.competencyId), item]));
  if (savedAssessment) assessmentMap.set(assessmentKey(savedAssessment.studentId, savedAssessment.competencyId), savedAssessment);

  const selectedCompetency = competencies.find((item) => item.id === competencyId);
  const currentAssessment = assessmentMap.get(assessmentKey(studentId, competencyId));
  const status = currentAssessment
    ? currentAssessment.score >= (selectedCompetency?.target ?? 0) ? "competent" : "gap"
    : "unassessed";

  function loadAssessment(nextStudentId: string, nextCompetencyId: string) {
    const nextAssessment = assessmentMap.get(assessmentKey(nextStudentId, nextCompetencyId));
    setScore(nextAssessment ? String(nextAssessment.score) : "");
    setNote(nextAssessment?.note ?? "");
  }

  function changeStudent(nextStudentId: string) {
    setStudentId(nextStudentId);
    loadAssessment(nextStudentId, competencyId);
  }

  function changeCompetency(nextCompetencyId: string) {
    setCompetencyId(nextCompetencyId);
    loadAssessment(studentId, nextCompetencyId);
  }

  return (
    <form action={formAction} className="grid gap-6" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          error={state.fieldErrors?.studentId}
          disabled={pending}
          id="studentId"
          label="Siswa"
          name="studentId"
          onChange={(event) => changeStudent(event.target.value)}
          options={students.map((item) => ({ label: item.name, value: item.id }))}
          required
          value={studentId}
        />
        <SelectField
          error={state.fieldErrors?.competencyId}
          disabled={pending}
          id="competencyId"
          label="Kompetensi"
          name="competencyId"
          onChange={(event) => changeCompetency(event.target.value)}
          options={competencies.map((item) => ({ label: item.name, value: item.id }))}
          required
          value={competencyId}
        />
      </div>

      <section className="rounded-[var(--radius-medium)] border border-[var(--border)] bg-slate-50 px-4 py-4" aria-label="Konteks penilaian">
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div><dt className="text-xs text-[var(--muted)]">Target industri</dt><dd className="mt-1 font-semibold tabular-nums">{selectedCompetency?.target ?? "—"}</dd></div>
          <div><dt className="text-xs text-[var(--muted)]">Nilai saat ini</dt><dd className="mt-1 font-semibold tabular-nums">{currentAssessment?.score ?? "—"}</dd></div>
          <div className="col-span-2 sm:col-span-1"><dt className="mb-1 text-xs text-[var(--muted)]">Status</dt><dd><StatusBadge status={status} /></dd></div>
        </dl>
      </section>

      {state.message ? <InlineAlert variant={state.ok ? "success" : "error"}>{state.message}</InlineAlert> : null}
      <InlineAlert variant="info">Nilai baru akan menggantikan penilaian aktif untuk pasangan siswa dan kompetensi ini.</InlineAlert>
      <InputField
        error={state.fieldErrors?.score}
        disabled={pending}
        helper="Masukkan bilangan bulat dari 0 sampai 100."
        id="score"
        inputMode="numeric"
        label="Nilai"
        max={100}
        min={0}
        name="score"
        onChange={(event) => setScore(event.target.value)}
        placeholder="Contoh: 85"
        required
        step={1}
        type="number"
        value={score}
      />
      <TextareaField
        error={state.fieldErrors?.note}
        disabled={pending}
        helper="Opsional, maksimal 500 karakter."
        id="note"
        label="Catatan guru"
        maxLength={500}
        name="note"
        onChange={(event) => setNote(event.target.value)}
        placeholder="Tuliskan konteks atau fokus perbaikan…"
        value={note}
      />
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button
          disabled={pending}
          onClick={() => {
            setScore(currentAssessment ? String(currentAssessment.score) : "");
            setNote(currentAssessment?.note ?? "");
          }}
          type="button"
          variant="secondary"
        >
          Kembalikan
        </Button>
        <Button className="sm:w-auto" loading={pending} size="mobile" type="submit">Simpan penilaian</Button>
      </div>
    </form>
  );
}
