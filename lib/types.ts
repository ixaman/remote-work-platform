export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: "draft" | "published";
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type Job = {
  id: string;
  category_id: string;
  title: string;
  company_source: string;
  description: string;
  location_eligibility: string;
  application_url: string;
  status: "draft" | "published";
  created_at: string;
  updated_at: string;
};

// Preserve the public helpers' existing field for category links and filtering.
export type PublicJob = Job & { category_slug: string };
