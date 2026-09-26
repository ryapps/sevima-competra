export type RoleRequirement = { competencyId: string; name: string; target: number; practice: string };
export type EvidenceScore = { competencyId: string; score: number; submissionId: string | null };

/** Missing evidence contributes no attainment; it is never labelled a proven skill gap. */
export function deriveRoleReadiness(requirements: RoleRequirement[], assessments: EvidenceScore[]) {
  const scores = new Map(assessments.filter((item) => item.submissionId !== null).map((item) => [item.competencyId, item]));
  const skills = requirements.map((item) => {
    const assessment = scores.get(item.competencyId);
    const score = assessment?.score ?? null;
    const attainment = score === null ? 0 : Math.min(Math.max(score, 0) / item.target, 1);
    return { ...item, score, submissionId: assessment?.submissionId ?? null, attainment, gap: score === null ? null : Math.max(item.target - score, 0) };
  });
  const assessed = skills.filter((item) => item.score !== null).length;
  const fulfilled = skills.filter((item) => item.score !== null && item.score >= item.target).length;
  const total = skills.length;
  const percentage = total === 0 || assessed === 0 ? null : Math.round(skills.reduce((sum, item) => sum + item.attainment, 0) / total * 100);
  const priorities = skills.filter((item) => item.attainment < 1).sort((a, b) => a.attainment - b.attainment || a.name.localeCompare(b.name, "id")).slice(0, 3);
  return { skills, assessed, fulfilled, total, percentage, priorities, coverage: total ? Math.round(assessed / total * 100) : 0 };
}
