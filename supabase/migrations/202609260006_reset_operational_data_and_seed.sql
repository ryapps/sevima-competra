-- One-time operational data reset. Auth accounts and public.profiles are preserved.
-- This migration aborts before deleting anything unless both teacher and student
-- profiles exist. Demo rows are restored atomically after the reset.
begin;

do $$
begin
  if not exists (select 1 from public.profiles where role = 'teacher') then
    raise exception 'RESET_ABORTED: no teacher profile exists';
  end if;
  if not exists (select 1 from public.profiles where role = 'student') then
    raise exception 'RESET_ABORTED: no student profile exists';
  end if;
end;
$$;

delete from public.assessments;
delete from public.portfolio_competencies;
delete from public.submissions;
delete from public.task_competencies;
delete from public.assessment_tasks;
delete from public.role_requirements;
delete from public.industry_roles;
delete from public.portfolios;
delete from public.competencies;

insert into public.competencies (id, name, description, industry_target)
values
  ('30000000-0000-0000-0000-000000000001', 'HTML Semantik', 'Menyusun struktur halaman yang bermakna dan mudah diakses.', 80),
  ('30000000-0000-0000-0000-000000000002', 'CSS Responsif', 'Membangun tata letak yang tetap jelas pada desktop dan perangkat mobile.', 80),
  ('30000000-0000-0000-0000-000000000003', 'JavaScript dan DOM', 'Menerapkan logika interaksi antarmuka dengan JavaScript.', 75),
  ('30000000-0000-0000-0000-000000000004', 'Git dan Kolaborasi', 'Mengelola perubahan kode dan berkolaborasi melalui version control.', 70),
  ('30000000-0000-0000-0000-000000000005', 'Basis Data SQL', 'Merancang dan menggunakan basis data relasional untuk aplikasi.', 75);

insert into public.industry_roles (id, name, description, benchmark_source, is_simulation)
values (
  '40000000-0000-0000-0000-000000000001',
  'Junior Web Developer',
  'Kesiapan dasar membangun antarmuka web dan mengelola kode proyek.',
  'Simulasi demo Competra; belum divalidasi sebagai standar industri resmi.',
  true
);

insert into public.role_requirements (role_id, competency_id, target, practice)
values
  ('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 80, 'Susun halaman proyek dengan landmark, heading berurutan, dan label form.'),
  ('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002', 80, 'Perbaiki layout proyek pada lebar mobile dan desktop tanpa scroll horizontal.'),
  ('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000003', 75, 'Tambahkan validasi form dan interaksi DOM; sertakan langkah uji pada README.'),
  ('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000004', 70, 'Rapikan riwayat commit dan dokumentasikan alur branch.'),
  ('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000005', 75, 'Rancang skema relasional dan dokumentasikan query utama proyek.');

insert into public.portfolios (id, student_id, title, description, project_url, evidence_url, created_at)
select
  '50000000-0000-0000-0000-000000000001',
  id,
  'Aplikasi katalog produk',
  'Proyek praktik untuk mengelola katalog dengan antarmuka responsif dan data relasional.',
  'https://github.com',
  'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
  now() - interval '2 days'
from public.profiles student
where student.id = (
  select id
  from public.profiles
  where role = 'student'
  order by case when id = '20000000-0000-0000-0000-000000000001'::uuid then 0 else 1 end, id
  limit 1
);

insert into public.portfolio_competencies (portfolio_id, competency_id)
values
  ('50000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001'),
  ('50000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002'),
  ('50000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000003'),
  ('50000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000005');

insert into public.assessment_tasks (id, teacher_id, title, instructions, status)
select
  '60000000-0000-0000-0000-000000000001',
  id,
  'Membangun aplikasi katalog web',
  'Buat aplikasi katalog yang responsif, interaktif, dan menggunakan data terstruktur. Sertakan tautan proyek sebagai bukti.',
  'published'
from public.profiles teacher
where teacher.id = (
  select id
  from public.profiles
  where role = 'teacher'
  order by case when id = '10000000-0000-0000-0000-000000000001'::uuid then 0 else 1 end, id
  limit 1
);

insert into public.task_competencies (task_id, competency_id, criteria)
values
  ('60000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'Struktur dokumen semantik, heading berurutan, dan label yang dapat diakses.'),
  ('60000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002', 'Tata letak dapat digunakan pada layar mobile dan desktop.'),
  ('60000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000003', 'Interaksi utama berjalan dan input divalidasi.'),
  ('60000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000004', 'Perubahan proyek dikelola dengan riwayat Git yang jelas.'),
  ('60000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000005', 'Data katalog menggunakan struktur relasional yang sesuai.');

insert into public.submissions (
  id, task_id, student_id, portfolio_id, title, description, project_url, evidence_url,
  status, submitted_at, reviewed_at, reviewed_by, reviewer_name
)
select
  '70000000-0000-0000-0000-000000000001',
  '60000000-0000-0000-0000-000000000001',
  student.id,
  '50000000-0000-0000-0000-000000000001',
  portfolio.title,
  portfolio.description,
  portfolio.project_url,
  portfolio.evidence_url,
  'reviewed',
  now() - interval '2 days',
  now() - interval '1 day',
  teacher.id,
  teacher.name
from public.profiles student
cross join public.profiles teacher
join public.portfolios portfolio on portfolio.id = '50000000-0000-0000-0000-000000000001'
where student.role = 'student'
  and teacher.role = 'teacher'
  and student.id = (
    select id from public.profiles
    where role = 'student'
    order by case when id = '20000000-0000-0000-0000-000000000001'::uuid then 0 else 1 end, id
    limit 1
  )
  and teacher.id = (
    select id from public.profiles
    where role = 'teacher'
    order by case when id = '10000000-0000-0000-0000-000000000001'::uuid then 0 else 1 end, id
    limit 1
  );

insert into public.assessments (student_id, competency_id, submission_id, score, note)
select
  student.id,
  scores.competency_id,
  '70000000-0000-0000-0000-000000000001',
  scores.score,
  scores.note
from public.profiles student
cross join (values
  ('30000000-0000-0000-0000-000000000001'::uuid, 88::smallint, 'Struktur konten jelas dan mudah dinavigasi.'::text),
  ('30000000-0000-0000-0000-000000000002'::uuid, 82::smallint, 'Tampilan responsif pada ukuran layar yang diuji.'::text),
  ('30000000-0000-0000-0000-000000000003'::uuid, 88::smallint, 'Interaksi utama berfungsi sesuai kebutuhan.'::text),
  ('30000000-0000-0000-0000-000000000004'::uuid, 82::smallint, 'Riwayat perubahan dan struktur proyek tertata.'::text),
  ('30000000-0000-0000-0000-000000000005'::uuid, 64::smallint, 'Perlu latihan tambahan pada relasi dan query SQL.'::text)
) as scores(competency_id, score, note)
where student.id = (
  select id
  from public.profiles
  where role = 'student'
  order by case when id = '20000000-0000-0000-0000-000000000001'::uuid then 0 else 1 end, id
  limit 1
);

commit;
