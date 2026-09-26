import Link from "next/link";
import type { ReactNode } from "react";

import { Button, type CompetencyStatus, StatusBadge } from "@/components/ui";

function classes(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export type DataTableColumn<Row> = {
  key: string;
  header: string;
  align?: "left" | "right";
  render: (row: Row) => ReactNode;
};

type DataTableProps<Row extends { id: string }> = {
  caption: string;
  columns: Array<DataTableColumn<Row>>;
  rows: Row[];
  emptyMessage: string;
};

export function DataTable<Row extends { id: string }>({ caption, columns, rows, emptyMessage }: DataTableProps<Row>) {
  return (
    <div className="overflow-x-auto border-y border-[var(--border)] bg-[var(--surface)] md:rounded-[var(--radius-medium)] md:border">
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead className="bg-slate-50 text-xs font-medium text-[var(--muted)]">
          <tr>
            {columns.map((column) => (
              <th className={classes("h-10 px-4", column.align === "right" && "text-right")} key={column.key} scope="col">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)]">
          {rows.length ? rows.map((row) => (
            <tr className="min-h-13 hover:bg-slate-50" key={row.id}>
              {columns.map((column) => (
                <td className={classes("px-4 py-3", column.align === "right" && "text-right")} key={column.key}>
                  {column.render(row)}
                </td>
              ))}
            </tr>
          )) : (
            <tr><td className="px-4 py-10 text-center text-[var(--muted)]" colSpan={columns.length}>{emptyMessage}</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

type CompetencyMobileRowProps = {
  name: string;
  score: number | null;
  target: number;
  status: CompetencyStatus;
  action?: ReactNode;
};

export function CompetencyMobileRow({ name, score, target, status, action }: CompetencyMobileRowProps) {
  return (
    <article className="border-b border-[var(--border)] py-4 last:border-b-0">
      <div className="flex items-start justify-between gap-4">
        <h3 className="font-semibold text-[var(--foreground)]">{name}</h3>
        <StatusBadge status={status} />
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
        <div><dt className="text-xs text-[var(--muted)]">Nilai</dt><dd className="mt-0.5 font-medium tabular-nums">{score ?? "—"}</dd></div>
        <div><dt className="text-xs text-[var(--muted)]">Target</dt><dd className="mt-0.5 font-medium tabular-nums">{target}</dd></div>
      </dl>
      {action ? <div className="mt-3">{action}</div> : null}
    </article>
  );
}

type SkillSummaryProps = {
  percentage?: number;
  competentCount?: number;
  totalCount?: number;
  unassessedCount?: number;
  href?: string;
  emptyMessage?: string;
};

export function SkillSummary({
  percentage,
  competentCount = 0,
  totalCount = 0,
  unassessedCount = 0,
  href = "/competencies",
  emptyMessage,
}: SkillSummaryProps) {
  const populated = percentage !== undefined && totalCount > 0;
  return (
    <section className="rounded-[var(--radius-large)] border border-[var(--border)] bg-[var(--surface)] p-6" aria-labelledby="skill-summary-title">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <h2 className="text-lg font-semibold leading-7" id="skill-summary-title">Ringkasan kesiapan</h2>
          {populated ? (
            <>
              <p className="mt-4 text-[32px] font-bold leading-10 tabular-nums">{percentage}%</p>
              <p className="mt-1 text-sm text-[var(--muted)]">{competentCount} dari {totalCount} kompetensi memenuhi target.</p>
              <p className="mt-1 text-xs text-[var(--muted)]">{unassessedCount} kompetensi belum dinilai dan tetap masuk penyebut.</p>
            </>
          ) : <p className="mt-3 max-w-xl text-sm text-[var(--muted)]">{emptyMessage ?? "Belum ada kompetensi untuk dihitung."}</p>}
        </div>
        <Link className="text-sm font-semibold text-[var(--primary)] hover:underline" href={href}>Lihat kompetensi</Link>
      </div>
    </section>
  );
}

type GapRowProps = { name: string; score: number; target: number; href?: string };
export function GapRow({ name, score, target, href }: GapRowProps) {
  const content = (
    <div className="flex min-h-13 items-center justify-between gap-4 border-b border-[var(--border)] py-3 last:border-b-0">
      <div><p className="font-medium">{name}</p><p className="text-xs text-[var(--muted)]">Nilai {score} · Target {target}</p></div>
      <span className="font-semibold tabular-nums text-[var(--warning)]">-{target - score}</span>
    </div>
  );
  return href ? <Link className="block focus-visible:rounded-[var(--radius-small)]" href={href}>{content}</Link> : content;
}

type PortfolioItemProps = {
  title: string;
  description: string;
  date: string;
  competencies: string[];
  projectUrl?: string;
  evidenceUrl?: string;
};

export function PortfolioItem({ title, description, date, competencies, projectUrl, evidenceUrl }: PortfolioItemProps) {
  return (
    <article className="border-b border-[var(--border)] py-5 last:border-b-0">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div className="max-w-3xl">
          <h3 className="font-semibold">{title}</h3>
          <p className="mt-1 text-sm text-[var(--muted)]">{description}</p>
          <ul className="mt-3 flex flex-wrap gap-2" aria-label="Kompetensi terkait">
            {competencies.map((competency) => <li className="rounded-[var(--radius-small)] border border-[var(--border)] px-2 py-0.5 text-xs" key={competency}>{competency}</li>)}
          </ul>
        </div>
        <time className="shrink-0 text-xs text-[var(--muted)]">{date}</time>
      </div>
      {projectUrl || evidenceUrl ? (
        <div className="mt-4 flex flex-wrap gap-4 text-sm font-medium text-[var(--primary)]">
          {projectUrl ? <a href={projectUrl} rel="noreferrer" target="_blank">Buka proyek ↗</a> : null}
          {evidenceUrl ? <a href={evidenceUrl} rel="noreferrer" target="_blank">Lihat bukti ↗</a> : null}
        </div>
      ) : null}
    </article>
  );
}

type DialogPanelProps = {
  title: string;
  description?: string;
  children: ReactNode;
  submitting?: boolean;
};

export function DialogPanel({ title, description, children, submitting = false }: DialogPanelProps) {
  return (
    <section
      aria-busy={submitting || undefined}
      aria-describedby={description ? "dialog-description" : undefined}
      aria-labelledby="dialog-title"
      aria-modal="true"
      className="min-h-screen w-full bg-[var(--surface)] p-6 sm:min-h-0 sm:max-w-xl sm:rounded-[var(--radius-medium)] sm:p-8 sm:shadow-[var(--dialog-shadow)]"
      role="dialog"
    >
      <h2 className="text-2xl font-bold leading-8" id="dialog-title">{title}</h2>
      {description ? <p className="mt-2 text-sm text-[var(--muted)]" id="dialog-description">{description}</p> : null}
      <div className="mt-6">{children}</div>
    </section>
  );
}

type EmptyStateProps = { title: string; description: string; action?: ReactNode };
export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <section className="mx-auto max-w-xl py-12 text-center">
      <h2 className="text-lg font-semibold leading-7">{title}</h2>
      <p className="mt-2 text-sm text-[var(--muted)]">{description}</p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </section>
  );
}

export function EmptyPortfolioState() {
  return <EmptyState action={<Button>Tambah bukti</Button>} description="Tambahkan proyek yang menunjukkan kompetensi praktikmu." title="Belum ada bukti portofolio" />;
}
