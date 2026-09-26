// Run once at a time, after migration 005:
// node --env-file=.env.local scripts/verify-hosted.mjs --write-demo
// Creates/reuses ONE explicitly synthetic task, portfolio, submission and review.
// Never deletes fixtures, changes Auth settings, or resets demo accounts.
import { readFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";
import { deriveRoleReadiness } from "../lib/readiness.ts";

const DEMO_TEACHER = "10000000-0000-0000-0000-000000000001";
const DEMO_STUDENT = "20000000-0000-0000-0000-000000000001";
const ROLE_ID = "40000000-0000-0000-0000-000000000001";
const ABSENT_ID = "00000000-0000-0000-0000-000000000000";
const COMPETENCY_IDS = [1, 2, 3, 4].map((number) => `30000000-0000-0000-0000-${String(number).padStart(12, "0")}`);
const TITLE = "[T50] Verifikasi sintetis — bukan bukti kompetensi";
const DESCRIPTION = "Fixture verifikasi otomatis Competra. Tautan example.com dan nilai adalah data sintetis untuk pengujian, bukan bukti kemampuan siswa.";
const CRITERIA = "Pengujian teknis alur submission dan review. Nilai sintetis; tidak membuktikan kompetensi.";
const EVIDENCE_URL = "https://example.com";
const REVIEW_NOTE = "[T50] Nilai sintetis pengujian; bukan penilaian kemampuan nyata.";
const SCORES = COMPETENCY_IDS.map((competency_id, index) => ({ competency_id, score: [80, 40, 60, 70][index], note: REVIEW_NOTE }));
const fixtureIds = {};
let passed = 0;

function safeCode(error) {
  return typeof error?.code === "string" && /^[A-Za-z0-9_]+$/.test(error.code) ? error.code : "REQUEST_FAILED";
}

function stop(name, code) {
  console.error(`FAIL ${name} ${code}`);
  throw new Error("VERIFICATION_STOPPED");
}

function check(name, condition, code = "ASSERTION_FAILED") {
  if (!condition) stop(name, code);
  passed += 1;
  console.log(`PASS ${name} OK`);
}

async function successful(name, request) {
  const { data, error } = await request;
  if (error) stop(name, safeCode(error));
  passed += 1;
  console.log(`PASS ${name} OK`);
  return data;
}

async function denied(name, request, expectedCode) {
  const { error } = await request;
  if (!error) stop(name, "UNEXPECTEDLY_ALLOWED");
  if (error.code !== expectedCode) stop(name, safeCode(error));
  passed += 1;
  console.log(`PASS ${name} ${expectedCode}`);
}

function remember(name, id) {
  check(`${name}-id`, typeof id === "string" && /^[0-9a-f-]{36}$/i.test(id), "INVALID_FIXTURE_ID");
  fixtureIds[name] = id;
  console.log(`FIXTURE ${name} ${id}`);
}

async function run() {
  if (!process.argv.includes("--write-demo")) stop("write-approval", "REQUIRES_WRITE_DEMO_FLAG");
  const projectRef = (await readFile(new URL("../supabase/.temp/project-ref", import.meta.url), "utf8")).trim();
  check("linked-project-ref", /^[a-z0-9]+$/.test(projectRef), "INVALID_PROJECT_REF");
  const url = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "");
  check("linked-project-url", url.protocol === "https:" && url.hostname === `${projectRef}.supabase.co` && !url.username && !url.password && !url.port && !url.search && !url.hash && (url.pathname === "/" || !url.pathname), "PROJECT_MISMATCH");
  const publicKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  check("public-key-present", typeof publicKey === "string" && publicKey.length > 20, "PUBLIC_KEY_MISSING");
  const options = {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: (request, init) => fetch(request, { ...init, signal: AbortSignal.timeout(20_000) }) },
  };
  const teacher = createClient(url.origin, publicKey, options);
  const student = createClient(url.origin, publicKey, options);
  const anonymous = createClient(url.origin, publicKey, options);
  const [teacherAuth, studentAuth] = await Promise.all([
    teacher.auth.signInWithPassword({ email: "guru@competra.test", password: "DemoGuru123!" }),
    student.auth.signInWithPassword({ email: "siswa@competra.test", password: "DemoSiswa123!" }),
  ]);
  if (teacherAuth.error) stop("teacher-login", safeCode(teacherAuth.error));
  if (studentAuth.error) stop("student-login", safeCode(studentAuth.error));
  check("teacher-identity", teacherAuth.data.user?.id === DEMO_TEACHER, "UNEXPECTED_DEMO_ID");
  check("student-identity", studentAuth.data.user?.id === DEMO_STUDENT, "UNEXPECTED_DEMO_ID");
  const teacherProfile = await successful("teacher-profile", teacher.from("profiles").select("id,role").eq("id", DEMO_TEACHER).single());
  const studentProfile = await successful("student-profile", student.from("profiles").select("id,role").eq("id", DEMO_STUDENT).single());
  check("teacher-role", teacherProfile.role === "teacher", "UNEXPECTED_DEMO_ROLE");
  check("student-role", studentProfile.role === "student", "UNEXPECTED_DEMO_ROLE");

  for (const table of ["assessment_tasks", "task_competencies", "submissions", "industry_roles", "role_requirements", "current_competency_assessments"]) {
    await successful(`schema-${table}`, student.from(table).select("*").limit(1));
    await denied(`anonymous-read-${table}`, anonymous.from(table).select("*").limit(1), "42501");
  }
  const roles = await successful("simulation-role", student.from("industry_roles").select("id,is_simulation").eq("id", ROLE_ID));
  check("simulation-role-count", roles.length === 1 && roles[0].is_simulation === true, "EXPECTED_SIMULATION_ROLE");
  const requirements = await successful("role-requirements", student.from("role_requirements").select("competency_id,target,practice").eq("role_id", ROLE_ID));
  check("complete-role-benchmark", requirements.length === 4 && COMPETENCY_IDS.every((id, index) => requirements.some((row) => row.competency_id === id && row.target === [80, 80, 75, 70][index])), "INCOMPLETE_BENCHMARK");

  const taskMatches = await successful("find-fixture-task", teacher.from("assessment_tasks").select("id,teacher_id,title,instructions,status").eq("teacher_id", DEMO_TEACHER).eq("title", TITLE).limit(2));
  check("single-fixture-task", taskMatches.length < 2, "AMBIGUOUS_FIXTURE");
  if (taskMatches.length) {
    const task = taskMatches[0];
    check("reused-task-content", task.teacher_id === DEMO_TEACHER && task.instructions === DESCRIPTION && task.status === "published", "FIXTURE_CHANGED");
    remember("task", task.id);
  } else {
    const taskId = await successful("publish-fixture-task", teacher.rpc("publish_assessment_task", { p_title: TITLE, p_instructions: DESCRIPTION, p_competency_ids: COMPETENCY_IDS, p_criteria: CRITERIA }));
    remember("task", taskId);
  }
  const criteria = await successful("task-criteria", student.from("task_competencies").select("competency_id,criteria").eq("task_id", fixtureIds.task));
  check("exact-task-criteria", criteria.length === 4 && COMPETENCY_IDS.every((id) => criteria.some((row) => row.competency_id === id && row.criteria === CRITERIA)), "FIXTURE_CHANGED");
  const visibleTask = await successful("student-task-visibility", student.from("assessment_tasks").select("id").eq("id", fixtureIds.task).single());
  check("student-task-visible", visibleTask.id === fixtureIds.task);

  const portfolioMatches = await successful("find-fixture-portfolio", student.from("portfolios").select("id,student_id,title,description,project_url,evidence_url").eq("student_id", DEMO_STUDENT).eq("title", TITLE).limit(2));
  check("single-fixture-portfolio", portfolioMatches.length < 2, "AMBIGUOUS_FIXTURE");
  if (portfolioMatches.length) {
    const portfolio = portfolioMatches[0];
    check("reused-portfolio-content", portfolio.student_id === DEMO_STUDENT && portfolio.description === DESCRIPTION && portfolio.project_url === EVIDENCE_URL && portfolio.evidence_url === null, "FIXTURE_CHANGED");
    remember("portfolio", portfolio.id);
  } else {
    const portfolio = await successful("create-fixture-portfolio", student.from("portfolios").insert({ student_id: DEMO_STUDENT, title: TITLE, description: DESCRIPTION, project_url: EVIDENCE_URL }).select("id").single());
    remember("portfolio", portfolio.id);
  }
  const existingTags = await successful("fixture-portfolio-tags", student.from("portfolio_competencies").select("competency_id").eq("portfolio_id", fixtureIds.portfolio));
  check("known-portfolio-tags", existingTags.every((row) => COMPETENCY_IDS.includes(row.competency_id)), "FIXTURE_CHANGED");
  const missingTags = COMPETENCY_IDS.filter((id) => !existingTags.some((row) => row.competency_id === id));
  if (missingTags.length) await successful("attach-fixture-competencies", student.from("portfolio_competencies").insert(missingTags.map((competency_id) => ({ portfolio_id: fixtureIds.portfolio, competency_id }))));

  await denied("teacher-cannot-submit", teacher.rpc("submit_portfolio", { p_task_id: fixtureIds.task, p_portfolio_id: fixtureIds.portfolio }), "42501");
  const submissionId = await successful("submit-fixture", student.rpc("submit_portfolio", { p_task_id: fixtureIds.task, p_portfolio_id: fixtureIds.portfolio }));
  remember("submission", submissionId);
  const retryId = await successful("identical-submission-retry", student.rpc("submit_portfolio", { p_task_id: fixtureIds.task, p_portfolio_id: fixtureIds.portfolio }));
  check("same-submission-id", retryId === submissionId);
  await denied("conflicting-submission", student.rpc("submit_portfolio", { p_task_id: fixtureIds.task, p_portfolio_id: ABSENT_ID }), "23505");
  await denied("student-cannot-review", student.rpc("publish_submission_review", { p_submission_id: submissionId, p_scores: SCORES }), "42501");
  await denied("review-missing-score", teacher.rpc("publish_submission_review", { p_submission_id: submissionId, p_scores: SCORES.slice(0, 3) }), "22023");
  await denied("review-duplicate-score", teacher.rpc("publish_submission_review", { p_submission_id: submissionId, p_scores: [SCORES[0], SCORES[0], SCORES[2], SCORES[3]] }), "22023");
  await denied("review-out-of-range-score", teacher.rpc("publish_submission_review", { p_submission_id: submissionId, p_scores: SCORES.map((row, index) => index === 0 ? { ...row, score: 101 } : row) }), "22023");
  await denied("review-fractional-score", teacher.rpc("publish_submission_review", { p_submission_id: submissionId, p_scores: SCORES.map((row, index) => index === 0 ? { ...row, score: 80.5 } : row) }), "22023");
  const beforeReview = await successful("pre-review-status", student.from("submissions").select("status").eq("id", submissionId).single());
  const beforeGrades = await successful("pre-review-grade-count", student.from("assessments").select("id").eq("submission_id", submissionId));
  check("invalid-review-no-partial-grades", (beforeReview.status === "submitted" && beforeGrades.length === 0) || (beforeReview.status === "reviewed" && beforeGrades.length === 4), "PARTIAL_REVIEW");
  const reviewId = await successful("publish-fixture-review", teacher.rpc("publish_submission_review", { p_submission_id: submissionId, p_scores: SCORES }));
  check("review-submission-id", reviewId === submissionId);
  const reviewRetryId = await successful("identical-review-retry", teacher.rpc("publish_submission_review", { p_submission_id: submissionId, p_scores: SCORES }));
  check("same-review-id", reviewRetryId === submissionId);
  await denied("conflicting-review", teacher.rpc("publish_submission_review", { p_submission_id: submissionId, p_scores: SCORES.map((row, index) => index === 0 ? { ...row, score: 81 } : row) }), "23514");
  const reviewedSubmission = await successful("reviewed-snapshot", student.from("submissions").select("id,student_id,task_id,title,description,project_url,evidence_url,status,reviewed_by,reviewed_at,reviewer_name").eq("id", submissionId).single());
  check("atomic-review-status", reviewedSubmission.status === "reviewed" && reviewedSubmission.reviewed_by === DEMO_TEACHER && Boolean(reviewedSubmission.reviewed_at) && Boolean(reviewedSubmission.reviewer_name), "INCOMPLETE_REVIEW");
  check("owned-evidence-snapshot", reviewedSubmission.student_id === DEMO_STUDENT && reviewedSubmission.task_id === fixtureIds.task && reviewedSubmission.title === TITLE && reviewedSubmission.description === DESCRIPTION && reviewedSubmission.project_url === EVIDENCE_URL && reviewedSubmission.evidence_url === null, "SNAPSHOT_CHANGED");
  const grades = await successful("persisted-fixture-grades", student.from("assessments").select("id,student_id,competency_id,score,note").eq("submission_id", submissionId));
  check("four-persisted-demo-grades", grades.length === 4 && SCORES.every((expected) => grades.some((row) => row.student_id === DEMO_STUDENT && row.competency_id === expected.competency_id && row.score === expected.score && row.note === REVIEW_NOTE)), "REVIEW_MISMATCH");

  // These attempted updates use identical values on fixture rows. A broken permission
  // never writes a different score or overwrites another user's project.
  for (const [name, client] of [["teacher", teacher], ["student", student]]) {
    await denied(`${name}-direct-task-write`, client.from("assessment_tasks").update({ title: TITLE }).eq("id", fixtureIds.task), "42501");
    await denied(`${name}-direct-criteria-write`, client.from("task_competencies").update({ criteria: CRITERIA }).eq("task_id", fixtureIds.task), "42501");
    await denied(`${name}-direct-submission-write`, client.from("submissions").update({ title: TITLE }).eq("id", submissionId), "42501");
    await denied(`${name}-direct-grade-write`, client.from("assessments").update({ note: REVIEW_NOTE }).eq("submission_id", submissionId), "42501");
    // No real benchmark row is targeted, even if a grant unexpectedly exists.
    await denied(`${name}-direct-role-write`, client.from("industry_roles").update({ is_simulation: true }).eq("id", ABSENT_ID), "42501");
    await denied(`${name}-direct-requirement-write`, client.from("role_requirements").update({ target: 80 }).eq("role_id", ABSENT_ID), "42501");
  }
  await denied("submitted-portfolio-immutable", student.from("portfolios").update({ description: DESCRIPTION }).eq("id", fixtureIds.portfolio), "23514");

  const current = await successful("student-current-view", student.from("current_competency_assessments").select("student_id,competency_id,score,submission_id,task_id,reviewed_at"));
  check("current-view-own-rows", current.every((row) => row.student_id === DEMO_STUDENT), "FOREIGN_STUDENT_ROW");
  const currentRole = current.filter((row) => COMPETENCY_IDS.includes(row.competency_id));
  check("current-role-evidence", currentRole.length === 4 && currentRole.every((row) => row.submission_id !== null && row.task_id !== null && row.reviewed_at !== null), "MISSING_PROVENANCE");
  const reviewedHistory = await successful("reviewed-source-history", student.from("submissions").select("id,submitted_at").eq("student_id", DEMO_STUDENT).eq("status", "reviewed"));
  const sourceById = new Map(reviewedHistory.map((row) => [row.id, row]));
  const allGrades = await successful("graded-source-history", student.from("assessments").select("id,competency_id,submission_id,score,updated_at").eq("student_id", DEMO_STUDENT).in("competency_id", COMPETENCY_IDS));
  for (const competencyId of COMPETENCY_IDS) {
    const candidates = allGrades.filter((row) => row.competency_id === competencyId && sourceById.has(row.submission_id)).sort((left, right) => {
      const leftSource = sourceById.get(left.submission_id);
      const rightSource = sourceById.get(right.submission_id);
      return Date.parse(rightSource.submitted_at) - Date.parse(leftSource.submitted_at) || rightSource.id.localeCompare(leftSource.id) || Date.parse(right.updated_at) - Date.parse(left.updated_at) || right.id.localeCompare(left.id);
    });
    const actual = currentRole.find((row) => row.competency_id === competencyId);
    check(`current-source-${COMPETENCY_IDS.indexOf(competencyId) + 1}`, candidates.length > 0 && actual.submission_id === candidates[0].submission_id && actual.score === candidates[0].score, "INCORRECT_CURRENT_SOURCE");
  }
  if (currentRole.every((row) => row.submission_id === submissionId)) {
    const readiness = deriveRoleReadiness(requirements.map((row) => ({ competencyId: row.competency_id, target: row.target, name: row.competency_id, practice: row.practice })), currentRole.map((row) => ({ competencyId: row.competency_id, score: row.score, submissionId: row.submission_id })));
    check("demo-readiness-83-coverage-100", readiness.percentage === 83 && readiness.coverage === 100 && readiness.fulfilled === 2 && readiness.assessed === 4, "INCORRECT_READINESS");
  } else {
    console.log("SKIP demo-readiness NEWER_EVIDENCE_PRESENT");
  }
  console.log("SKIP cross-student-ownership SECOND_STUDENT_NOT_PROVISIONED");
  console.log("SKIP other-teacher-review SECOND_TEACHER_NOT_PROVISIONED");
  console.log("SKIP delayed-review-scenario SECOND_TASK_NOT_CREATED");
  console.log("SKIP immutable-delete DELETES_NOT_ATTEMPTED");
  console.log("SKIP invalid-url-submission NO_ADDITIONAL_INVALID_FIXTURE");
  console.log("SKIP direct-insert-delete UPDATE_PERMISSION_ONLY");
  console.log(`PASS hosted-verification CHECKS_${passed}`);
}

try {
  await run();
} catch (error) {
  if (error?.message !== "VERIFICATION_STOPPED") console.error(`FAIL hosted-verification ${safeCode(error)}`);
  process.exitCode = 1;
} finally {
  for (const [name, id] of Object.entries(fixtureIds)) console.log(`FIXTURE ${name} ${id}`);
  // Clients are memory-only. Do not sign out globally and revoke the user's sessions.
}
