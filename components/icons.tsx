import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function IconBase({ children, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" fill="none" height="18" viewBox="0 0 24 24" width="18" {...props}>
      {children}
    </svg>
  );
}

const stroke = { stroke: "currentColor", strokeLinecap: "round" as const, strokeLinejoin: "round" as const, strokeWidth: 1.8 };

export function DashboardIcon(props: IconProps) {
  return <IconBase {...props}><path d="M4 4h6v6H4zM14 4h6v4h-6zM14 12h6v8h-6zM4 14h6v6H4z" {...stroke} /></IconBase>;
}

export function CompetencyIcon(props: IconProps) {
  return <IconBase {...props}><path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" {...stroke} /></IconBase>;
}

export function PortfolioIcon(props: IconProps) {
  return <IconBase {...props}><path d="M4 7.5h16v11H4zM8 7.5V5h8v2.5M4 12h16M10 12v2h4v-2" {...stroke} /></IconBase>;
}

export function AssessmentIcon(props: IconProps) {
  return <IconBase {...props}><path d="M8 4h8M9 3v3m6-3v3M6 5h12v16H6zM9 11h6M9 15h6" {...stroke} /></IconBase>;
}

export function ArrowRightIcon(props: IconProps) {
  return <IconBase {...props}><path d="m9 6 6 6-6 6" {...stroke} /></IconBase>;
}

export function ExternalIcon(props: IconProps) {
  return <IconBase {...props}><path d="M14 5h5v5M19 5l-8 8M18 13v6H5V6h6" {...stroke} /></IconBase>;
}

export function PlusIcon(props: IconProps) {
  return <IconBase {...props}><path d="M12 5v14M5 12h14" {...stroke} /></IconBase>;
}

export function SignOutIcon(props: IconProps) {
  return <IconBase {...props}><path d="M10 5H5v14h5M14 8l4 4-4 4M8 12h10" {...stroke} /></IconBase>;
}
