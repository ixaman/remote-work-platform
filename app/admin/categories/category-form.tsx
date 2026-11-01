"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { createCategory, updateCategory } from "./actions";
import type { CategoryValues, FormState } from "./validation";
import styles from "./categories.module.css";

function slugify(name: string) {
  return name.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60).replace(/-$/, "");
}

export default function CategoryForm({ id, initialValues }: { id?: string; initialValues: CategoryValues }) {
  const action = id ? updateCategory.bind(null, id) : createCategory;
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, { values: initialValues, errors: {} });
  const [values, setValues] = useState(initialValues);
  const slugEdited = useRef(Boolean(id));
  const summary = useRef<HTMLDivElement>(null);
  useEffect(() => {
    setValues(state.values);
    if (state.message) summary.current?.focus();
  }, [state]);

  const fields: { key: keyof CategoryValues; label: string; hint: string }[] = [
    { key: "name", label: "Name", hint: "2–80 characters." },
    { key: "slug", label: "Slug", hint: `2–60 characters: lowercase letters, numbers and single hyphens.${id ? " Changing the slug changes this category’s public URL." : " Auto-filled from the name until you edit it."}` },
    { key: "description", label: "Description (optional)", hint: "Up to 400 characters. Displayed as plain text." },
    { key: "status", label: "Status", hint: "Draft categories and their jobs are hidden from the public site." },
    { key: "sort_order", label: "Sort order", hint: "A whole number from 0 to 9999. Lower numbers appear first." },
  ];

  function change(key: keyof CategoryValues, value: string) {
    if (key === "slug") slugEdited.current = true;
    setValues((previous) => ({ ...previous, [key]: value, ...(key === "name" && !slugEdited.current ? { slug: slugify(value) } : {}) }));
  }

  return (
    <form action={formAction} className={styles.form} noValidate aria-busy={pending}>
      {state.message && <div ref={summary} tabIndex={-1} role="alert" className={styles.error}>
        <p>{state.message}</p>
        {Object.keys(state.errors).length > 0 && <ul>{fields.filter(({ key }) => state.errors[key]).map(({ key, label }) => (
          <li key={key}><a href={`#${key}`}>{label}: {state.errors[key]}</a></li>
        ))}</ul>}
      </div>}
      {fields.map(({ key, label, hint }) => {
        const attributes = {
          id: key, name: key, value: values[key], disabled: pending,
          "aria-invalid": Boolean(state.errors[key]),
          "aria-describedby": `${key}-hint${state.errors[key] ? ` ${key}-error` : ""}`,
          onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => change(key, event.target.value),
        };
        return <div className={styles.field} key={key}>
          <label htmlFor={key}>{label}</label>
          <p id={`${key}-hint`} className={styles.hint}>{hint}</p>
          {key === "description" ? <textarea {...attributes} rows={5} maxLength={400} />
            : key === "status" ? <select {...attributes} required><option value="draft">Draft</option><option value="published">Published</option></select>
            : <input {...attributes} type={key === "sort_order" ? "number" : "text"} required
              min={key === "sort_order" ? 0 : undefined} max={key === "sort_order" ? 9999 : undefined} step={key === "sort_order" ? 1 : undefined}
              minLength={key === "sort_order" ? undefined : 2} maxLength={key === "name" ? 80 : key === "slug" ? 60 : undefined}
              autoCapitalize={key === "slug" ? "none" : undefined} spellCheck={key === "slug" ? false : undefined} />}
          {state.errors[key] && <p id={`${key}-error`} className={styles.fieldError}>{state.errors[key]}</p>}
        </div>;
      })}
      <div className={styles.actions}>
        <button className="button" type="submit" disabled={pending}>{pending ? "Saving…" : id ? "Save changes" : "Create category"}</button>
        <a href="/admin/categories" className="button button-outline">Cancel</a>
      </div>
    </form>
  );
}
