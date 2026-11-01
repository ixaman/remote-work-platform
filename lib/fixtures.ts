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
    description: "Check eligible countries or states before applying. Confirm required time-zone overlap, right-to-work rules, and how the employer pays international workers.",
    status: "published", sort_order: 0,
  },
  {
    id: "non-phone", slug: "non-phone", name: "Non-Phone & Low-Phone Jobs",
    description: "Explore data entry, document processing, email/chat, claims review, and content review. “Truly no-phone” means no calls; “minimal-phone” may still require occasional calls.",
    status: "published", sort_order: 1,
  },
  {
    id: "contract", slug: "contract", name: "1099 / Contract Opportunities",
    description: "Independent contractors may have variable hours and must plan for taxes. Benefits may not be included, and equipment or internet costs may be yours.",
    status: "published", sort_order: 2,
  },
  {
    id: "flexible-income", slug: "flexible-income", name: "Side Hustles / Flexible Extra Income",
    description: "Consider part-time gigs, project work, weekend work, and freelance tasks. Compare pay structure, time commitment, and any expenses first.",
    status: "published", sort_order: 3,
  },
  {
    id: "sample-empty", slug: "sample-empty", name: "Sample: More Remote Opportunities",
    description: "Sample category for previewing the empty state. No jobs have been added here yet.",
    status: "published", sort_order: 4,
  },
];

export const jobs: Job[] = [
  {
    id: "sample-1", title: "Sample: Remote Community Assistant", category_slug: "international", created_at: "2026-11-01T06:00:00Z",
    company_source: "Fictional Fern Community (fake employer)", location_eligibility: "Sample eligibility: Canada and United Kingdom; UTC overlap.",
    description: "Fake sample role supporting community questions. Illustrative full-time employment at $20/hour, Monday–Friday, 12–8 pm UTC; occasional calls. Own computer and reliable internet required.",
    application_url: "https://example.com/apply", status: "published",
  },
  {
    id: "sample-2", title: "Sample: International Support Coordinator", category_slug: "international", created_at: "2026-11-01T05:00:00Z",
    company_source: "Imaginary Harbor Team (fake employer)", location_eligibility: "Sample eligibility: Ireland; local right to work required.",
    description: "Fake sample role coordinating support requests. Illustrative part-time employment at €18/hour, weekdays, 9 am–1 pm UTC; phone-based. Employer equipment and home internet required.",
    application_url: "https://example.com/apply", status: "published",
  },
  {
    id: "sample-3", title: "Sample: Email Support Assistant", category_slug: "non-phone", created_at: "2026-11-01T04:00:00Z",
    company_source: "Pretend Paper Studio (fake employer)", location_eligibility: "Sample eligibility: United States; Eastern time zone.",
    description: "Fake sample role answering email questions with no calls. Illustrative full-time employment at $19/hour, weekdays, 9 am–5 pm ET. Employer computer and reliable home internet required.",
    application_url: "https://example.com/apply", status: "published",
  },
  {
    id: "sample-4", title: "Sample: Document Processing Clerk", category_slug: "non-phone", created_at: "2026-11-01T03:00:00Z",
    company_source: "Fictional Meadow Records (fake employer)", location_eligibility: "Sample eligibility: United States; Texas only.",
    description: "Fake sample role organizing documents with no calls. Illustrative part-time employment at $17/hour, weekdays, 10 am–2 pm CT. Employer equipment and home internet required.",
    application_url: "https://example.com/apply", status: "published",
  },
  {
    id: "sample-5", title: "Sample: Contract Content Reviewer", category_slug: "contract", created_at: "2026-11-01T02:00:00Z",
    company_source: "Imaginary Ink Projects (fake employer)", location_eligibility: "Sample eligibility: United States; independent contractors.",
    description: "Fake sample role reviewing text. Illustrative 1099 contract at $25/hour for 10 hours/week with flexible timing; occasional project calls. Own computer and internet required; taxes and expenses are the contractor’s responsibility.",
    application_url: "https://example.com/apply", status: "published",
  },
  {
    id: "sample-6", title: "Sample: Weekend Research Helper", category_slug: "flexible-income", created_at: "2026-11-01T01:00:00Z",
    company_source: "Pretend Pine Research (fake employer)", location_eligibility: "Sample eligibility: United Kingdom; local work eligibility required.",
    description: "Fake sample role collecting public research. Illustrative freelance project at £80/project, around four weekend hours; no calls. Own computer and internet required; project availability varies.",
    application_url: "https://example.com/apply", status: "published",
  },
  {
    id: "sample-7", title: "Sample: Remote Scheduling Assistant", category_slug: "international", created_at: "2026-10-31T06:00:00Z",
    company_source: "Fictional Sample Team (fake employer)", location_eligibility: "Sample eligibility: confirm country and time-zone requirements.",
    description: "Fake sample role for previewing job listings. Illustrative part-time work, 10 hours/week at $20/hour; no calls. Own computer and reliable internet required. This is not an active opening.",
    application_url: "https://example.com/apply", status: "published",
  },
  {
    id: "sample-8", title: "Sample: Community Email Coordinator", category_slug: "non-phone", created_at: "2026-10-30T06:00:00Z",
    company_source: "Fictional Sample Team (fake employer)", location_eligibility: "Sample eligibility: confirm country and time-zone requirements.",
    description: "Fake sample role for previewing job listings. Illustrative part-time work, 10 hours/week at $20/hour; no calls. Own computer and reliable internet required. This is not an active opening.",
    application_url: "https://example.com/apply", status: "published",
  },
  {
    id: "sample-9", title: "Sample: Contract Proofreader", category_slug: "contract", created_at: "2026-10-29T06:00:00Z",
    company_source: "Fictional Sample Team (fake employer)", location_eligibility: "Sample eligibility: confirm country and time-zone requirements.",
    description: "Fake sample role for previewing job listings. Illustrative part-time work, 10 hours/week at $20/hour; no calls. Own computer and reliable internet required. This is not an active opening.",
    application_url: "https://example.com/apply", status: "published",
  },
  {
    id: "sample-10", title: "Sample: Weekend Data Assistant", category_slug: "flexible-income", created_at: "2026-10-28T06:00:00Z",
    company_source: "Fictional Sample Team (fake employer)", location_eligibility: "Sample eligibility: confirm country and time-zone requirements.",
    description: "Fake sample role for previewing job listings. Illustrative part-time work, 10 hours/week at $20/hour; no calls. Own computer and reliable internet required. This is not an active opening.",
    application_url: "https://example.com/apply", status: "published",
  },
  {
    id: "sample-11", title: "Sample: International Research Assistant", category_slug: "international", created_at: "2026-10-27T06:00:00Z",
    company_source: "Fictional Sample Team (fake employer)", location_eligibility: "Sample eligibility: confirm country and time-zone requirements.",
    description: "Fake sample role for previewing job listings. Illustrative part-time work, 10 hours/week at $20/hour; no calls. Own computer and reliable internet required. This is not an active opening.",
    application_url: "https://example.com/apply", status: "published",
  },
  {
    id: "sample-12", title: "Sample: Records Review Assistant", category_slug: "non-phone", created_at: "2026-10-26T06:00:00Z",
    company_source: "Fictional Sample Team (fake employer)", location_eligibility: "Sample eligibility: confirm country and time-zone requirements.",
    description: "Fake sample role for previewing job listings. Illustrative part-time work, 10 hours/week at $20/hour; no calls. Own computer and reliable internet required. This is not an active opening.",
    application_url: "https://example.com/apply", status: "published",
  },
  {
    id: "sample-13", title: "Sample: Contract Project Assistant", category_slug: "contract", created_at: "2026-10-25T06:00:00Z",
    company_source: "Fictional Sample Team (fake employer)", location_eligibility: "Sample eligibility: confirm country and time-zone requirements.",
    description: "Fake sample role for previewing job listings. Illustrative part-time work, 10 hours/week at $20/hour; no calls. Own computer and reliable internet required. This is not an active opening.",
    application_url: "https://example.com/apply", status: "published",
  },
  {
    id: "sample-14", title: "Sample: Flexible Content Assistant", category_slug: "flexible-income", created_at: "2026-10-24T06:00:00Z",
    company_source: "Fictional Sample Team (fake employer)", location_eligibility: "Sample eligibility: confirm country and time-zone requirements.",
    description: "Fake sample role for previewing job listings. Illustrative part-time work, 10 hours/week at $20/hour; no calls. Own computer and reliable internet required. This is not an active opening.",
    application_url: "https://example.com/apply", status: "published",
  },
];
