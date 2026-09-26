# Competra

Competra adalah platform **Competency Intelligence untuk siswa SMK** yang membantu guru memantau perkembangan kompetensi praktik, menilai evidence hasil tugas, menganalisis skill gap, dan melihat kesiapan siswa terhadap kebutuhan industri.

## Demo Account

### Siswa

- **Email:** `siswa@competra.id`
- **Password:** `DemoSiswa123!`

### Guru

- **Email:** `guru@competra.id`
- **Password:** `DemoGuru123!`

## Alur Testing yang Disarankan

### 1. Login sebagai Guru

Gunakan akun guru:

```text
Email: guru@competra.id
Password: DemoGuru123!
```

Lakukan pengujian berikut:

1. Login ke aplikasi.
2. Buka daftar siswa.
3. Pilih salah satu siswa.
4. Buka kompetensi atau assessment siswa.
5. Berikan atau perbarui nilai kompetensi.
6. Simpan penilaian.
7. Pastikan perubahan nilai tersimpan dan memengaruhi progress kompetensi siswa.

### 2. Login sebagai Siswa

Logout dari akun guru, lalu gunakan akun siswa:

```text
Email: siswa@competra.id
Password: DemoSiswa123!
```

Lakukan pengujian berikut:

1. Buka dashboard.
2. Lihat perkembangan kompetensi.
3. Periksa skill yang sudah memenuhi target dan yang masih memiliki gap.
4. Buka halaman portofolio.
5. Tambahkan atau lihat evidence proyek/praktik yang tersedia.
6. Periksa perubahan skill match atau readiness jika fitur tersebut tersedia.

## Fitur Utama

| Fitur | Pengguna | Fungsi |
|---|---|---|
| Competency Tracker | Guru & Siswa | Memantau nilai dan perkembangan kompetensi siswa |
| Assessment | Guru & Siswa | Guru membuat/menilai assessment dan siswa mengirim evidence |
| Portfolio Evidence | Siswa | Menyimpan bukti proyek, praktik, atau hasil pekerjaan |
| Skill Gap Analysis | Guru & Siswa | Membandingkan kemampuan siswa dengan target kompetensi industri |
| Dashboard | Guru & Siswa | Menampilkan progress, skill gap, dan ringkasan kompetensi |

## Core Workflow

```text
Guru membuat / memberikan assessment
        ↓
Siswa mengirim evidence
        ↓
Guru melakukan penilaian
        ↓
Nilai memperbarui profil kompetensi
        ↓
Sistem menghitung skill gap
        ↓
Dashboard menampilkan progress dan readiness
```

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js |
| UI | Tailwind CSS + shadcn/ui |
| Authentication | Supabase Auth |
| Database | Supabase PostgreSQL Cloud |
| Storage | Supabase Storage |
| Deployment | Vercel |

## Local Setup

Clone repository:

```bash
git clone [REPOSITORY_URL]
cd competra
npm install
```

Buat file `.env.local` dan isi environment variable Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Jika project menggunakan environment variable tambahan, isi sesuai konfigurasi project.

Jalankan development server:

```bash
npm run dev
```

Buka:

```text
http://localhost:3000
```

## Supabase

Project menggunakan **Supabase Cloud**, sehingga tidak memerlukan:

- Docker
- PostgreSQL lokal
- Supabase lokal
- `supabase db reset`

Pastikan environment variable mengarah ke project Supabase yang digunakan oleh Competra.

## Catatan untuk Penguji

Untuk pengujian tercepat, gunakan aplikasi production/deployment jika URL demo tersedia.

Urutan demo yang direkomendasikan:

```text
Login Guru
→ Nilai Kompetensi Siswa
→ Logout
→ Login Siswa
→ Lihat Progress
→ Lihat Skill Gap
→ Lihat / Tambahkan Portfolio
```

## Known Limitations

Competra masih berada dalam scope MVP hackathon. Beberapa fitur lanjutan seperti monitoring PKL, integrasi langsung dengan perusahaan, rekomendasi AI, dan analitik kompetensi tingkat sekolah belum menjadi bagian dari core MVP.

## Author

**Mohammad Dhiriyan Firdaus**
