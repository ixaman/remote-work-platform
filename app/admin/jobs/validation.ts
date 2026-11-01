export type JobValues = {
  title: string;
  category_id: string;
  company_source: string;
  location_eligibility: string;
  description: string;
  application_url: string;
  status: string;
};
export type FieldErrors = Partial<Record<keyof JobValues, string>>;
export type FormState = { values: JobValues; errors: FieldErrors; message?: string };
export const emptyValues: JobValues = {
  title: "", category_id: "", company_source: "", location_eligibility: "",
  description: "", application_url: "", status: "draft",
};
export const isId = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

export function validateJob(formData: FormData): FormState {
  const values = { ...emptyValues };
  for (const key of Object.keys(values) as (keyof JobValues)[]) {
    const value = formData.get(key);
    values[key] = typeof value === "string" ? value.trim() : "";
  }
  const errors: FieldErrors = {};
  for (const [key, label, min, max] of [
    ["title", "Title", 3, 120], ["company_source", "Company/source", 2, 120],
    ["location_eligibility", "Location/eligibility", 2, 200], ["description", "Description", 20, 8000],
  ] as const) {
    if (values[key].length < min || values[key].length > max) errors[key] = `${label} must be ${min}–${max} characters.`;
  }
  if (!isId(values.category_id)) errors.category_id = "Choose a category.";
  if (values.status !== "draft" && values.status !== "published") errors.status = "Choose draft or published.";
  try {
    const url = new URL(values.application_url);
    if (!/^https?:\/\//.test(values.application_url) || !["http:", "https:"].includes(url.protocol)
      || /[\s\u0000-\u001f\u007f\\]/.test(values.application_url) || values.application_url.length > 2000) throw new Error("Invalid URL");
  } catch {
    errors.application_url = "Enter a valid URL starting with http:// or https://, up to 2000 characters.";
  }
  return { values, errors };
}
