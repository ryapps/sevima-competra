create or replace function public.create_student_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, name, role)
  values (
    new.id,
    left(
      coalesce(
        nullif(btrim(new.raw_user_meta_data ->> 'name'), ''),
        nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
        'Siswa'
      ),
      100
    ),
    'student'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

revoke all on function public.create_student_profile_for_new_user() from public;

create trigger create_student_profile_after_auth_signup
after insert on auth.users
for each row execute function public.create_student_profile_for_new_user();

comment on function public.create_student_profile_for_new_user() is
  'Creates a non-privileged student profile for every new Auth user. Teacher promotion remains a controlled database operation.';
