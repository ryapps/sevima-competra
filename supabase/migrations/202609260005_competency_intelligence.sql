-- Run after 001–004 on Supabase hosted. Existing users, projects and scores are preserved.
begin;

create table public.assessment_tasks (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles(id),
  title text not null check (char_length(btrim(title)) between 1 and 120),
  instructions text not null check (char_length(btrim(instructions)) between 1 and 4000),
  status text not null default 'published' check (status in ('draft','published')),
  created_at timestamptz not null default now()
);
create table public.task_competencies (
  task_id uuid not null references public.assessment_tasks(id) on delete cascade,
  competency_id uuid not null references public.competencies(id),
  criteria text not null check (char_length(btrim(criteria)) between 1 and 1000),
  primary key (task_id, competency_id)
);
create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.assessment_tasks(id),
  student_id uuid not null references public.profiles(id),
  portfolio_id uuid not null references public.portfolios(id),
  title text not null,
  description text,
  project_url text,
  evidence_url text,
  status text not null default 'submitted' check (status in ('submitted','reviewed')),
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id),
  reviewer_name text,
  unique (task_id, student_id),
  check ((status = 'submitted' and reviewed_at is null and reviewed_by is null)
    or (status = 'reviewed' and reviewed_at is not null and reviewed_by is not null)),
  check (coalesce(project_url, evidence_url) is not null)
);
alter table public.assessments add column submission_id uuid references public.submissions(id);
alter table public.assessments drop constraint assessments_student_id_competency_id_key;
create unique index assessments_legacy_pair_key on public.assessments(student_id, competency_id)
  where submission_id is null;
create unique index assessments_submission_competency_key on public.assessments(submission_id, competency_id)
  where submission_id is not null;
comment on table public.assessments is 'Per-submission review scores; null submission_id preserves historical direct scores.';

create table public.industry_roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text not null,
  benchmark_source text not null,
  is_simulation boolean not null default true
);
create table public.role_requirements (
  role_id uuid not null references public.industry_roles(id) on delete cascade,
  competency_id uuid not null references public.competencies(id),
  target smallint not null check (target between 1 and 100),
  practice text not null,
  primary key (role_id, competency_id)
);
create index assessment_tasks_teacher_idx on public.assessment_tasks(teacher_id);
create index task_competencies_competency_idx on public.task_competencies(competency_id);
create index submissions_student_idx on public.submissions(student_id);
create index submissions_portfolio_idx on public.submissions(portfolio_id);
create index role_requirements_competency_idx on public.role_requirements(competency_id);

alter table public.assessment_tasks enable row level security;
alter table public.task_competencies enable row level security;
alter table public.submissions enable row level security;
alter table public.industry_roles enable row level security;
alter table public.role_requirements enable row level security;

-- Only these RPCs may mutate task/review data. Do not trust client-supplied ownership/status.
revoke all on public.assessment_tasks, public.task_competencies, public.submissions,
  public.industry_roles, public.role_requirements from anon, authenticated;
grant select on public.assessment_tasks, public.task_competencies, public.submissions,
  public.industry_roles, public.role_requirements to authenticated;
revoke insert, update, delete on public.assessments from anon, authenticated;
grant select on public.assessments to authenticated;
drop policy assessments_insert_teacher on public.assessments;
drop policy assessments_update_teacher on public.assessments;
drop policy assessments_read_owner_or_teacher on public.assessments;

create policy tasks_read on public.assessment_tasks for select to authenticated using (
  teacher_id = (select auth.uid()) or (status = 'published' and public.has_role('student'))
);
create policy task_competencies_read on public.task_competencies for select to authenticated using (
  exists (select 1 from public.assessment_tasks t where t.id = task_id)
);
create policy submissions_read on public.submissions for select to authenticated using (
  student_id = (select auth.uid()) or exists (
    select 1 from public.assessment_tasks t where t.id = task_id and t.teacher_id = (select auth.uid())
  )
);
create policy assessments_read on public.assessments for select to authenticated using (
  student_id = (select auth.uid())
  or (submission_id is null and public.has_role('teacher'))
  or exists (
    select 1 from public.submissions s join public.assessment_tasks t on t.id = s.task_id
    where s.id = submission_id and t.teacher_id = (select auth.uid())
  )
);
create policy roles_read on public.industry_roles for select to authenticated using (true);
create policy role_requirements_read on public.role_requirements for select to authenticated using (true);

create function public.protect_submitted_portfolio() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if exists (select 1 from public.submissions where portfolio_id = old.id) then
    raise exception using errcode = '23514', message = 'SUBMITTED_PORTFOLIO_LOCKED';
  end if;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;
revoke all on function public.protect_submitted_portfolio() from public, anon, authenticated;
create trigger protect_submitted_portfolio before update or delete on public.portfolios
  for each row execute function public.protect_submitted_portfolio();

create function public.publish_assessment_task(
  p_title text, p_instructions text, p_competency_ids uuid[], p_criteria text
) returns uuid language plpgsql security definer set search_path = '' as $$
declare
  v_id uuid;
  v_count integer;
begin
  if auth.uid() is null or not public.has_role('teacher') then
    raise exception using errcode = '42501', message = 'TEACHER_REQUIRED';
  end if;
  if p_title is null or char_length(btrim(p_title)) not between 1 and 120
    or p_instructions is null or char_length(btrim(p_instructions)) not between 1 and 4000
    or p_criteria is null or char_length(btrim(p_criteria)) not between 1 and 1000
    or coalesce(cardinality(p_competency_ids),0) not between 1 and 20 then
    raise exception using errcode = '22023', message = 'INVALID_TASK';
  end if;
  select count(*) into v_count from public.competencies where id = any(p_competency_ids);
  if v_count <> cardinality(p_competency_ids) then
    raise exception using errcode = '22023', message = 'INVALID_COMPETENCIES';
  end if;
  insert into public.assessment_tasks(teacher_id,title,instructions)
    values(auth.uid(),btrim(p_title),btrim(p_instructions)) returning id into v_id;
  insert into public.task_competencies(task_id,competency_id,criteria)
    select v_id, x, btrim(p_criteria) from unnest(p_competency_ids) x;
  return v_id;
end;
$$;

-- Private validator for canonical HTTP(S) URLs; clients cannot bypass it by writing
-- a portfolio directly. URL paths remain opaque and are never fetched by this RPC.
create function public.valid_evidence_url(p_url text) returns boolean
language plpgsql immutable set search_path = '' as $$
declare
  v_parts text[];
  v_authority text;
  v_host text;
  v_port text;
  v_label text;
  v_address inet;
begin
  if p_url is null or char_length(p_url) not between 1 and 2048
    or p_url ~ '[[:space:][:cntrl:]]' or position(chr(92) in p_url) > 0 then
    return false;
  end if;
  v_parts := regexp_match(p_url, '^https?://([^/?#]+)([/?#].*)?$', 'i');
  if v_parts is null then return false; end if;
  v_authority := v_parts[1];
  if position('@' in v_authority) > 0 then return false; end if;

  if left(v_authority, 1) = '[' then
    v_parts := regexp_match(v_authority, '^\[([0-9A-Fa-f:.]+)\](:([0-9]+))?$');
    if v_parts is null then return false; end if;
    v_host := v_parts[1];
    v_port := v_parts[3];
    begin
      v_address := v_host::inet;
    exception when invalid_text_representation then return false;
    end;
    if family(v_address) <> 6 or masklen(v_address) <> 128 then return false; end if;
  else
    v_parts := regexp_match(v_authority, '^([^:]+)(:([0-9]+))?$');
    if v_parts is null then return false; end if;
    v_host := regexp_replace(v_parts[1], '\.$', '');
    v_port := v_parts[3];
    if char_length(v_host) not between 1 and 253 then return false; end if;
    if v_host ~ '(^|\.)[0-9]+$' then
      -- Canonical IPv4 has exactly four decimal octets; reject malformed numeric hosts.
      if v_host !~ '^[0-9]{1,3}(\.[0-9]{1,3}){3}$' then return false; end if;
      begin
        v_address := v_host::inet;
      exception when invalid_text_representation then return false;
      end;
      if family(v_address) <> 4 or masklen(v_address) <> 32 then return false; end if;
    else
      foreach v_label in array string_to_array(v_host, '.') loop
        if char_length(v_label) not between 1 and 63
          or v_label !~ '^[A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?$' then return false; end if;
      end loop;
    end if;
  end if;
  if v_port is not null then
    if char_length(v_port) > 5 then return false; end if;
    if v_port::integer not between 0 and 65535 then return false; end if;
  end if;
  return true;
end;
$$;
revoke all on function public.valid_evidence_url(text) from public, anon, authenticated;

create function public.submit_portfolio(p_task_id uuid, p_portfolio_id uuid) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  v_project public.portfolios%rowtype;
  v_existing public.submissions%rowtype;
  v_id uuid;
begin
  if auth.uid() is null or not public.has_role('student') then
    raise exception using errcode = '42501', message = 'STUDENT_REQUIRED';
  end if;
  -- Serialize attempts per student, including concurrent attempts with different portfolios.
  perform 1 from public.profiles where id = auth.uid() for update;
  if not exists (select 1 from public.assessment_tasks where id = p_task_id and status = 'published') then
    raise exception using errcode = '22023', message = 'TASK_NOT_AVAILABLE';
  end if;
  select * into v_existing from public.submissions where task_id = p_task_id and student_id = auth.uid();
  if found then
    if v_existing.portfolio_id = p_portfolio_id then return v_existing.id; end if;
    raise exception using errcode = '23505', message = 'ALREADY_SUBMITTED';
  end if;
  select * into v_project from public.portfolios
    where id = p_portfolio_id and student_id = auth.uid() for update;
  if not found then raise exception using errcode = '42501', message = 'OWNED_PORTFOLIO_REQUIRED'; end if;
  if (v_project.project_url is null and v_project.evidence_url is null)
    or (v_project.project_url is not null and not public.valid_evidence_url(v_project.project_url))
    or (v_project.evidence_url is not null and not public.valid_evidence_url(v_project.evidence_url)) then
    raise exception using errcode = '22023', message = 'INVALID_EVIDENCE_URL';
  end if;
  insert into public.submissions(task_id,student_id,portfolio_id,title,description,project_url,evidence_url)
    values(p_task_id,auth.uid(),p_portfolio_id,v_project.title,v_project.description,v_project.project_url,v_project.evidence_url)
    returning id into v_id;
  return v_id;
end;
$$;

create function public.publish_submission_review(p_submission_id uuid, p_scores jsonb) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  v_submission public.submissions%rowtype;
  v_expected integer;
  v_row jsonb;
  v_competency uuid;
  v_seen uuid[] := '{}';
  v_reviewer text;
begin
  if auth.uid() is null or not public.has_role('teacher') then
    raise exception using errcode = '42501', message = 'TEACHER_REQUIRED';
  end if;
  select s.* into v_submission from public.submissions s
    join public.assessment_tasks t on t.id = s.task_id
    where s.id = p_submission_id and t.teacher_id = auth.uid() for update of s;
  if not found then raise exception using errcode = '42501', message = 'TASK_OWNER_REQUIRED'; end if;
  if p_scores is null or jsonb_typeof(p_scores) <> 'array' then
    raise exception using errcode = '22023', message = 'INVALID_SCORES';
  end if;
  select count(*) into v_expected from public.task_competencies where task_id = v_submission.task_id;
  if v_expected = 0 or jsonb_array_length(p_scores) <> v_expected then
    raise exception using errcode = '22023', message = 'ALL_COMPETENCIES_REQUIRED';
  end if;
  for v_row in select value from jsonb_array_elements(p_scores) loop
    if jsonb_typeof(v_row) <> 'object' or not (v_row ? 'competency_id' and v_row ? 'score')
      or (v_row->>'competency_id') is null
      or (v_row->>'competency_id') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      or jsonb_typeof(v_row->'score') <> 'number' or (v_row->>'score') !~ '^[0-9]{1,3}$'
      or (v_row ? 'note' and jsonb_typeof(v_row->'note') not in ('string','null')) then
      raise exception using errcode = '22023', message = 'INVALID_SCORE';
    end if;
    v_competency := (v_row->>'competency_id')::uuid;
    if (v_row->>'score')::integer not between 0 and 100
      or char_length(coalesce(v_row->>'note','')) > 500
      or v_competency = any(v_seen)
      or not exists(select 1 from public.task_competencies where task_id = v_submission.task_id and competency_id = v_competency) then
      raise exception using errcode = '22023', message = 'INVALID_SCORE';
    end if;
    v_seen := array_append(v_seen,v_competency);
  end loop;
  if v_submission.status = 'reviewed' then
    if exists (
      select 1 from jsonb_array_elements(p_scores) x
      where not exists (
        select 1 from public.assessments a where a.submission_id = p_submission_id
          and a.competency_id = (x->>'competency_id')::uuid and a.score = (x->>'score')::integer
          and coalesce(a.note,'') = btrim(coalesce(x->>'note',''))
      )
    ) then raise exception using errcode = '23514', message = 'REVIEW_ALREADY_PUBLISHED'; end if;
    return p_submission_id;
  end if;
  insert into public.assessments(student_id,competency_id,submission_id,score,note)
    select v_submission.student_id, (x->>'competency_id')::uuid, p_submission_id,
      (x->>'score')::smallint, nullif(btrim(coalesce(x->>'note','')),'')
    from jsonb_array_elements(p_scores) x;
  select name into v_reviewer from public.profiles where id = auth.uid();
  update public.submissions set status = 'reviewed', reviewed_at = now(), reviewed_by = auth.uid(),
    reviewer_name = v_reviewer where id = p_submission_id;
  return p_submission_id;
end;
$$;
revoke all on function public.publish_assessment_task(text,text,uuid[],text) from public,anon;
revoke all on function public.submit_portfolio(uuid,uuid) from public,anon;
revoke all on function public.publish_submission_review(uuid,jsonb) from public,anon;
grant execute on function public.publish_assessment_task(text,text,uuid[],text) to authenticated;
grant execute on function public.submit_portfolio(uuid,uuid) to authenticated;
grant execute on function public.publish_submission_review(uuid,jsonb) to authenticated;

create view public.current_competency_assessments with (security_invoker = true) as
  select distinct on (a.student_id,a.competency_id)
    a.id,a.student_id,a.competency_id,a.score,a.note,a.submission_id,
    s.task_id,t.title as task_title,s.submitted_at,s.reviewed_at,s.reviewer_name,a.updated_at
  from public.assessments a
  left join public.submissions s on s.id = a.submission_id
  left join public.assessment_tasks t on t.id = s.task_id
  where a.submission_id is null or s.status = 'reviewed'
  order by a.student_id,a.competency_id,(a.submission_id is not null) desc,
    s.submitted_at desc nulls last,s.id desc nulls last,a.updated_at desc,a.id desc;
revoke all on public.current_competency_assessments from anon,authenticated;
grant select on public.current_competency_assessments to authenticated;

insert into public.industry_roles(id,name,description,benchmark_source)
values ('40000000-0000-0000-0000-000000000001','Junior Web Developer',
  'Kesiapan dasar membangun antarmuka web dan mengelola kode proyek.',
  'Simulasi demo Competra; belum divalidasi sebagai standar industri resmi.');
insert into public.role_requirements(role_id,competency_id,target,practice)
select '40000000-0000-0000-0000-000000000001'::uuid,c.id,v.target,v.practice
from (values
  ('30000000-0000-0000-0000-000000000001'::uuid,80,'Susun ulang halaman proyek dengan landmark, heading berurutan, dan label form.'),
  ('30000000-0000-0000-0000-000000000002'::uuid,80,'Perbaiki layout proyek pada lebar 375 px dan desktop tanpa scroll horizontal.'),
  ('30000000-0000-0000-0000-000000000003'::uuid,75,'Tambahkan validasi form dan interaksi DOM; sertakan langkah uji pada README.'),
  ('30000000-0000-0000-0000-000000000004'::uuid,70,'Rapikan riwayat commit dan dokumentasikan alur branch serta cara menjalankan proyek.')
) v(id,target,practice) join public.competencies c on c.id = v.id
-- Never publish a partial benchmark that would inflate readiness on a custom/empty dataset.
where (select count(*) from public.competencies where id in (
  '30000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002',
  '30000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000004'
)) = 4;

commit;
