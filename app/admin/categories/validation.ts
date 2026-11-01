export type CategoryValues = {
  name: string;
  slug: string;
  description: string;
  status: string;
  sort_order: string;
};
export type FieldErrors = Partial<Record<keyof CategoryValues, string>>;
export type FormState = { values: CategoryValues; errors: FieldErrors; message?: string };

export const emptyValues: CategoryValues = { name: "", slug: "", description: "", status: "draft", sort_order: "0" };
export const isCategoryId = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

export function validateCategory(formData: FormData): FormState {
  const values = { ...emptyValues };
  for (const key of Object.keys(values) as (keyof CategoryValues)[]) {
    const value = formData.get(key);
    values[key] = typeof value === "string" ? value.trim() : "";
  }
  const errors: FieldErrors = {};
  if (values.name.length < 2 || values.name.length > 80) errors.name = "Name must be 2–80 characters.";
  if (values.slug.length < 2 || values.slug.length > 60) errors.slug = "Slug must be 2–60 characters.";
  else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(values.slug)) errors.slug = "Use lowercase letters, numbers and single hyphens between words.";
  if (values.description.length > 400) errors.description = "Description must be 400 characters or fewer.";
  if (values.status !== "draft" && values.status !== "published") errors.status = "Choose draft or published.";
  if (!/^\d+$/.test(values.sort_order) || Number(values.sort_order) > 9999) errors.sort_order = "Sort order must be a whole number from 0 to 9999.";
  return { values, errors };
}
