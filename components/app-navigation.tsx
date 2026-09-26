"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { AppRole } from "@/lib/auth";

const studentItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/competencies", label: "Kompetensi" },
  { href: "/portfolio", label: "Portofolio" },
];

const teacherItems = [
  { href: "/teacher/assessment", label: "Penilaian" },
  { href: "/competencies", label: "Kompetensi" },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppNavigation({ role }: { role: AppRole }) {
  const pathname = usePathname();
  const items = role === "teacher" ? teacherItems : studentItems;

  return (
    <nav aria-label="Navigasi utama" className="flex gap-1 overflow-x-auto md:grid md:gap-1">
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            aria-current={active ? "page" : undefined}
            className={active
              ? "flex h-10 shrink-0 items-center rounded-[var(--radius-medium)] bg-blue-50 px-3 text-sm font-semibold text-[var(--primary)]"
              : "flex h-10 shrink-0 items-center rounded-[var(--radius-medium)] px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-[var(--foreground)]"}
            href={item.href}
            key={item.href}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
