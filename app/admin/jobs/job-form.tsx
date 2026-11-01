"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { createJob, updateJob } from "./actions";
import type { CategoryOption } from "./data";
import type { JobValues, FormState } from "./validation";
import styles from "../categories/categories.module.css";
import jobStyles from "./jobs.module.css";

export default function JobForm({ id, initialValues, categories }: {
  id?: string; initialValues: JobValues; categories: CategoryOption[];
}) {
  const action = id ? updateJob.bind(null, id) : createJob;
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, { values: initialValues, errors: {} });
  const [values, setValues] = useState(initialValues);
  const summary = useRef<HTMLDivElement>(null);
  useEffect(() => {
    setValues(state.values);
    if (state.message) summary.current?.focus();
  }, [state]);

  const fields: { key: keyof JobValues; label: string; hint: string; min?: number; max?: number }[] = [
    { key: "title", label: "Title", hint: "3–120 characters.", min: 3, max: 120 },
    { key: "category_id", label: "Category", hint: "Required. Draft categories are marked below." },
    { key: "company_source", label: "Company/source", hint: "2–120 characters.", min: 2, max: 120 },
    { key: "location_eligibility", label: "Location/eligibility", hint: "2–200 characters.", min: 2, max: 200 },
    { key: "description", label: "Description", hint: "20–8000 characters. Plain text; line breaks are kept.", min: 20, max: 8000 },
    { key: "application_url", label: "Application URL", hint: "A valid URL starting with http:// or https://, up to 2000 characters.", max: 2000 },
    { key: "status", label: "Status", hint: "Draft jobs are hidden from the public site." },
  ];
  const hiddenByCategory = values.status === "published" && categories.find((category) => category.id === values.category_id)?.status === "draft";

  return <form action={formAction} className={styles.form} noValidate aria-busy={pending}>
    {state.message && <div ref={summary} tabIndex={-1} role="alert" className={styles.error}>
      <p>{state.message}</p>
      {Object.keys(state.errors).length > 0 && <ul>{fields.filter(({ key }) => state.errors[key]).map(({ key, label }) => (
        <li key={key}><a href={`#${key}`}>{label}: {state.errors[key]}</a></li>
      ))}</ul>}
    </div>}
    {hiddenByCategory && <p role="status" className={jobStyles.warning}>This job is published, but its category is a draft. It won’t appear publicly until the category is published.</p>}
    {fields.map(({ key, label, hint, min, max }) => {
      const attributes = {
        id: key, name: key, value: values[key], disabled: pending, required: true,
        "aria-invalid": Boolean(state.errors[key]),
        "aria-describedby": `${key}-hint${state.errors[key] ? ` ${key}-error` : ""}`,
        onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setValues((previous) => ({ ...previous, [key]: event.target.value })),
      };
      return <div className={styles.field} key={key}>
        <label htmlFor={key}>{label}</label>
        <p id={`${key}-hint`} className={styles.hint}>{hint}</p>
        {key === "description" ? <textarea {...attributes} rows={10} minLength={min} maxLength={max} />
          : key === "category_id" ? <select {...attributes}><option value="">Choose a category</option>{categories.map((category) => (
            <option key={category.id} value={category.id}>{category.name}{category.status === "draft" ? " (draft)" : ""}</option>
          ))}</select>
          : key === "status" ? <select {...attributes}><option value="draft">Draft</option><option value="published">Published</option></select>
          : <input {...attributes} type={key === "application_url" ? "url" : "text"} minLength={min} maxLength={max}
            autoCapitalize={key === "application_url" ? "none" : undefined} spellCheck={key === "application_url" ? false : undefined} />}
        {state.errors[key] && <p id={`${key}-error`} className={styles.fieldError}>{state.errors[key]}</p>}
      </div>;
    })}
    <div className={styles.actions}>
      <button className="button" type="submit" disabled={pending}>{pending ? "Saving…" : id ? "Save changes" : "Create job"}</button>
      <a href="/admin/jobs" className="button button-outline">Cancel</a>
    </div>
  </form>;
}
