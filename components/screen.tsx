import type { ReactNode } from "react";

export function Screen({ children }: { children: ReactNode }) {
  return <main className="mx-auto w-full max-w-[1200px] px-4 py-6 sm:px-6 md:px-8 md:py-10">{children}</main>;
}

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description: string;
  action?: ReactNode;
};

export function PageHeader({ eyebrow, title, description, action }: PageHeaderProps) {
  return (
    <header className="flex flex-col justify-between gap-5 border-b border-[var(--border)] pb-6 sm:flex-row sm:items-start">
      <div className="max-w-2xl">
        {eyebrow ? <p className="mb-1.5 text-xs font-semibold text-[var(--primary)]">{eyebrow}</p> : null}
        <h1 className="text-2xl font-bold leading-8 tracking-[-0.025em] md:text-[28px] md:leading-9">{title}</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">{description}</p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}

export function SectionHeader({ id, title, description }: { id?: string; title: string; description?: string }) {
  return (
    <div>
      <h2 className="text-lg font-semibold leading-7" id={id}>{title}</h2>
      {description ? <p className="mt-1 text-sm text-[var(--muted)]">{description}</p> : null}
    </div>
  );
}
