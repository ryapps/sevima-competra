import type { CompetencyStatus } from "@/components/ui";

export type DemoCompetency = {
  id: string;
  name: string;
  description: string;
  target: number;
  score: number | null;
  status: CompetencyStatus;
};

export const demoCompetencies: DemoCompetency[] = [
  {
    id: "30000000-0000-0000-0000-000000000001",
    name: "HTML Semantik",
    description: "Menyusun struktur halaman yang bermakna dan mudah diakses.",
    target: 80,
    score: null,
    status: "unassessed",
  },
  {
    id: "30000000-0000-0000-0000-000000000002",
    name: "CSS Responsif",
    description: "Membangun tata letak yang tetap jelas pada desktop dan perangkat mobile.",
    target: 80,
    score: null,
    status: "unassessed",
  },
  {
    id: "30000000-0000-0000-0000-000000000003",
    name: "JavaScript dan DOM",
    description: "Menerapkan logika interaksi antarmuka dengan JavaScript.",
    target: 75,
    score: null,
    status: "unassessed",
  },
  {
    id: "30000000-0000-0000-0000-000000000004",
    name: "Git dan Kolaborasi",
    description: "Mengelola perubahan kode dan berkolaborasi melalui version control.",
    target: 70,
    score: null,
    status: "unassessed",
  },
  {
    id: "30000000-0000-0000-0000-000000000005",
    name: "Basis Data SQL",
    description: "Merancang dan menggunakan basis data relasional untuk aplikasi.",
    target: 75,
    score: null,
    status: "unassessed",
  },
];
