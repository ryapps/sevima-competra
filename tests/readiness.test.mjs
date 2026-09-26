import assert from "node:assert/strict";
import test from "node:test";
import { deriveRoleReadiness } from "../lib/readiness.ts";

const requirement = (competencyId, target = 80, name = competencyId) => ({
  competencyId,
  name,
  target,
  practice: `Latih ${name}`,
});
const reviewed = (competencyId, score) => ({ competencyId, score, submissionId: `submission-${competencyId}` });
const benchmark = [requirement("html", 80), requirement("css", 80), requirement("js", 75), requirement("git", 70)];

test("empty benchmark has no readiness score, regardless of other assessments", () => {
  const result = deriveRoleReadiness([], [reviewed("html", 100)]);
  assert.deepEqual(result, { skills: [], assessed: 0, fulfilled: 0, total: 0, percentage: null, priorities: [], coverage: 0 });
});

test("no evidence means no score and no proven gap", () => {
  const result = deriveRoleReadiness([requirement("html")], []);
  assert.equal(result.percentage, null);
  assert.equal(result.assessed, 0);
  assert.equal(result.fulfilled, 0);
  assert.equal(result.coverage, 0);
  assert.equal(result.skills[0].score, null);
  assert.equal(result.skills[0].gap, null);
  assert.equal(result.priorities[0].submissionId, null);
  assert.equal(result.priorities[0].practice, "Latih html");
});

test("legacy direct grades cannot qualify as evidence", () => {
  const result = deriveRoleReadiness(benchmark, [{ competencyId: "html", score: 100, submissionId: null }]);
  assert.equal(result.percentage, null);
  assert.equal(result.coverage, 0);
  assert.equal(result.assessed, 0);
  assert.equal(result.skills[0].score, null);
});

test("a legacy score does not replace a reviewed score", () => {
  const result = deriveRoleReadiness([requirement("html")], [
    reviewed("html", 40),
    { competencyId: "html", score: 100, submissionId: null },
  ]);
  assert.equal(result.percentage, 50);
  assert.equal(result.skills[0].score, 40);
  assert.equal(result.skills[0].submissionId, "submission-html");
});

test("an assessed zero is real data, not an unassessed skill", () => {
  const result = deriveRoleReadiness([requirement("html"), requirement("css")], [reviewed("html", 0)]);
  assert.equal(result.percentage, 0);
  assert.equal(result.assessed, 1);
  assert.equal(result.coverage, 50);
  assert.equal(result.skills[0].score, 0);
  assert.equal(result.skills[0].gap, 80);
  assert.equal(result.skills[1].score, null);
  assert.equal(result.skills[1].gap, null);
});

test("capped ratios prevent a high score from compensating for missing evidence", () => {
  const result = deriveRoleReadiness([requirement("html", 20), requirement("css", 80)], [reviewed("html", 100)]);
  assert.equal(result.percentage, 50);
  assert.equal(result.skills[0].attainment, 1);
  assert.equal(result.skills[0].gap, 0);
  assert.equal(result.fulfilled, 1);
  assert.equal(result.total, 2);
});

test("unrelated assessed competencies do not inflate benchmark coverage", () => {
  const result = deriveRoleReadiness([requirement("html")], [reviewed("sql", 100)]);
  assert.equal(result.percentage, null);
  assert.equal(result.coverage, 0);
  assert.equal(result.assessed, 0);
  assert.equal(result.total, 1);
});

test("four-skill example rounds 62.5% to 63%, retaining the missing denominator", () => {
  const result = deriveRoleReadiness(benchmark, [reviewed("html", 80), reviewed("css", 40), reviewed("git", 70)]);
  assert.equal(result.percentage, 63);
  assert.equal(result.coverage, 75);
  assert.equal(result.assessed, 3);
  assert.equal(result.fulfilled, 2);
  assert.equal(result.total, 4);
  assert.deepEqual(result.priorities.map((item) => item.competencyId), ["js", "css"]);
  assert.equal(result.priorities[0].gap, null);
  assert.equal(result.priorities[1].gap, 40);
});

test("demo scores round 82.5% to 83% with complete evidence coverage", () => {
  const result = deriveRoleReadiness(benchmark, [reviewed("html", 80), reviewed("css", 40), reviewed("js", 60), reviewed("git", 70)]);
  assert.equal(result.percentage, 83);
  assert.equal(result.coverage, 100);
  assert.equal(result.assessed, 4);
  assert.equal(result.fulfilled, 2);
  assert.deepEqual(result.priorities.map((item) => item.competencyId), ["css", "js"]);
});

test("priorities use attainment ratio, not the absolute score gap", () => {
  const result = deriveRoleReadiness([requirement("small", 20), requirement("large", 100)], [reviewed("small", 0), reviewed("large", 70)]);
  assert.deepEqual(result.priorities.map((item) => item.competencyId), ["small", "large"]);
  assert.deepEqual(result.priorities.map((item) => item.gap), [20, 30]);
});

test("equal-priority ties use name order and the list is limited to three", () => {
  const result = deriveRoleReadiness([
    requirement("d", 80, "Dart"), requirement("c", 80, "CSS"),
    requirement("b", 80, "Basis Data"), requirement("a", 80, "Algoritma"),
  ], []);
  assert.deepEqual(result.priorities.map((item) => item.name), ["Algoritma", "Basis Data", "CSS"]);
});

test("coverage rounds to whole percentages independently from readiness", () => {
  const result = deriveRoleReadiness([requirement("a"), requirement("b"), requirement("c")], [reviewed("a", 0), reviewed("b", 0)]);
  assert.equal(result.coverage, 67);
  assert.equal(result.percentage, 0);
});

test("minimum and maximum valid role targets can be fulfilled exactly", () => {
  const result = deriveRoleReadiness([requirement("a", 1), requirement("b", 100)], [reviewed("a", 1), reviewed("b", 100)]);
  assert.equal(result.percentage, 100);
  assert.equal(result.fulfilled, 2);
  assert.deepEqual(result.priorities, []);
});

test("derivation leaves its source arrays and objects unchanged", () => {
  const requirements = Object.freeze(benchmark.map((item) => Object.freeze({ ...item })));
  const assessments = Object.freeze([Object.freeze(reviewed("html", 80))]);
  const expectedRequirements = structuredClone(requirements);
  const expectedAssessments = structuredClone(assessments);
  deriveRoleReadiness(requirements, assessments);
  assert.deepEqual(requirements, expectedRequirements);
  assert.deepEqual(assessments, expectedAssessments);
});
