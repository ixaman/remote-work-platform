// Development-only fixtures. All employers and jobs below are fake, not active openings.
export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: "draft" | "published";
  sort_order: number;
};

export type Job = {
  id: string;
  title: string;
  company_source: string;
  description: string;
  location_eligibility: string;
  application_url: string;
  status: "draft" | "published";
  category_slug: string;
  created_at: string;
};

export const categories: Category[] = [
  {
    id: "international", slug: "international", name: "International Remote Jobs",
    description: "Find remote jobs across borders. Check country eligibility and time-zone requirements.",
    status: "published", sort_order: 0,
  },
  {
    id: "non-phone", slug: "non-phone", name: "Non-Phone & Low-Phone Jobs",
    description: "Explore remote jobs with no calls or occasional calls, from email support to document processing.",
    status: "published", sort_order: 1,
  },
  {
    id: "contract", slug: "contract", name: "1099 / Contract Opportunities",
    description: "Browse independent contract jobs. Compare hours, expenses, and tax responsibilities.",
    status: "published", sort_order: 2,
  },
  {
    id: "flexible-income", slug: "flexible-income", name: "Side Hustles / Flexible Extra Income",
    description: "Find part-time, weekend, and freelance jobs that fit around your schedule.",
    status: "published", sort_order: 3,
  },
  { id: "data-entry", slug: "data-entry", name: "Data Entry", description: "Browse remote roles organizing records and keeping information accurate.", status: "published", sort_order: 4 },
  { id: "customer-service", slug: "customer-service", name: "Customer Service", description: "Find remote opportunities helping customers with questions and everyday needs.", status: "published", sort_order: 5 },
];

export const jobs: Job[] = [
  {
    id: "sample-1", title: "Sample: Remote Community Assistant", category_slug: "international",
    company_source: "Fictional Fern Community (fake employer)", location_eligibility: "Sample eligibility: Canada and United Kingdom; UTC overlap.",
    description: "Fake sample role supporting community questions. Illustrative full-time employment at $20/hour, Monday–Friday, 12–8 pm UTC; occasional calls. Own computer and reliable internet required.",
    created_at: "2026-10-25T12:00:00Z", application_url: "https://example.com/apply", status: "published",
  },
  {
    id: "sample-2", title: "Sample: International Support Coordinator", category_slug: "international",
    company_source: "Imaginary Harbor Team (fake employer)", location_eligibility: "Sample eligibility: Ireland; local right to work required.",
    description: "Fake sample role coordinating support requests. Illustrative part-time employment at €18/hour, weekdays, 9 am–1 pm UTC; phone-based. Employer equipment and home internet required.",
    created_at: "2026-10-26T12:00:00Z", application_url: "https://example.com/apply", status: "published",
  },
  {
    id: "sample-3", title: "Sample: Email Support Assistant", category_slug: "non-phone",
    company_source: "Pretend Paper Studio (fake employer)", location_eligibility: "Sample eligibility: United States; Eastern time zone.",
    description: "Fake sample role answering email questions with no calls. Illustrative full-time employment at $19/hour, weekdays, 9 am–5 pm ET. Employer computer and reliable home internet required.",
    created_at: "2026-10-27T12:00:00Z", application_url: "https://example.com/apply", status: "published",
  },
  {
    id: "sample-4", title: "Sample: Document Processing Clerk", category_slug: "non-phone",
    company_source: "Fictional Meadow Records (fake employer)", location_eligibility: "Sample eligibility: United States; Texas only.",
    description: "Fake sample role organizing documents with no calls. Illustrative part-time employment at $17/hour, weekdays, 10 am–2 pm CT. Employer equipment and home internet required.",
    created_at: "2026-10-28T12:00:00Z", application_url: "https://example.com/apply", status: "published",
  },
  {
    id: "sample-5", title: "Sample: Contract Content Reviewer", category_slug: "contract",
    company_source: "Imaginary Ink Projects (fake employer)", location_eligibility: "Sample eligibility: United States; independent contractors.",
    description: "Fake sample role reviewing text. Illustrative 1099 contract at $25/hour for 10 hours/week with flexible timing; occasional project calls. Own computer and internet required; taxes and expenses are the contractor’s responsibility.",
    created_at: "2026-10-29T12:00:00Z", application_url: "https://example.com/apply", status: "published",
  },
  {
    id: "sample-6", title: "Sample: Weekend Research Helper", category_slug: "flexible-income",
    company_source: "Pretend Pine Research (fake employer)", location_eligibility: "Sample eligibility: United Kingdom; local work eligibility required.",
    description: "Fake sample role collecting public research. Illustrative freelance project at £80/project, around four weekend hours; no calls. Own computer and internet required; project availability varies.",
    created_at: "2026-10-30T12:00:00Z", application_url: "https://example.com/apply", status: "published",
  },
];

// Additional examples exercise counts, newest-first previews, and unpublished records.
for (let index = 7; index <= 12; index++) {
  jobs.push({
    id: `sample-${index}`, title: `Sample: Remote Records Assistant ${index - 6}`,
    category_slug: index === 12 ? "data-entry" : "international",
    company_source: "Fictional Clover Records (fake employer)",
    location_eligibility: "Sample eligibility: United Kingdom; local right to work required.",
    description: "Fake sample role updating records; part-time, flexible weekday hours with no calls.",
    application_url: "https://example.com/apply", status: "published",
    created_at: `2026-10-${index + 18}T12:00:00Z`,
  });
}
categories.push({ id: "draft", slug: "draft", name: "Sample: Draft category", description: "Unpublished example.", status: "draft", sort_order: 6 });
jobs.push(
  { ...jobs[0], id: "sample-draft", title: "Sample: Draft job", status: "draft" },
  { ...jobs[0], id: "sample-hidden-category", title: "Sample: Hidden category job", category_slug: "draft" },
);
