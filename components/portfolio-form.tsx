"use client";

import { useActionState, useEffect, useState } from "react";

import {
  createPortfolio,
  type PortfolioState,
  type PortfolioValues,
} from "@/app/actions/portfolios";
import { PlusIcon } from "@/components/icons";
import { Button, InlineAlert, InputField, TextareaField } from "@/components/ui";

type CompetencyOption = { id: string; name: string };

const emptyValues: PortfolioValues = {
  title: "",
  description: "",
  projectUrl: "",
  evidenceUrl: "",
  competencyIds: [],
};

const initialState: PortfolioState = { values: emptyValues, revision: 0 };

export function PortfolioForm({ competencies }: { competencies: CompetencyOption[] }) {
  const [state, formAction, pending] = useActionState(createPortfolio, initialState);
  const [values, setValues] = useState<PortfolioValues>(emptyValues);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setValues(state.values);
    if (state.message) setOpen(true);
  }, [state.values, state.message]);

  function updateText(field: Exclude<keyof PortfolioValues, "competencyIds">, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function toggleCompetency(competencyId: string, checked: boolean) {
    setValues((current) => ({
      ...current,
      competencyIds: checked
        ? [...current.competencyIds, competencyId]
        : current.competencyIds.filter((id) => id !== competencyId),
    }));
  }

  return (
    <details
      className="group mt-6 border-y border-[var(--border)] bg-[var(--surface)] sm:rounded-[var(--radius-medium)] sm:border"
      onToggle={(event) => setOpen(event.currentTarget.open)}
      open={open}
    >
      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between px-4 font-semibold text-[var(--primary)] sm:px-6">
        <span className="inline-flex items-center gap-2"><PlusIcon className="size-4" />Tambah proyek</span>
        <span aria-hidden="true" className="text-xs font-medium text-[var(--muted)] group-open:hidden">Buka formulir</span>
        <span aria-hidden="true" className="hidden text-xs font-medium text-[var(--muted)] group-open:inline">Tutup</span>
      </summary>
      <form action={formAction} className="grid gap-5 border-t border-[var(--border)] px-4 py-6 sm:px-6" noValidate>
        {state.message ? <InlineAlert variant={state.ok ? "success" : "error"}>{state.message}</InlineAlert> : null}

        <InputField
          disabled={pending}
          error={state.fieldErrors?.title}
          id="title"
          label="Judul proyek"
          maxLength={120}
          name="title"
          onChange={(event) => updateText("title", event.target.value)}
          placeholder="Contoh: Website profil UMKM"
          required
          value={values.title}
        />
        <TextareaField
          disabled={pending}
          error={state.fieldErrors?.description}
          id="description"
          label="Deskripsi"
          maxLength={1000}
          name="description"
          onChange={(event) => updateText("description", event.target.value)}
          placeholder="Jelaskan kontribusi dan hasil proyek…"
          value={values.description}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <InputField
            disabled={pending}
            error={state.fieldErrors?.projectUrl}
            helper="Gunakan URL http atau https."
            id="project-url"
            label="URL proyek"
            name="projectUrl"
            onChange={(event) => updateText("projectUrl", event.target.value)}
            placeholder="https://…"
            type="url"
            value={values.projectUrl}
          />
          <InputField
            disabled={pending}
            error={state.fieldErrors?.evidenceUrl}
            helper="Repo, dokumentasi, atau bukti lainnya."
            id="evidence-url"
            label="URL bukti"
            name="evidenceUrl"
            onChange={(event) => updateText("evidenceUrl", event.target.value)}
            placeholder="https://…"
            type="url"
            value={values.evidenceUrl}
          />
        </div>
        <fieldset
          aria-describedby={state.fieldErrors?.competencyIds ? "competency-ids-error" : undefined}
          aria-invalid={Boolean(state.fieldErrors?.competencyIds)}
          disabled={pending}
        >
          <legend className="text-sm font-medium">
            Kompetensi terkait <span className="text-[var(--destructive)]">*</span>
            <span className="ml-2 text-xs font-normal text-[var(--muted)]">{values.competencyIds.length} dipilih</span>
          </legend>
          <div className="mt-2 grid gap-x-6 sm:grid-cols-2">
            {competencies.map((item) => (
              <label className="flex min-h-11 items-center gap-3 border-b border-[var(--border)] py-2 text-sm" key={item.id}>
                <input
                  checked={values.competencyIds.includes(item.id)}
                  className="size-4 accent-[var(--primary)]"
                  name="competencyIds"
                  onChange={(event) => toggleCompetency(item.id, event.target.checked)}
                  type="checkbox"
                  value={item.id}
                />
                {item.name}
              </label>
            ))}
          </div>
          {state.fieldErrors?.competencyIds ? (
            <p className="mt-2 text-xs text-[var(--destructive)]" id="competency-ids-error">{state.fieldErrors.competencyIds}</p>
          ) : null}
        </fieldset>
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            disabled={pending}
            onClick={() => setValues(emptyValues)}
            type="button"
            variant="secondary"
          >
            Bersihkan
          </Button>
          <Button className="sm:w-auto" loading={pending} size="mobile" type="submit">Simpan proyek</Button>
        </div>
      </form>
    </details>
  );
}
