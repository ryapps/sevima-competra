import assert from "node:assert/strict";
import test from "node:test";
import { authErrorMessage } from "../lib/auth-errors.ts";

for (const code of ["email_exists", "user_already_exists"]) {
  test(`${code}: known duplicate receives sign-in guidance`, () => {
    assert.equal(authErrorMessage(code, "register"), "Email ini sudah terdaftar. Silakan masuk dengan akun tersebut.");
  });
}

for (const code of [undefined, "unexpected_failure", "unrecognized_provider_code"]) {
  test(`${code ?? "missing code"}: unknown registration failure never asserts duplicate email`, () => {
    const message = authErrorMessage(code, "register");
    assert.match(message, /Pendaftaran belum dapat diproses/);
    assert.match(message, /ini tidak berarti email sudah terdaftar/);
    assert.doesNotMatch(message, /Email ini sudah terdaftar\./);
    assert.doesNotMatch(message, /unexpected_failure|unrecognized_provider_code/);
  });
}

test("SMTP restriction gives configuration guidance, not duplicate-email advice", () => {
  const message = authErrorMessage("email_address_not_authorized", "register");
  assert.match(message, /SMTP Supabase/);
  assert.match(message, /Hubungi pengelola/);
  assert.doesNotMatch(message, /sudah terdaftar/);
});

for (const code of ["over_email_send_rate_limit", "over_request_rate_limit"]) {
  test(`${code}: rate limit advises waiting`, () => {
    const message = authErrorMessage(code, "register");
    assert.match(message, /Terlalu banyak permintaan/);
    assert.match(message, /Tunggu beberapa menit/);
    assert.doesNotMatch(message, /sudah terdaftar/);
  });
}

test("invalid provider email has distinct actionable guidance", () => {
  const message = authErrorMessage("email_address_invalid", "register");
  assert.match(message, /alamat email aktif yang valid/);
  assert.doesNotMatch(message, /sudah terdaftar/);
});

test("unconfirmed email is not misreported as a bad password", () => {
  const message = authErrorMessage("email_not_confirmed", "login");
  assert.match(message, /Email belum dikonfirmasi/);
  assert.match(message, /tautan konfirmasi/);
  assert.doesNotMatch(message, /kata sandi tidak valid/);
});

for (const code of ["signup_disabled", "email_provider_disabled"]) {
  test(`${code}: disabled signup points to the administrator`, () => {
    assert.equal(authErrorMessage(code, "register"), "Pendaftaran email sedang dinonaktifkan. Hubungi pengelola.");
  });
}

test("weak-password feedback is specific", () => {
  assert.match(authErrorMessage("weak_password", "register"), /Kata sandi belum memenuhi kebijakan keamanan/);
});

test("invalid credentials preserve the generic login message", () => {
  assert.equal(authErrorMessage("invalid_credentials", "login"), "Email atau kata sandi tidak valid.");
});

test("unknown login failures do not assert bad credentials or duplicate email", () => {
  assert.equal(authErrorMessage("unexpected_failure", "login"), "Layanan masuk belum dapat memproses permintaan. Coba lagi beberapa saat.");
  assert.equal(authErrorMessage(undefined, "login"), authErrorMessage("unexpected_failure", "login"));
});
