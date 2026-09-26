export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl items-center px-4 py-16 sm:px-8">
      <section aria-labelledby="page-title" className="space-y-4">
        <p className="text-sm font-semibold text-blue-700">Peta Kompetensi SMK</p>
        <h1 id="page-title" className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Kesiapan kompetensi yang berbasis bukti.
        </h1>
        <p className="max-w-2xl text-base leading-7 text-slate-600">
          Catat penilaian praktik, lihat prioritas skill gap, dan hubungkan proyek siswa dengan
          kompetensi yang relevan.
        </p>
      </section>
    </main>
  );
}
