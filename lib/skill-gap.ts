import type { CompetencyStatus } from "@/components/ui";

export type CompetencySource = {
  id: string;
  name: string;
  description: string | null;
  target: number;
};

export type AssessmentSource = {
  competencyId: string;
  score: number;
  note: string | null;
};

export type CompetencyView = CompetencySource & {
  score: number | null;
  note: string;
  status: CompetencyStatus;
  gap: number;
};

export function deriveCompetencies(
  competencies: CompetencySource[],
  assessments: AssessmentSource[],
): CompetencyView[] {
  const assessmentByCompetency = new Map(assessments.map((item) => [item.competencyId, item]));

  return competencies.map((competency) => {
    const assessment = assessmentByCompetency.get(competency.id);
    const score = assessment?.score ?? null;
    const status: CompetencyStatus = score === null
      ? "unassessed"
      : score >= competency.target ? "competent" : "gap";

    return {
      ...competency,
      score,
      note: assessment?.note ?? "",
      status,
      gap: score === null ? 0 : Math.max(competency.target - score, 0),
    };
  });
}

export function summarizeReadiness(competencies: CompetencyView[]) {
  const competent = competencies.filter((item) => item.status === "competent").length;
  const gap = competencies.filter((item) => item.status === "gap").length;
  const unassessed = competencies.filter((item) => item.status === "unassessed").length;
  const total = competencies.length;
  const skillMatch = total === 0 ? 0 : Math.round((competent / total) * 100);
  const priorityGaps = competencies
    .filter((item) => item.status === "gap")
    .sort((left, right) => right.gap - left.gap || left.name.localeCompare(right.name, "id"));

  return { skillMatch, counts: { competent, gap, unassessed, total }, priorityGaps };
}
