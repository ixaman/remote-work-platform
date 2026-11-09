export type FormState = {
  values: { name: string; email: string };
  errors: Partial<Record<"name" | "email" | "password", string>>;
  message?: string;
};

export const emptyState: FormState = { values: { name: "", email: "" }, errors: {} };
export const isUserId = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
const text = (data: FormData, key: string) => {
  const value = data.get(key);
  return typeof value === "string" ? value : "";
};

export function passwordError(password: string, email: string): string | undefined {
  if (password.length < 10 || password.length > 72) return "Password must be 10–72 characters.";
  if (password.toLowerCase() === email.toLowerCase()) return "Password must not equal the email address.";
}

// Passwords remain local to the action and are never part of returned state.
export function validateAdmin(data: FormData): FormState {
  const name = text(data, "name").trim();
  const email = text(data, "email").trim().toLowerCase();
  const errors: FormState["errors"] = {};
  if (name.length < 2 || name.length > 80) errors.name = "Name must be 2–80 characters.";
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email address of up to 254 characters.";
  const error = passwordError(text(data, "password"), email);
  if (error) errors.password = error;
  return { values: { name: name.slice(0, 80), email: email.slice(0, 254) }, errors };
}
