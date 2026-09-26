import { CompetencyMobileRow, DataTable, type DataTableColumn } from "@/components/product";
import { PageHeader, Screen } from "@/components/screen";
import { Button, SelectField, StatusBadge } from "@/components/ui";
import { requireProfile } from "@/lib/auth";
import { demoCompetencies, type DemoCompetency } from "@/lib/demo-data";

export default async function CompetenciesPage() {
  const profile = await requireProfile();
  const teacher = profile.role === "teacher";
  const columns: Array<DataTableColumn<DemoCompetency>> = [
    {
      key: "name",
      header: "Kompetensi",
      render: (row) => <div><p className="font-medium">{row.name}</p><p className="mt-0.5 max-w-xl text-xs text-[var(--muted)]">{row.description}</p></div>,
    },
    { key: "target", header: "Target", align: "right", render: (row) => <span className="tabular-nums">{row.target}</span> },
    { key: "score", header: "Nilai", align: "right", render: (row) => <span className="tabular-nums">{row.score ?? "—"}</span> },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
    ...(teacher ? [{ key: "action", header: "Aksi", align: "right" as const, render: () => <button className="h-11 text-sm font-semibold text-[var(--primary)]">Edit</button> }] : []),
  ];

  return (
    <Screen>
      <PageHeader
        action={teacher ? <Button>Tambah kompetensi</Button> : undefined}
        description={teacher ? "Kelola target industri yang menjadi acuan penilaian siswa." : "Bandingkan nilai praktikmu dengan target industri pada setiap kompetensi."}
        eyebrow={teacher ? "Data kompetensi" : "Rekam kompetensi"}
        title="Kompetensi"
      />

      <div className="mt-6 max-w-xs">
        <SelectField defaultValue="all" id="status-filter" label="Filter status" options={[{ label: "Semua status", value: "all" }, { label: "Kompeten", value: "competent" }, { label: "Skill Gap", value: "gap" }, { label: "Belum dinilai", value: "unassessed" }]} />
      </div>
      <p className="mt-5 text-xs font-medium text-[var(--muted)]">Menampilkan {demoCompetencies.length} kompetensi</p>

      <div className="mt-3 hidden md:block"><DataTable caption="Daftar kompetensi" columns={columns} emptyMessage="Belum ada kompetensi." rows={demoCompetencies} /></div>
      <div className="mt-3 border-y border-[var(--border)] bg-[var(--surface)] md:hidden">
        {demoCompetencies.map((item) => <CompetencyMobileRow action={teacher ? <button className="h-11 text-sm font-semibold text-[var(--primary)]">Edit kompetensi</button> : undefined} key={item.id} name={item.name} score={item.score} status={item.status} target={item.target} />)}
      </div>
    </Screen>
  );
}
