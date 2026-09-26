import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BookOpenCheck,
  BriefcaseBusiness,
  Check,
  ChevronRight,
  ClipboardCheck,
  Code2,
  ExternalLink,
  FileCheck2,
  GraduationCap,
  Layers3,
  Menu,
  PackageCheck,
  Target,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';

const steps = [
  { number: '01', title: 'Assessment', body: 'Guru menyusun tugas praktik dan memilih kompetensi yang diukur.' },
  { number: '02', title: 'Evidence', body: 'Siswa mengirim proyek atau hasil praktik sebagai bukti kerja.' },
  { number: '03', title: 'Competency', body: 'Penilaian memperbarui profil kompetensi dengan sumber yang jelas.' },
  { number: '04', title: 'Skill gap', body: 'Kesenjangan terhadap target terlihat, bukan sekadar tersimpan sebagai angka.' },
  { number: '05', title: 'Readiness', body: 'Kemajuan dibandingkan dengan simulasi kebutuhan role industri.' },
];

const skills = [
  { name: 'JavaScript', score: 88, status: 'Kuat', tone: 'green' },
  { name: 'REST API', score: 82, status: 'Kuat', tone: 'green' },
  { name: 'PostgreSQL', score: 64, status: 'Perlu ditingkatkan', tone: 'amber' },
  { name: 'Docker', score: 45, status: 'Prioritas', tone: 'coral' },
];

const features = [
  {
    id: 'assessment',
    label: '01 / PENILAIAN',
    title: 'Assessment Management',
    body: 'Guru membuat tugas praktik dan mengaitkannya dengan kompetensi yang ingin diukur.',
    icon: ClipboardCheck,
    preview: 'assessment',
  },
  {
    id: 'evidence',
    label: '02 / BUKTI KERJA',
    title: 'Portfolio Evidence',
    body: 'Proyek siswa terhubung langsung dengan kompetensi, lengkap dengan tautan bukti.',
    icon: FileCheck2,
    preview: 'evidence',
  },
  {
    id: 'tracker',
    label: '03 / PROFIL SKILL',
    title: 'Competency Tracker',
    body: 'Perkembangan terlihat dalam satu profil yang bersumber dari assessment terbaru.',
    icon: Layers3,
    preview: 'tracker',
  },
  {
    id: 'gaps',
    label: '04 / PRIORITAS',
    title: 'Skill Gap Analysis',
    body: 'Bandingkan kemampuan dan target agar langkah peningkatan lebih terarah.',
    icon: Target,
    preview: 'gaps',
  },
  {
    id: 'readiness',
    label: '05 / ARAH KARIER',
    title: 'Career Readiness',
    body: 'Lihat kesiapan terhadap role simulasi seperti Frontend atau Backend Developer.',
    icon: BriefcaseBusiness,
    preview: 'readiness',
  },
];

function Brand({ light = false }: { light?: boolean }) {
  return (
    <Link
      aria-label="Competra, beranda"
      className={`inline-flex items-center gap-2.5 ${light ? 'text-white' : 'text-[#172033]'}`}
      href="/"
    >
      <span className={`grid size-9 place-items-center rounded-[10px] ${light ? 'bg-white text-[#2457c5]' : 'bg-[#2457c5] text-white'}`}>
        <span className="text-base font-black leading-none">C</span>
      </span>
      <span className="text-lg font-bold tracking-[-0.02em]">Competra</span>
    </Link>
  );
}

function SectionEyebrow({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return <p className={`mb-4 text-xs font-bold uppercase tracking-[0.12em] ${light ? 'text-blue-200' : 'text-[#2457c5]'}`}>{children}</p>;
}

function ReadinessRing({ small = false }: { small?: boolean }) {
  return (
    <div
      aria-label="Industry Readiness 74 persen"
      className={`relative grid shrink-0 place-items-center rounded-full ${small ? 'size-[92px]' : 'size-36'}`}
      style={{ background: 'conic-gradient(#2457c5 0deg 266deg, #dce5f4 266deg 360deg)' }}
    >
      <div className={`grid place-items-center rounded-full bg-white ${small ? 'size-[76px]' : 'size-[116px]'}`}>
        <span className={`font-bold leading-none tracking-[-0.05em] text-[#172033] ${small ? 'text-2xl' : 'text-[38px]'}`}>
          74<span className="text-base">%</span>
        </span>
      </div>
    </div>
  );
}

function SkillRows({ compact = false }: { compact?: boolean }) {
  return (
    <div className="grid gap-3.5">
      {skills.map((skill) => (
        <div
          className="grid grid-cols-[minmax(82px,1fr)_2fr_34px] items-center gap-3"
          key={skill.name}
        >
          <span className={`truncate text-xs ${compact ? 'text-slate-600' : 'text-[#384358]'}`}>{skill.name}</span>
          <div
            aria-label={`${skill.name}: ${skill.score} dari 100`}
            className="h-2 overflow-hidden rounded-full bg-[#e9edf3]"
          >
            <span
              className={`block h-full rounded-full ${skill.score >= 80 ? 'bg-[#2f8b63]' : skill.score >= 60 ? 'bg-[#d49432]' : 'bg-[#df7258]'}`}
              style={{ width: `${skill.score}%` }}
            />
          </div>
          <span className="text-right text-xs font-bold tabular-nums text-[#172033]">{skill.score}</span>
        </div>
      ))}
    </div>
  );
}

function HeroDashboard() {
  return (
    <div className="relative mx-auto w-full max-w-[550px] lg:mr-0">
      <div
        aria-hidden="true"
        className="absolute -right-5 -top-5 size-28 border-r border-t border-[#b9c9e0]"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-5 -left-5 size-28 border-b border-l border-[#b9c9e0]"
      />
      <div className="relative overflow-hidden rounded-[14px] border border-[#dce2ea] bg-white shadow-[0_22px_60px_rgba(25,42,69,0.12)]">
        <div className="flex h-12 items-center justify-between border-b border-[#edf0f4] px-4 sm:px-5">
          <div className="flex items-center gap-2">
            <span className="grid size-6 place-items-center rounded-md bg-[#2457c5] text-[10px] font-bold text-white">C</span>
            <span className="text-xs font-bold text-[#172033]">
              Competra <span className="font-normal text-[#8a93a2]">/ Profil siswa</span>
            </span>
          </div>
          <span className="flex items-center gap-1.5 rounded-full bg-[#f1f7f4] px-2.5 py-1 text-[10px] font-semibold text-[#28734f]">
            <span className="size-1.5 rounded-full bg-[#2f8b63]" /> Data terkini
          </span>
        </div>
        <div className="grid gap-5 p-4 sm:grid-cols-[1fr_1.05fr] sm:gap-6 sm:p-6">
          <div className="flex flex-col justify-between gap-5">
            <div>
              <p className="text-[11px] font-medium text-[#758095]">INDUSTRY READINESS</p>
              <div className="mt-4 flex items-center gap-3">
                <ReadinessRing small />
                <div>
                  <p className="text-xs font-semibold text-[#172033]">Backend Developer</p>
                  <p className="mt-1 text-[10px] leading-4 text-[#758095]">Simulasi target industri</p>
                  <p className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-[#28734f]">
                    <TrendingUp className="size-3" /> 3 kompetensi memenuhi target
                  </p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 border-t border-[#edf0f4] pt-4">
              <div>
                <p className="text-[10px] text-[#8790a0]">Cakupan evidence</p>
                <p className="mt-1 text-sm font-bold text-[#172033]">
                  4 <span className="text-[10px] font-medium text-[#8790a0]">dari 5</span>
                </p>
              </div>
              <div>
                <p className="text-[10px] text-[#8790a0]">Belum dinilai</p>
                <p className="mt-1 text-sm font-bold text-[#172033]">
                  1 <span className="text-[10px] font-medium text-[#8790a0]">kompetensi</span>
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-lg bg-[#f7f8fa] p-3.5 sm:p-4">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-xs font-bold text-[#172033]">Competency progress</p>
              <span className="text-[10px] text-[#8790a0]">4 kompetensi</span>
            </div>
            <SkillRows compact />
            <div className="mt-4 flex items-start gap-2 border-t border-[#e7ebf0] pt-3">
              <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-[#fff0e8] text-[#b75c41]">
                <ArrowDownRight className="size-3" />
              </span>
              <p className="text-[10px] leading-4 text-[#657084]">
                Prioritas berikutnya: <strong className="font-semibold text-[#384358]">latihan deployment dengan Docker.</strong>
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-[#edf0f4] bg-[#fbfcfd] px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="grid size-6 place-items-center rounded-full bg-[#e9effa] text-[10px] font-bold text-[#2457c5]">AR</span>
            <span className="text-[10px] text-[#606c7e]">Assessment terakhir · REST API</span>
          </div>
          <span className="text-[10px] font-bold text-[#28734f]">82 / 100</span>
        </div>
      </div>
      <div className="absolute -bottom-7 right-3 hidden items-center gap-2 rounded-lg border border-[#dce2ea] bg-white px-3 py-2.5 shadow-[0_8px_24px_rgba(25,42,69,0.08)] sm:flex">
        <span className="grid size-7 place-items-center rounded-full bg-[#eef5f0] text-[#28734f]">
          <BadgeCheck className="size-4" />
        </span>
        <span>
          <span className="block text-[10px] font-bold text-[#172033]">Evidence terhubung</span>
          <span className="block text-[9px] text-[#8790a0]">Sumber nilai dapat ditelusuri</span>
        </span>
      </div>
    </div>
  );
}

function FeaturePreview({ type }: { type: string }) {
  if (type === 'assessment') {
    return (
      <div className="mt-8 rounded-lg border border-[#dce2ea] bg-white p-4 shadow-[0_4px_15px_rgba(25,42,69,0.05)]">
        <div className="flex items-center justify-between border-b border-[#edf0f4] pb-3">
          <span className="text-xs font-bold text-[#263247]">Tugas praktik</span>
          <span className="rounded-full bg-[#edf3ff] px-2 py-1 text-[9px] font-semibold text-[#2457c5]">Draf</span>
        </div>
        <p className="mt-3 text-[11px] font-semibold text-[#263247]">Membangun REST API</p>
        <div className="mt-3 flex items-center justify-between text-[10px] text-[#748095]">
          <span>Kompetensi terkait</span>
          <span className="font-medium text-[#43516a]">API · Database</span>
        </div>
        <div className="mt-3 h-1.5 rounded-full bg-[#e9edf3]">
          <span className="block h-full w-2/3 rounded-full bg-[#2457c5]" />
        </div>
      </div>
    );
  }
  if (type === 'evidence') {
    return (
      <div className="mt-8 rounded-lg border border-[#dce2ea] bg-white p-4 shadow-[0_4px_15px_rgba(25,42,69,0.05)]">
        <div className="flex items-start gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-md bg-[#eef2f9] text-[#2457c5]">
            <Code2 className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-bold text-[#263247]">Sistem inventori sederhana</p>
            <p className="mt-1 text-[10px] text-[#748095]">GitHub · dikumpulkan 2 hari lalu</p>
          </div>
          <Check className="ml-auto size-4 shrink-0 text-[#2f8b63]" />
        </div>
        <div className="mt-4 flex flex-wrap gap-1.5">
          <span className="rounded bg-[#f1f4f8] px-2 py-1 text-[9px] text-[#536078]">REST API</span>
          <span className="rounded bg-[#f1f4f8] px-2 py-1 text-[9px] text-[#536078]">PostgreSQL</span>
        </div>
      </div>
    );
  }
  if (type === 'tracker') {
    return (
      <div className="mt-8 divide-y divide-[#edf0f4] rounded-lg border border-[#dce2ea] bg-white px-4 shadow-[0_4px_15px_rgba(25,42,69,0.05)]">
        {[
          { name: 'JavaScript', status: 'Kompeten', color: 'text-[#28734f] bg-[#eff7f1]' },
          { name: 'REST API', status: 'Skill Gap', color: 'text-[#9b6819] bg-[#fff7e8]' },
          { name: 'Docker', status: 'Belum dinilai', color: 'text-[#647084] bg-[#f2f4f6]' },
        ].map((row) => (
          <div
            className="flex items-center justify-between py-3"
            key={row.name}
          >
            <span className="text-[11px] font-medium text-[#384358]">{row.name}</span>
            <span className={`rounded px-2 py-1 text-[9px] font-semibold ${row.color}`}>{row.status}</span>
          </div>
        ))}
      </div>
    );
  }
  if (type === 'gaps') {
    return (
      <div className="mt-8 rounded-lg border border-[#dce2ea] bg-white p-4 shadow-[0_4px_15px_rgba(25,42,69,0.05)]">
        <div className="flex justify-between text-[10px] text-[#748095]">
          <span>Docker</span>
          <span>45 / target 75</span>
        </div>
        <div className="relative mt-3 h-2 rounded-full bg-[#e9edf3]">
          <span className="block h-full w-[45%] rounded-full bg-[#d49432]" />
          <span className="absolute -top-1 left-[75%] h-4 w-px bg-[#172033]" />
        </div>
        <p className="mt-3 flex items-center gap-1.5 text-[10px] font-semibold text-[#9b6819]">
          <ArrowDownRight className="size-3" /> Selisih 30 poin · prioritas 1
        </p>
      </div>
    );
  }
  return (
    <div className="mt-8 rounded-lg border border-[#dce2ea] bg-white p-4 shadow-[0_4px_15px_rgba(25,42,69,0.05)]">
      <div className="flex items-center gap-3">
        <ReadinessRing small />
        <div>
          <p className="text-[10px] text-[#748095]">ROLE SIMULASI</p>
          <p className="mt-1 text-xs font-bold text-[#263247]">Frontend Developer</p>
          <p className="mt-1 text-[10px] text-[#28734f]">Kesiapan diturunkan dari evidence</p>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="overflow-hidden bg-white text-[#172033]">
      <header className="sticky top-0 z-50 border-b border-[#e7ebf0]/80 bg-white/95 backdrop-blur-sm">
        <nav
          aria-label="Navigasi utama"
          className="mx-auto flex h-[68px] max-w-[1240px] items-center justify-between px-4 sm:px-8"
        >
          <Brand />
          <div className="hidden items-center gap-7 lg:flex">
            <a
              className="text-sm text-[#536078] transition-colors hover:text-[#2457c5]"
              href="#problem"
            >
              Problem
            </a>
            <a
              className="text-sm text-[#536078] transition-colors hover:text-[#2457c5]"
              href="#features"
            >
              Fitur
            </a>
            <a
              className="text-sm text-[#536078] transition-colors hover:text-[#2457c5]"
              href="#how"
            >
              Cara Kerja
            </a>
            <a
              className="text-sm text-[#536078] transition-colors hover:text-[#2457c5]"
              href="#audience"
            >
              Untuk Siapa
            </a>
          </div>
          <Link
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#2457c5] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#1c489f]"
            href="/login"
          >
            Masuk ke Aplikasi <ArrowUpRight className="size-4" />
          </Link>
          <a
            aria-label="Lihat konten"
            className="ml-2 grid size-10 place-items-center text-[#384358] lg:hidden"
            href="#problem"
          >
            <Menu className="size-5" />
          </a>
        </nav>
      </header>

      <section className="relative border-b border-[#e9edf2] bg-[#f7f9fc]">
        <div className="mx-auto grid max-w-[1240px] items-center gap-12 px-4 py-16 sm:px-8 sm:py-20 lg:min-h-[650px] lg:grid-cols-[0.92fr_1.08fr] lg:gap-16 lg:py-24">
          <div className="relative z-10">
            <SectionEyebrow>Competency Intelligence for Vocational Education</SectionEyebrow>
            <h1 className="max-w-[610px] text-[40px] font-bold leading-[1.08] tracking-[-0.045em] text-[#172033] sm:text-[52px]">
              Dari Nilai Praktik Menjadi <span className="text-[#2457c5]">Peta Kesiapan Industri</span>
            </h1>
            <p className="mt-6 max-w-[520px] text-base leading-7 text-[#5c687c]">Competra membantu sekolah memantau kompetensi siswa secara terstruktur, menemukan skill gap, dan melihat kesiapan siswa terhadap kebutuhan dunia kerja.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#2457c5] px-5 text-sm font-bold text-white shadow-[0_2px_5px_rgba(36,87,197,0.18)] transition-colors hover:bg-[#1c489f]"
                href="/login"
              >
                Coba Competra <ArrowRight className="size-4" />
              </Link>
              <a
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-[#d7dfe9] bg-white px-5 text-sm font-semibold text-[#344158] transition-colors hover:border-[#b7c5d8]"
                href="#how"
              >
                Lihat Cara Kerja <ChevronRight className="size-4" />
              </a>
            </div>
            <div className="mt-9 flex flex-wrap gap-x-5 gap-y-3 border-t border-[#e1e6ed] pt-5 text-xs font-medium text-[#5e6b7f]">
              {['Kompetensi terukur', 'Evidence-based assessment', 'Industry readiness'].map((point) => (
                <span
                  className="inline-flex items-center gap-1.5"
                  key={point}
                >
                  <Check className="size-3.5 text-[#2f8b63]" />
                  {point}
                </span>
              ))}
            </div>
          </div>
          <HeroDashboard />
        </div>
      </section>

      <section
        className="scroll-mt-20 py-20 sm:py-28"
        id="problem"
      >
        <div className="mx-auto max-w-[1240px] px-4 sm:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
            <div>
              <SectionEyebrow>Tantangan hari ini</SectionEyebrow>
              <h2 className="max-w-[440px] text-3xl font-bold leading-tight tracking-[-0.035em] sm:text-[40px]">Nilai saja belum cukup untuk menunjukkan kesiapan siswa.</h2>
            </div>
            <div className="divide-y divide-[#e6eaf0] border-y border-[#e6eaf0]">
              {[
                ['01', 'Perkembangan kompetensi sulit dipantau', 'Nilai praktik tersebar dan tidak menunjukkan perkembangan skill secara jelas.'],
                ['02', 'Bukti kompetensi tidak terhubung', 'Proyek dan hasil praktik siswa belum terhubung langsung dengan kompetensi yang dinilai.'],
                ['03', 'Gap dengan industri sulit terlihat', 'Sekolah kesulitan mengetahui apakah skill siswa sudah sesuai dengan kebutuhan dunia kerja.'],
              ].map(([number, title, body]) => (
                <article
                  className="grid gap-3 py-6 sm:grid-cols-[48px_1fr] sm:gap-4"
                  key={number}
                >
                  <span className="text-sm font-bold tabular-nums text-[#2457c5]">{number}</span>
                  <div>
                    <h3 className="text-base font-bold text-[#202c40]">{title}</h3>
                    <p className="mt-1.5 max-w-xl text-sm leading-6 text-[#647084]">{body}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        className="border-y border-[#e4e9f0] bg-[#f7f9fc] py-20 sm:py-28"
        id="flow"
      >
        <div className="mx-auto max-w-[1240px] px-4 sm:px-8">
          <div className="max-w-2xl">
            <SectionEyebrow>Satu alur yang terhubung</SectionEyebrow>
            <h2 className="text-3xl font-bold leading-tight tracking-[-0.035em] sm:text-[40px]">Dari assessment hingga industry readiness.</h2>
            <p className="mt-4 text-sm leading-6 text-[#647084]">Setiap langkah membangun konteks untuk langkah berikutnya, dengan bukti yang dapat ditelusuri.</p>
          </div>
          <div className="mt-12 grid border-y border-[#dfe5ed] md:grid-cols-5 md:divide-x md:divide-[#dfe5ed]">
            {steps.map((step, index) => (
              <article
                className="relative grid grid-rows-[auto_auto_1fr] gap-4 border-b border-[#dfe5ed] py-6 last:border-b-0 md:border-b-0 md:px-5 md:py-7 md:first:pl-0 md:last:pr-0"
                key={step.number}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold tabular-nums text-[#2457c5]">{step.number}</span>
                  {index < steps.length - 1 ? <ArrowRight className="hidden size-4 text-[#9aa5b5] md:block" /> : <Target className="hidden size-4 text-[#2457c5] md:block" />}
                </div>
                <h3 className="text-base font-bold text-[#202c40]">{step.title}</h3>
                <p className="max-w-[220px] text-xs leading-5 text-[#647084]">{step.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        className="scroll-mt-20 py-20 sm:py-28"
        id="features"
      >
        <div className="mx-auto max-w-[1240px] px-4 sm:px-8">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div className="max-w-2xl">
              <SectionEyebrow>Yang bisa dilakukan</SectionEyebrow>
              <h2 className="text-3xl font-bold leading-tight tracking-[-0.035em] sm:text-[40px]">Tools untuk membuat progres lebih terlihat.</h2>
            </div>
            <p className="max-w-sm text-sm leading-6 text-[#647084]">Bukan sekadar menyimpan nilai. Hubungkan tugas, bukti praktik, dan kompetensi dalam satu alur.</p>
          </div>
          <div className="mt-12 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <article
                  className="min-w-0"
                  key={feature.id}
                >
                  <div className="flex items-center gap-2 text-[10px] font-bold tracking-[0.1em] text-[#2457c5]">
                    <Icon className="size-4" />
                    {feature.label}
                  </div>
                  <h3 className="mt-3 text-lg font-bold text-[#202c40]">{feature.title}</h3>
                  <p className="mt-2 min-h-[48px] text-sm leading-6 text-[#647084]">{feature.body}</p>
                  <FeaturePreview type={feature.preview} />
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section
        className="overflow-hidden bg-[#172033] py-20 text-white sm:py-28"
        id="readiness"
      >
        <div className="mx-auto grid max-w-[1240px] items-center gap-12 px-4 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <SectionEyebrow light>Profil kesiapan berbasis bukti</SectionEyebrow>
            <h2 className="max-w-[500px] text-3xl font-bold leading-tight tracking-[-0.035em] sm:text-[40px]">Bukan sekadar tahu nilainya. Tahu apa yang harus ditingkatkan.</h2>
            <p className="mt-5 max-w-md text-sm leading-6 text-[#c0c9d7]">Ringkasan role memperlihatkan kekuatan, gap, dan prioritas latihan berdasarkan evidence yang sudah dinilai.</p>
            <a
              className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-blue-200"
              href="#how"
            >
              Pahami alurnya <ArrowRight className="size-4" />
            </a>
          </div>
          <div className="relative rounded-[12px] border border-white/15 bg-white p-5 text-[#172033] shadow-[0_22px_55px_rgba(0,0,0,0.2)] sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-5 border-b border-[#e7ebf0] pb-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#748095]">Role simulasi · target industri</p>
                <h3 className="mt-2 text-xl font-bold">Backend Developer Readiness</h3>
                <p className="mt-1 text-xs text-[#748095]">Contoh profil kompetensi siswa</p>
              </div>
              <div className="flex items-center gap-3">
                <ReadinessRing small />
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[#748095]">Overall match</p>
                  <p className="mt-1 text-sm font-bold">
                    74% <span className="font-normal text-[#748095]">· simulasi</span>
                  </p>
                </div>
              </div>
            </div>
            <div className="grid gap-8 py-6 md:grid-cols-[1.3fr_0.7fr]">
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-xs font-bold">Kompetensi terukur</p>
                  <span className="text-[10px] text-[#748095]">Nilai / 100</span>
                </div>
                <SkillRows />
              </div>
              <div className="grid content-start gap-5">
                <div>
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.1em] text-[#28734f]">Strong skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="rounded bg-[#eff7f1] px-2 py-1 text-[10px] font-medium text-[#28734f]">JavaScript</span>
                    <span className="rounded bg-[#eff7f1] px-2 py-1 text-[10px] font-medium text-[#28734f]">REST API</span>
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.1em] text-[#a56b1e]">Needs improvement</p>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="rounded bg-[#fff7e8] px-2 py-1 text-[10px] font-medium text-[#95601b]">PostgreSQL</span>
                    <span className="rounded bg-[#fff0e8] px-2 py-1 text-[10px] font-medium text-[#a6543b]">Docker</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg bg-[#f4f7fb] p-3.5">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-white text-[#2457c5]">
                <ArrowDownRight className="size-4" />
              </span>
              <p className="text-xs leading-5 text-[#536078]">
                Prioritas berikutnya: <strong className="text-[#263247]">latihan deployment menggunakan Docker.</strong>
              </p>
            </div>
            <p className="mt-4 text-[10px] leading-4 text-[#8a93a2]">Angka dan role pada contoh ini merupakan simulasi, bukan jaminan kesiapan kerja.</p>
          </div>
        </div>
      </section>

      <section
        className="scroll-mt-20 py-20 sm:py-28"
        id="audience"
      >
        <div className="mx-auto max-w-[1240px] px-4 sm:px-8">
          <div className="max-w-2xl">
            <SectionEyebrow>Dirancang untuk kolaborasi</SectionEyebrow>
            <h2 className="text-3xl font-bold leading-tight tracking-[-0.035em] sm:text-[40px]">Guru dan siswa, dalam konteks yang sama.</h2>
          </div>
          <div className="mt-10 grid border-y border-[#dfe5ed] md:grid-cols-2 md:divide-x md:divide-[#dfe5ed]">
            <article className="py-7 md:pr-10">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-lg bg-[#edf3ff] text-[#2457c5]">
                  <GraduationCap className="size-5" />
                </span>
                <h3 className="text-xl font-bold">Untuk Guru</h3>
              </div>
              <p className="mt-3 max-w-md text-sm leading-6 text-[#647084]">Pantau proses dan beri penilaian dengan evidence yang tetap terhubung ke kompetensi.</p>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {['Membuat assessment praktik', 'Memberikan feedback terarah', 'Memantau progress siswa', 'Melihat competency matrix', 'Mengenali skill gap'].map((item) => (
                  <li
                    className="flex items-center gap-2 text-xs text-[#43516a]"
                    key={item}
                  >
                    <Check className="size-3.5 text-[#2457c5]" />
                    {item}
                  </li>
                ))}
              </ul>
            </article>
            <article className="border-t border-[#dfe5ed] py-7 md:border-t-0 md:pl-10">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-lg bg-[#eff7f1] text-[#28734f]">
                  <BookOpenCheck className="size-5" />
                </span>
                <h3 className="text-xl font-bold">Untuk Siswa</h3>
              </div>
              <p className="mt-3 max-w-md text-sm leading-6 text-[#647084]">Pahami kekuatan dan prioritas peningkatan dari karya praktik yang sudah dinilai.</p>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {['Melihat perkembangan skill', 'Mengirim portfolio evidence', 'Mengetahui skill gap', 'Melihat career readiness', 'Menentukan prioritas belajar'].map((item) => (
                  <li
                    className="flex items-center gap-2 text-xs text-[#43516a]"
                    key={item}
                  >
                    <Check className="size-3.5 text-[#28734f]" />
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </div>
      </section>

      <section
        className="scroll-mt-20 border-y border-[#e4e9f0] bg-[#f7f9fc] py-20 sm:py-28"
        id="how"
      >
        <div className="mx-auto max-w-[1240px] px-4 sm:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <div>
              <SectionEyebrow>Mulai dari praktik</SectionEyebrow>
              <h2 className="text-3xl font-bold leading-tight tracking-[-0.035em] sm:text-[40px]">Empat langkah. Satu profil yang terus bertumbuh.</h2>
              <p className="mt-4 text-sm leading-6 text-[#647084]">Alur sederhana yang menjaga nilai selalu punya konteks dan sumber.</p>
            </div>
            <ol className="divide-y divide-[#dfe5ed] border-y border-[#dfe5ed]">
              {[
                { title: 'Guru membuat assessment', body: 'Pilih kompetensi dan jelaskan tugas praktik.' },
                { title: 'Siswa mengirim evidence', body: 'Hubungkan proyek atau hasil praktik yang dikerjakan.' },
                { title: 'Guru menilai hasil kerja', body: 'Berikan skor dan feedback pada bukti yang dikirim.' },
                { title: 'Profil kompetensi diperbarui', body: 'Skill profile dan industry readiness menampilkan hasil terbaru.' },
              ].map((item, index) => (
                <li
                  className="grid grid-cols-[52px_1fr] gap-4 py-5"
                  key={item.title}
                >
                  <span className="text-2xl font-bold leading-none tracking-[-0.04em] text-[#2457c5]">0{index + 1}</span>
                  <div>
                    <h3 className="text-sm font-bold">{item.title}</h3>
                    <p className="mt-1 text-xs leading-5 text-[#647084]">{item.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section
        className="py-16 sm:py-20"
        id="impact"
      >
        <div className="mx-auto max-w-[1240px] px-4 sm:px-8">
          <div className="max-w-xl">
            <SectionEyebrow>Relevan untuk masa depan</SectionEyebrow>
            <h2 className="text-3xl font-bold leading-tight tracking-[-0.035em] sm:text-[36px]">Mendukung pendidikan vokasi yang lebih relevan dan berkelanjutan.</h2>
          </div>
          <div className="mt-8 grid gap-6 border-t border-[#dfe5ed] pt-6 sm:grid-cols-2 sm:gap-12">
            <article className="flex gap-4">
              <span className="text-sm font-bold tabular-nums text-[#2457c5]">SDG 04</span>
              <div>
                <h3 className="text-sm font-bold">Quality Education</h3>
                <p className="mt-1 text-sm leading-6 text-[#647084]">Membantu pembelajaran berbasis kompetensi menjadi lebih terukur dan terlihat.</p>
              </div>
            </article>
            <article className="flex gap-4">
              <span className="text-sm font-bold tabular-nums text-[#2457c5]">SDG 08</span>
              <div>
                <h3 className="text-sm font-bold">Decent Work and Economic Growth</h3>
                <p className="mt-1 text-sm leading-6 text-[#647084]">Membantu siswa memahami keterampilan yang perlu dikuatkan untuk dunia kerja.</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="bg-[#edf3ff] py-16 sm:py-20">
        <div className="mx-auto flex max-w-[1240px] flex-col justify-between gap-8 px-4 sm:px-8 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <SectionEyebrow>Mulai dari satu praktik</SectionEyebrow>
            <h2 className="text-3xl font-bold leading-tight tracking-[-0.035em] sm:text-[40px]">Bangun kompetensi yang relevan. Siapkan siswa untuk dunia kerja.</h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-[#536078]">Mulai gunakan Competra untuk mengubah penilaian praktik menjadi insight kompetensi yang lebih bermakna.</p>
          </div>
          <div className="shrink-0">
            <Link
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#2457c5] px-5 text-sm font-bold text-white transition-colors hover:bg-[#1c489f] sm:w-auto"
              href="/login"
            >
              Masuk ke Competra <ArrowRight className="size-4" />
            </Link>
            <p className="mt-3 text-xs text-[#647084]">Dibangun untuk hackathon sebagai solusi monitoring kompetensi siswa SMK.</p>
          </div>
        </div>
      </section>

      <footer className="bg-[#172033] text-white">
        <div className="mx-auto grid max-w-[1240px] gap-8 px-4 py-9 sm:px-8 md:grid-cols-[1fr_auto_1fr] md:items-center">
          <div>
            <Brand light />
            <p className="mt-3 max-w-sm text-xs leading-5 text-[#b8c2d1]">Menyelaraskan kompetensi siswa SMK dengan kebutuhan industri.</p>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-[#d3d9e2]">
            <a
              className="inline-flex items-center gap-1.5 hover:text-white"
              href="https://github.com"
              rel="noreferrer"
              target="_blank"
            >
              <ExternalLink className="size-3.5" />
              GitHub <ExternalLink className="size-3" />
            </a>
            <Link
              className="inline-flex items-center gap-1.5 hover:text-white"
              href="/login"
            >
              Demo <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
          <p className="text-xs text-[#aab5c5] md:text-right">
            <PackageCheck className="mr-1 inline size-3.5" />
            Built with Next.js &amp; Supabase
          </p>
        </div>
        <div className="border-t border-white/10 px-4 py-4 text-center text-[10px] text-[#94a0b2]">Competra · Platform Competency Intelligence untuk siswa SMK</div>
      </footer>
    </main>
  );
}
