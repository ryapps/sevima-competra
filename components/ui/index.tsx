import Link from "next/link";
import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

function classes(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";
type ButtonSize = "small" | "default" | "mobile";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
};

const buttonVariants: Record<ButtonVariant, string> = {
  primary: "border-transparent bg-[var(--primary)] text-[var(--primary-foreground)] shadow-[var(--raised-shadow)] hover:bg-blue-800",
  secondary: "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] shadow-[var(--raised-shadow)] hover:border-slate-400 hover:bg-slate-50",
  ghost: "border-transparent bg-transparent text-[var(--primary)] hover:bg-blue-50",
  destructive: "border-transparent bg-[var(--destructive)] text-white hover:bg-red-800",
};

const buttonSizes: Record<ButtonSize, string> = {
  small: "h-8 px-3 text-xs",
  default: "h-10 px-4 text-sm",
  mobile: "h-11 w-full px-4 text-sm",
};

export function Button({
  className,
  variant = "primary",
  size = "default",
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      aria-busy={loading || undefined}
      className={classes(
        "inline-flex shrink-0 items-center justify-center gap-2 rounded-[var(--radius-medium)] border font-semibold transition-[background-color,border-color,color] disabled:cursor-not-allowed disabled:opacity-50",
        buttonVariants[variant],
        buttonSizes[size],
        className,
      )}
      disabled={disabled || loading}
    >
      {loading ? "Memproses…" : children}
    </button>
  );
}

type FieldFrameProps = {
  id: string;
  label: string;
  helper?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
};

function FieldFrame({ id, label, helper, error, required, children }: FieldFrameProps) {
  const messageId = helper || error ? `${id}-message` : undefined;
  return (
    <div className="grid gap-2">
      <label className="text-sm font-medium text-[var(--foreground)]" htmlFor={id}>
        {label}
        {required ? <span className="text-[var(--destructive)]"> *</span> : null}
      </label>
      {children}
      {messageId ? (
        <p
          className={classes("text-xs leading-[18px]", error ? "text-[var(--destructive)]" : "text-[var(--muted)]")}
          id={messageId}
        >
          {error ?? helper}
        </p>
      ) : null}
    </div>
  );
}

const fieldClassName =
  "w-full rounded-[var(--radius-medium)] border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--foreground)] shadow-[var(--raised-shadow)] transition-[border-color,box-shadow] placeholder:text-slate-400 hover:border-slate-400 focus:border-[var(--primary)] disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-70 aria-[invalid=true]:border-[var(--destructive)]";

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  helper?: string;
  error?: string;
};

export function InputField({ id, label, helper, error, required, className, ...props }: InputFieldProps) {
  return (
    <FieldFrame error={error} helper={helper} id={id} label={label} required={required}>
      <input
        {...props}
        aria-describedby={helper || error ? `${id}-message` : undefined}
        aria-invalid={Boolean(error)}
        className={classes(fieldClassName, "h-10", className)}
        id={id}
        required={required}
      />
    </FieldFrame>
  );
}

type TextareaFieldProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  id: string;
  label: string;
  helper?: string;
  error?: string;
};

export function TextareaField({ id, label, helper, error, required, className, ...props }: TextareaFieldProps) {
  return (
    <FieldFrame error={error} helper={helper} id={id} label={label} required={required}>
      <textarea
        {...props}
        aria-describedby={helper || error ? `${id}-message` : undefined}
        aria-invalid={Boolean(error)}
        className={classes(fieldClassName, "min-h-24 resize-y py-2", className)}
        id={id}
        required={required}
      />
    </FieldFrame>
  );
}

type SelectOption = { label: string; value: string };
type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  id: string;
  label: string;
  options: SelectOption[];
  placeholder?: string;
  helper?: string;
  error?: string;
};

export function SelectField({
  id,
  label,
  options,
  placeholder = "Pilih opsi",
  helper,
  error,
  required,
  className,
  ...props
}: SelectFieldProps) {
  return (
    <FieldFrame error={error} helper={helper} id={id} label={label} required={required}>
      <select
        {...props}
        aria-describedby={helper || error ? `${id}-message` : undefined}
        aria-invalid={Boolean(error)}
        className={classes(fieldClassName, "h-10", className)}
        id={id}
        required={required}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldFrame>
  );
}

type NavigationItemProps = {
  href: string;
  children: ReactNode;
  active?: boolean;
};

export function NavigationItem({ href, children, active = false }: NavigationItemProps) {
  return (
    <Link
      aria-current={active ? "page" : undefined}
      className={classes(
        "flex h-10 items-center rounded-[var(--radius-medium)] px-3 text-sm font-medium transition-colors",
        active ? "bg-blue-50 text-[var(--primary)]" : "text-slate-700 hover:bg-slate-50 hover:text-[var(--foreground)]",
      )}
      href={href}
    >
      {children}
    </Link>
  );
}

export type CompetencyStatus = "competent" | "gap" | "unassessed";

const statusContent: Record<CompetencyStatus, { label: string; className: string }> = {
  competent: { label: "Kompeten", className: "border-green-200 bg-[var(--success-tint)] text-[var(--success)]" },
  gap: { label: "Skill Gap", className: "border-amber-200 bg-[var(--warning-tint)] text-[var(--warning)]" },
  unassessed: { label: "Belum dinilai", className: "border-[var(--border)] bg-slate-50 text-[var(--muted)]" },
};

export function StatusBadge({ status }: { status: CompetencyStatus }) {
  const content = statusContent[status];
  return (
    <span className={classes("inline-flex h-6 items-center gap-1.5 rounded-[var(--radius-small)] border px-2 text-xs font-medium", content.className)}>
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current opacity-70" />
      {content.label}
    </span>
  );
}

type AlertVariant = "success" | "error" | "warning" | "info";
const alertClasses: Record<AlertVariant, string> = {
  success: "border-green-200 bg-[var(--success-tint)] text-[var(--success)]",
  error: "border-red-200 bg-[var(--destructive-tint)] text-[var(--destructive)]",
  warning: "border-amber-200 bg-[var(--warning-tint)] text-[var(--warning)]",
  info: "border-blue-200 bg-blue-50 text-[var(--primary)]",
};

export function InlineAlert({ variant, children }: { variant: AlertVariant; children: ReactNode }) {
  return (
    <div
      className={classes("rounded-[var(--radius-medium)] border border-l-[3px] px-3 py-3 text-sm", alertClasses[variant])}
      role={variant === "error" ? "alert" : "status"}
    >
      {children}
    </div>
  );
}
