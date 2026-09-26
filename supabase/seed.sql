-- Local demo credentials:
-- guru@competra.test / DemoGuru123!
-- siswa@competra.test / DemoSiswa123!

insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
)
values
  (
    '00000000-0000-0000-0000-000000000000',
    '10000000-0000-0000-0000-000000000001',
    'authenticated',
    'authenticated',
    'guru@competra.test',
    extensions.crypt('DemoGuru123!', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Ibu Rina"}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '20000000-0000-0000-0000-000000000001',
    'authenticated',
    'authenticated',
    'siswa@competra.test',
    extensions.crypt('DemoSiswa123!', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Andi Pratama"}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  )
on conflict (id) do update set
  email = excluded.email,
  encrypted_password = excluded.encrypted_password,
  email_confirmed_at = excluded.email_confirmed_at,
  raw_app_meta_data = excluded.raw_app_meta_data,
  raw_user_meta_data = excluded.raw_user_meta_data,
  updated_at = now();

insert into auth.identities (
  id,
  provider_id,
  user_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
)
values
  (
    '11000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    '{"sub":"10000000-0000-0000-0000-000000000001","email":"guru@competra.test"}',
    'email',
    now(),
    now(),
    now()
  ),
  (
    '22000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001',
    '{"sub":"20000000-0000-0000-0000-000000000001","email":"siswa@competra.test"}',
    'email',
    now(),
    now(),
    now()
  )
on conflict (provider_id, provider) do update set
  identity_data = excluded.identity_data,
  updated_at = now();

insert into public.profiles (id, name, role)
values
  ('10000000-0000-0000-0000-000000000001', 'Ibu Rina', 'teacher'),
  ('20000000-0000-0000-0000-000000000001', 'Andi Pratama', 'student')
on conflict (id) do update set
  name = excluded.name,
  role = excluded.role;

insert into public.competencies (id, name, description, industry_target)
values
  (
    '30000000-0000-0000-0000-000000000001',
    'HTML Semantik',
    'Menyusun struktur halaman yang bermakna dan mudah diakses.',
    80
  ),
  (
    '30000000-0000-0000-0000-000000000002',
    'CSS Responsif',
    'Membangun tata letak yang tetap jelas pada desktop dan perangkat mobile.',
    80
  ),
  (
    '30000000-0000-0000-0000-000000000003',
    'JavaScript dan DOM',
    'Menerapkan logika interaksi antarmuka dengan JavaScript.',
    75
  ),
  (
    '30000000-0000-0000-0000-000000000004',
    'Git dan Kolaborasi',
    'Mengelola perubahan kode dan berkolaborasi melalui version control.',
    70
  ),
  (
    '30000000-0000-0000-0000-000000000005',
    'Basis Data SQL',
    'Merancang dan menggunakan basis data relasional untuk aplikasi.',
    75
  )
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  industry_target = excluded.industry_target;
