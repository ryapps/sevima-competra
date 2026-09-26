// Provider codes: https://supabase.com/docs/guides/auth/debugging/error-codes
export function authErrorMessage(code: string | undefined, operation: "register" | "login") {
  switch (code) {
    case "email_exists":
    case "user_already_exists":
      return "Email ini sudah terdaftar. Silakan masuk dengan akun tersebut.";
    case "email_address_invalid":
      return "Alamat email tidak didukung layanan autentikasi. Gunakan alamat email aktif yang valid.";
    case "email_address_not_authorized":
      return "Layanan email belum mengizinkan pengiriman ke alamat ini. Hubungi pengelola untuk mengatur SMTP Supabase.";
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return "Terlalu banyak permintaan. Tunggu beberapa menit sebelum mencoba kembali.";
    case "email_not_confirmed":
      return "Email belum dikonfirmasi. Buka tautan konfirmasi di email Anda sebelum masuk.";
    case "signup_disabled":
    case "email_provider_disabled":
      return "Pendaftaran email sedang dinonaktifkan. Hubungi pengelola.";
    case "weak_password":
      return "Kata sandi belum memenuhi kebijakan keamanan. Gunakan kombinasi yang lebih kuat.";
    case "invalid_credentials":
      return "Email atau kata sandi tidak valid.";
    default:
      return operation === "register" ? "Pendaftaran belum dapat diproses oleh layanan autentikasi. Coba lagi atau hubungi pengelola; ini tidak berarti email sudah terdaftar." : "Layanan masuk belum dapat memproses permintaan. Coba lagi beberapa saat.";
  }
}
