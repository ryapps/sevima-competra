"use client";

import Link from "next/link";
import { useActionState } from "react";

import { registerStudent, type RegisterState } from "@/app/actions/auth";
import { ArrowRightIcon } from "@/components/icons";
import { Button, InlineAlert, InputField } from "@/components/ui";

const initialState: RegisterState = { values: { name: "", email: "" }, revision: 0 };

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerStudent, initialState);

  return (
    <form action={formAction} className="mt-6 grid gap-4" noValidate>
      {state.message ? <InlineAlert variant="error">{state.message}</InlineAlert> : null}
      <InputField
        autoComplete="name"
        defaultValue={state.values.name}
        error={state.fieldErrors?.name}
        id="name"
        key={`name-${state.revision}`}
        label="Nama lengkap"
        maxLength={100}
        name="name"
        required
      />
      <InputField
        autoComplete="email"
        defaultValue={state.values.email}
        error={state.fieldErrors?.email}
        id="email"
        key={`email-${state.revision}`}
        label="Email"
        name="email"
        placeholder="nama@sekolah.id"
        required
        type="email"
      />
      <InputField
        autoComplete="new-password"
        error={state.fieldErrors?.password}
        helper="Minimal 8 karakter."
        id="password"
        key={`password-${state.revision}`}
        label="Kata sandi"
        minLength={8}
        name="password"
        required
        type="password"
      />
      <InputField
        autoComplete="new-password"
        error={state.fieldErrors?.confirmPassword}
        id="confirmPassword"
        key={`confirm-password-${state.revision}`}
        label="Konfirmasi kata sandi"
        minLength={8}
        name="confirmPassword"
        required
        type="password"
      />
      <Button className="mt-2" loading={pending} size="mobile" type="submit">
        Daftar sebagai siswa
      </Button>
      <p className="text-center text-sm text-[var(--muted)]">
        Sudah punya akun?{" "}
        <Link className="inline-flex items-center gap-0.5 font-semibold text-[var(--primary)] hover:underline" href="/login">
          Masuk <ArrowRightIcon className="size-4" />
        </Link>
      </p>
    </form>
  );
}
