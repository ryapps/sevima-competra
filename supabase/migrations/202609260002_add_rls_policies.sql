create or replace function public.has_role(expected_role text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = expected_role
  );
$$;

revoke all on function public.has_role(text) from public;
grant execute on function public.has_role(text) to authenticated;

create policy "profiles_read_own_or_teacher" on public.profiles
for select to authenticated
using (id = (select auth.uid()) or public.has_role('teacher'));

create policy "competencies_read_authenticated" on public.competencies
for select to authenticated using ((select auth.uid()) is not null);
create policy "competencies_insert_teacher" on public.competencies
for insert to authenticated with check (public.has_role('teacher'));
create policy "competencies_update_teacher" on public.competencies
for update to authenticated using (public.has_role('teacher')) with check (public.has_role('teacher'));

create policy "assessments_read_owner_or_teacher" on public.assessments
for select to authenticated
using (student_id = (select auth.uid()) or public.has_role('teacher'));
create policy "assessments_insert_teacher" on public.assessments
for insert to authenticated
with check (
  public.has_role('teacher') and exists (
    select 1 from public.profiles where id = student_id and role = 'student'
  )
);
create policy "assessments_update_teacher" on public.assessments
for update to authenticated
using (public.has_role('teacher'))
with check (public.has_role('teacher'));

create policy "portfolios_read_owner" on public.portfolios
for select to authenticated using (student_id = (select auth.uid()));
create policy "portfolios_insert_owner" on public.portfolios
for insert to authenticated
with check (student_id = (select auth.uid()) and public.has_role('student'));
create policy "portfolios_update_owner" on public.portfolios
for update to authenticated
using (student_id = (select auth.uid()))
with check (student_id = (select auth.uid()) and public.has_role('student'));
create policy "portfolios_delete_owner" on public.portfolios
for delete to authenticated using (student_id = (select auth.uid()));

create policy "portfolio_competencies_read_owner" on public.portfolio_competencies
for select to authenticated using (
  exists (
    select 1 from public.portfolios
    where id = portfolio_id and student_id = (select auth.uid())
  )
);
create policy "portfolio_competencies_insert_owner" on public.portfolio_competencies
for insert to authenticated with check (
  public.has_role('student') and exists (
    select 1 from public.portfolios
    where id = portfolio_id and student_id = (select auth.uid())
  )
);
create policy "portfolio_competencies_delete_owner" on public.portfolio_competencies
for delete to authenticated using (
  exists (
    select 1 from public.portfolios
    where id = portfolio_id and student_id = (select auth.uid())
  )
);
