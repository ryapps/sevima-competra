"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { AssessmentIcon, CompetencyIcon, DashboardIcon, PortfolioIcon } from "@/components/icons";
import type { AppRole } from "@/lib/auth";

const studentItems = [
  { href: "/dashboard", label: "Dashboard", icon: DashboardIcon },
  { href: "/competencies", label: "Kompetensi", icon: CompetencyIcon },
  { href: "/portfolio", label: "Portofolio", icon: PortfolioIcon },
];

const teacherItems = [
  { href: "/teacher/assessment", label: "Penilaian", icon: AssessmentIcon },
  { href: "/competencies", label: "Kompetensi", icon: CompetencyIcon },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppNavigation({ role, mobile = false }: { role: AppRole; mobile?: boolean }) {
  const pathname = usePathname();
  const items = role === "teacher" ? teacherItems : studentItems;

  return (
    <nav
      aria-label="Navigasi utama"
      className={mobile ? `grid gap-1 ${items.length === 3 ? "grid-cols-3" : "grid-cols-2"}` : "grid gap-1"}
    >
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        const Icon = item.icon;
        return (
          <Link
            aria-current={active ? "page" : undefined}
            className={`${mobile ? "h-12 flex-col justify-center gap-0.5 px-2 text-[11px]" : "h-10 gap-3 px-3 text-sm"} flex items-center rounded-[var(--radius-medium)] transition-colors ${
              active
                ? "bg-blue-50 font-semibold text-[var(--primary)]"
                : "font-medium text-slate-700 hover:bg-slate-50 hover:text-[var(--foreground)]"
            }`}
            href={item.href}
            key={item.href}
          >
            <Icon className={mobile ? "size-5" : "size-[18px]"} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
