import { PortfolioForm } from "@/components/portfolio-form";
import { EmptyState, PortfolioItem } from "@/components/product";
import { PageHeader, Screen, SectionHeader } from "@/components/screen";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

function safeExternalUrl(value: string | null) {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? value : undefined;
  } catch {
    return undefined;
  }
}

export default async function PortfolioPage() {
  const profile = await requireProfile("student");
  const supabase = await createClient();
  const [competenciesResult, portfoliosResult, relationshipsResult] = await Promise.all([
    supabase.from("competencies").select("id,name").order("name"),
    supabase
      .from("portfolios")
      .select("id,title,description,project_url,evidence_url,created_at")
      .eq("student_id", profile.id)
      .order("created_at", { ascending: false }),
    supabase.from("portfolio_competencies").select("portfolio_id,competency_id"),
  ]);

  const queryFailed = competenciesResult.error || portfoliosResult.error || relationshipsResult.error;
  const competencies = (competenciesResult.data ?? []).map((item) => ({ id: item.id, name: item.name }));
  const competencyNames = new Map(competencies.map((item) => [item.id, item.name]));
  const relationships = new Map<string, string[]>();

  for (const item of relationshipsResult.data ?? []) {
    const name = competencyNames.get(item.competency_id);
    if (!name) continue;
    const names = relationships.get(item.portfolio_id) ?? [];
    names.push(name);
    relationships.set(item.portfolio_id, names);
  }

  const portfolios = (portfoliosResult.data ?? []).map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description ?? "",
    projectUrl: safeExternalUrl(item.project_url),
    evidenceUrl: safeExternalUrl(item.evidence_url),
    createdAt: item.created_at,
    competencies: (relationships.get(item.id) ?? []).sort((a, b) => a.localeCompare(b, "id")),
  }));

  return (
    <Screen>
      <PageHeader description="Simpan tautan proyek sebagai bukti penerapan kompetensi praktikmu." eyebrow="Bukti praktik" title="Portofolio" />

      {queryFailed ? (
        <div className="mt-8">
          <EmptyState description="Data portofolio belum dapat dimuat. Muat ulang halaman untuk mencoba lagi." title="Gagal memuat portofolio" />
        </div>
      ) : (
        <>
          {competencies.length ? (
            <PortfolioForm competencies={competencies} />
          ) : (
            <div className="mt-6 border-y border-[var(--border)]">
              <EmptyState description="Guru perlu menambahkan kompetensi sebelum proyek dapat ditautkan." title="Belum ada kompetensi" />
            </div>
          )}

          <section className="mt-8" aria-labelledby="portfolio-list-title">
            <SectionHeader
              description={`${portfolios.length} proyek tersimpan sebagai bukti praktik.`}
              id="portfolio-list-title"
              title="Bukti proyek"
            />
            <div className="mt-3 border-t border-[var(--border)]">
              {portfolios.length ? portfolios.map((item) => (
                <PortfolioItem
                  competencies={item.competencies}
                  date={dateFormatter.format(new Date(item.createdAt))}
                  description={item.description}
                  evidenceUrl={item.evidenceUrl}
                  key={item.id}
                  projectUrl={item.projectUrl}
                  title={item.title}
                />
              )) : (
                <EmptyState description="Tambahkan proyek yang menunjukkan kompetensi praktikmu." title="Belum ada bukti portofolio" />
              )}
            </div>
          </section>
        </>
      )}
    </Screen>
  );
}
