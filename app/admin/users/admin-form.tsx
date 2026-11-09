"use client";

import { useActionState, useRef, useState } from "react";
import { createAdmin, setAdminPassword } from "./actions";
import { emptyState, type FormState } from "./validation";
import styles from "../categories/categories.module.css";

export default function AdminForm({ id }: { id?: string }) {
  const passwordInput = useRef<HTMLInputElement>(null);
  const summary = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const action = id ? setAdminPassword.bind(null, id) : createAdmin;
  const [state, formAction, pending] = useActionState<FormState, FormData>(async (previous, formData) => {
    // FormData already holds the submission. Clear the DOM before any response;
    // the server never returns a password to repopulate this input.
    if (passwordInput.current) passwordInput.current.value = "";
    setVisible(false);
    const result = await action(previous, formData);
    requestAnimationFrame(() => summary.current?.focus());
    return result;
  }, emptyState);

  function generatePassword() {
    // 64 symbols divide 256 exactly, so masking produces unbiased selections.
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
    const random = crypto.getRandomValues(new Uint8Array(24));
    if (passwordInput.current) {
      passwordInput.current.value = Array.from(random, (value) => alphabet[value & 63]).join("");
      setVisible(true);
      passwordInput.current.focus();
    }
  }

  return <form action={formAction} className={styles.form} noValidate aria-busy={pending}>
    {state.message && <div ref={summary} tabIndex={-1} role="alert" className={styles.error}><p>{state.message}</p></div>}
    {!id && <>
      <div className={styles.field}>
        <label htmlFor="name">Name</label>
        <p id="name-hint" className={styles.hint}>2–80 characters.</p>
        <input id="name" name="name" type="text" required minLength={2} maxLength={80} defaultValue={state.values.name} autoComplete="name" disabled={pending}
          aria-invalid={Boolean(state.errors.name)} aria-describedby={`name-hint${state.errors.name ? " name-error" : ""}`} />
        {state.errors.name && <p id="name-error" className={styles.fieldError}>{state.errors.name}</p>}
      </div>
      <div className={styles.field}>
        <label htmlFor="email">Email</label>
        <p id="email-hint" className={styles.hint}>A valid email address, up to 254 characters. Saved in lowercase.</p>
        <input id="email" name="email" type="email" required maxLength={254} defaultValue={state.values.email} autoComplete="off" autoCapitalize="none" spellCheck={false} disabled={pending}
          aria-invalid={Boolean(state.errors.email)} aria-describedby={`email-hint${state.errors.email ? " email-error" : ""}`} />
        {state.errors.email && <p id="email-error" className={styles.fieldError}>{state.errors.email}</p>}
      </div>
    </>}
    <div className={styles.field}>
      <label htmlFor="password">{id ? "New password" : "Password"}</label>
      <p id="password-hint" className={styles.hint}>10–72 characters; must not equal the email address. Save the password before submitting; it will be cleared.</p>
      <input ref={passwordInput} id="password" name="password" type={visible ? "text" : "password"} required minLength={10} maxLength={72} autoComplete="new-password" disabled={pending}
        aria-invalid={Boolean(state.errors.password)} aria-describedby={`password-hint${state.errors.password ? " password-error" : ""}`} />
      {state.errors.password && <p id="password-error" className={styles.fieldError}>{state.errors.password}</p>}
      <div className={styles.actions}>
        <button type="button" className="button button-outline" disabled={pending} aria-controls="password" aria-pressed={visible} onClick={() => setVisible(!visible)}>{visible ? "Hide password" : "Show password"}</button>
        <button type="button" className="button button-outline" disabled={pending} onClick={generatePassword}>Generate strong password</button>
      </div>
    </div>
    <div className={styles.actions}>
      <button type="submit" className="button" disabled={pending}>{pending ? "Saving…" : id ? "Set new password" : "Add admin"}</button>
      <a href="/admin/users" className="button button-outline">Cancel</a>
    </div>
  </form>;
}
