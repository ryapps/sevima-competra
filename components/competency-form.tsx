"use client";

import { useActionState, useState } from "react";

import {
  saveCompetency,
  type CompetencyState,
  type CompetencyValues,
} from "@/app/actions/competencies";
import { Button, InlineAlert, InputField, SelectField, TextareaField } from "@/components/ui";

export type CompetencyOption = {
  id: string;
  name: string;
  description: string;
  industryTarget: number;
};

const emptyValues: CompetencyValues = { id: "", name: "", description: "", industryTarget: "" };

function valuesFromCompetency(competency?: CompetencyOption): CompetencyValues {
  return competency
    ? {
        id: competency.id,
        name: competency.name,
        description: competency.description,
        industryTarget: String(competency.industryTarget),
      }
    : emptyValues;
}

export function CompetencyForm({
  competencies,
  initialCompetency,
}: {
  competencies: CompetencyOption[];
  initialCompetency?: CompetencyOption;
}) {
  const initialValues = valuesFromCompetency(initialCompetency);
  const [state, formAction, pending] = useActionState<CompetencyState, FormData>(saveCompetency, {
    values: initialValues,
    revision: 0,
  });
  return <CompetencyFormFields key={state.revision} competencies={competencies} state={state} formAction={formAction} pending={pending} />;
}

function CompetencyFormFields({ competencies, state, formAction, pending }: {
  competencies: CompetencyOption[];
  state: CompetencyState;
  formAction: (form: FormData) => void;
  pending: boolean;
}) {
  const [values, setValues] = useState<CompetencyValues>(state.values);

  function chooseCompetency(id: string) {
    setValues(valuesFromCompetency(competencies.find((item) => item.id === id)));
  }

  function updateText(field: Exclude<keyof CompetencyValues, "id">, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  return (
    <section
      aria-labelledby="competency-form-title"
      className="mt-6 border-y border-[var(--border)] bg-[var(--surface)] px-4 py-6 sm:rounded-[var(--radius-medium)] sm:border sm:px-6"
      id="competency-form"
    >
      <div className="mb-5">
        <h2 className="text-lg font-semibold leading-7" id="competency-form-title">Tambah atau edit kompetensi</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">Acuan sekolah digunakan pada profil kompetensi. Target role industri dihitung terpisah.</p>
      </div>

      <form action={formAction} className="grid gap-5" noValidate>
        {state.message ? <InlineAlert variant={state.ok ? "success" : "error"}>{state.message}</InlineAlert> : null}

        <SelectField
          disabled={pending}
          error={state.fieldErrors?.id}
          id="competency-id"
          label="Data yang dikelola"
          name="id"
          onChange={(event) => chooseCompetency(event.target.value)}
          options={competencies.map((item) => ({ label: item.name, value: item.id }))}
          placeholder="Tambah kompetensi baru"
          value={values.id}
        />

        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_160px]">
          <InputField
            disabled={pending}
            error={state.fieldErrors?.name}
            id="competency-name"
            label="Nama kompetensi"
            maxLength={100}
            name="name"
            onChange={(event) => updateText("name", event.target.value)}
            placeholder="Contoh: Pemrograman Web"
            required
            value={values.name}
          />
          <InputField
            disabled={pending}
            error={state.fieldErrors?.industryTarget}
            helper="0–100"
            id="industry-target"
            inputMode="numeric"
            label="Acuan sekolah"
            max={100}
            min={0}
            name="industryTarget"
            onChange={(event) => updateText("industryTarget", event.target.value)}
            required
            step={1}
            type="number"
            value={values.industryTarget}
          />
        </div>

        <TextareaField
          disabled={pending}
          error={state.fieldErrors?.description}
          helper="Opsional, maksimal 500 karakter."
          id="competency-description"
          label="Deskripsi"
          maxLength={500}
          name="description"
          onChange={(event) => updateText("description", event.target.value)}
          placeholder="Jelaskan ruang lingkup kompetensi…"
          value={values.description}
        />

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button disabled={pending} onClick={() => setValues(emptyValues)} type="button" variant="secondary">
            Form baru
          </Button>
          <Button className="sm:w-auto" loading={pending} size="mobile" type="submit">
            {values.id ? "Simpan perubahan" : "Tambah kompetensi"}
          </Button>
        </div>
      </form>
    </section>
  );
}
