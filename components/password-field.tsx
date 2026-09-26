"use client";

import { useState, type ComponentProps } from "react";
import { Eye, EyeOff } from "lucide-react";

import { InputField } from "@/components/ui";

type PasswordFieldProps = Omit<
  ComponentProps<typeof InputField>,
  "endAdornment" | "type"
>;

export function PasswordField({
  id,
  label,
  ...props
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <InputField
      {...props}
      endAdornment={
        <button
          aria-controls={id}
          aria-label={
            visible
              ? `Sembunyikan ${label.toLowerCase()}`
              : `Tampilkan ${label.toLowerCase()}`
          }
          aria-pressed={visible}
          className="grid size-8 place-items-center rounded-[var(--radius-small)] text-[var(--muted)] transition-colors hover:bg-blue-50 hover:text-[var(--primary)]"
          onClick={() => setVisible((current) => !current)}
          type="button"
        >
          {visible ? (
            <EyeOff className="size-4" aria-hidden="true" />
          ) : (
            <Eye className="size-4" aria-hidden="true" />
          )}
        </button>
      }
      id={id}
      label={label}
      type={visible ? "text" : "password"}
    />
  );
}