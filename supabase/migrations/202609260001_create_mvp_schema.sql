create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 100),
  role text not null check (role in ('teacher', 'student'))
);

create table public.competencies (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(btrim(name)) between 1 and 100),
  description text check (description is null or char_length(description) <= 500),
  industry_target smallint not null check (industry_target between 0 and 100),
  created_at timestamptz not null default now()
);

create table public.assessments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles (id) on delete cascade,
  competency_id uuid not null references public.competencies (id) on delete cascade,
  score smallint not null check (score between 0 and 100),
  note text check (note is null or char_length(note) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, competency_id)
);

create table public.portfolios (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles (id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 120),
  description text check (description is null or char_length(description) <= 1000),
  project_url text,
  evidence_url text,
  created_at timestamptz not null default now()
);

create table public.portfolio_competencies (
  portfolio_id uuid not null references public.portfolios (id) on delete cascade,
  competency_id uuid not null references public.competencies (id) on delete cascade,
  primary key (portfolio_id, competency_id)
);

create index assessments_student_id_idx on public.assessments (student_id);
create index assessments_competency_id_idx on public.assessments (competency_id);
create index portfolios_student_id_idx on public.portfolios (student_id);
create index portfolio_competencies_competency_id_idx
  on public.portfolio_competencies (competency_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger assessments_set_updated_at
before update on public.assessments
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.competencies enable row level security;
alter table public.assessments enable row level security;
alter table public.portfolios enable row level security;
alter table public.portfolio_competencies enable row level security;

comment on table public.assessments is
  'One current assessment per student and competency; reassessment updates the existing row.';
