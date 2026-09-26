'use server';

import { redirect } from 'next/navigation';

import { authErrorMessage } from '@/lib/auth-errors';
import { createClient } from '@/lib/supabase/server';

export type RegisterState = {
  message?: string;
  fieldErrors?: Partial<Record<'name' | 'email' | 'password' | 'confirmPassword', string>>;
  values: { name: string; email: string };
  revision: number;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function registerStudent(previousState: RegisterState, formData: FormData): Promise<RegisterState> {
  const name = String(formData.get('name') ?? '').trim();
  const email = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase();
  const password = String(formData.get('password') ?? '');
  const confirmPassword = String(formData.get('confirmPassword') ?? '');
  const fieldErrors: RegisterState['fieldErrors'] = {};

  if (name.length < 2 || name.length > 100) fieldErrors.name = 'Nama harus terdiri dari 2–100 karakter.';
  if (!emailPattern.test(email)) fieldErrors.email = 'Masukkan alamat email yang valid.';
  if (password.length < 8) fieldErrors.password = 'Kata sandi minimal 8 karakter.';
  if (confirmPassword !== password) fieldErrors.confirmPassword = 'Konfirmasi kata sandi tidak cocok.';

  if (Object.keys(fieldErrors).length > 0) {
    return {
      message: 'Periksa kembali data pendaftaran.',
      fieldErrors,
      values: { name, email },
      revision: previousState.revision + 1,
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });

  if (error) {
    console.error('registerStudent failed', { code: error.code, status: error.status });
    return {
      message: authErrorMessage(error.code, 'register'),
      values: { name, email },
      revision: previousState.revision + 1,
    };
  }
  if (!data.user || data.user.identities?.length === 0) {
    return {
      message: 'Pendaftaran belum dapat dilanjutkan. Jika pernah mendaftar, coba masuk atau periksa email konfirmasi Anda.',
      values: { name, email },
      revision: previousState.revision + 1,
    };
  }

  if (!data.session) {
    redirect('/login?success=Periksa%20email%20Anda%20untuk%20mengonfirmasi%20akun%2C%20lalu%20masuk.');
  }

  redirect('/dashboard');
}

export async function signIn(formData: FormData) {
  const email = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase();
  const password = String(formData.get('password') ?? '');
  const selectedRole = String(formData.get('role') ?? '');
  if (selectedRole !== 'teacher' && selectedRole !== 'student') {
    redirect('/login?error=Pilih%20peran%20akun%20Anda.');
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) {
    console.error('signIn failed', { code: error?.code, status: error?.status });
    redirect(`/login?error=${encodeURIComponent(authErrorMessage(error?.code, 'login'))}`);
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single();
  if (!profile || (profile.role !== 'teacher' && profile.role !== 'student')) {
    await supabase.auth.signOut();
    redirect('/login?error=Profil%20pengguna%20tidak%20valid.');
  }
  if (profile.role !== selectedRole) {
    await supabase.auth.signOut();
    const roleLabel = profile.role === 'teacher' ? 'guru' : 'siswa';
    const params = new URLSearchParams({
      error: `Akun ini terdaftar sebagai ${roleLabel}. Pilih role tersebut lalu masuk kembali.`,
      role: profile.role,
    });
    redirect(`/login?${params.toString()}`);
  }
  redirect(profile.role === 'teacher' ? '/teacher/assessment' : '/dashboard');
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
