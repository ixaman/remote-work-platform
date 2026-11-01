"use client";

import { useState } from "react";

const guides = [
  { id: "resume", title: "Resume guidance", items: [
    "Tailor keywords to the actual role.",
    "Show outcomes, not only duties.",
    "Make remote tools and collaboration visible.",
    "Keep formatting skimmable.",
  ] },
  { id: "interview", title: "Interview preparation", items: [
    "Test audio and video in advance.",
    "Prepare specific examples of your work.",
    "Confirm the schedule and time zone.",
    "Ask about classification and equipment.",
  ] },
  { id: "search-tips", title: "Job-search tips", items: [
    "Track applications and follow-up dates.",
    "Verify the employer’s domain.",
    "Compare requirements with your experience.",
    "Never pay to apply.",
  ] },
  { id: "scam-checking", title: "Scam-checking checklist", items: [
    "Reject upfront fees; verify the employer website and domain.",
    "Beware pressure and gift-card or crypto requests.",
    "Do not share banking credentials before a legitimate hiring process.",
    "Confirm the application link goes where expected.",
  ] },
  { id: "international-guide", title: "International work eligibility guidance", items: [
    "Check country and state restrictions and time-zone overlap.",
    "Confirm payroll or contractor rules, right-to-work status, and tax obligations.",
    "Do not assume “remote” means worldwide.",
  ] },
];

export default function ResourceAccordion() {
  const [expanded, setExpanded] = useState<string[]>(["resume"]);

  return (
    <div className="resource-grid">
      {guides.map(({ id, title, items }) => {
        const open = expanded.includes(id);
        return (
          <div className="resource-guide" key={id}>
            <h3>
              <button
                id={`${id}-button`}
                type="button"
                aria-expanded={open}
                aria-controls={`${id}-content`}
                onClick={() => setExpanded((current) => open ? current.filter((value) => value !== id) : [...current, id])}
              >
                {title}<span aria-hidden="true">{open ? "−" : "+"}</span>
              </button>
            </h3>
            <div id={`${id}-content`} hidden={!open} aria-labelledby={`${id}-button`}>
              <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
          </div>
        );
      })}
    </div>
  );
}
