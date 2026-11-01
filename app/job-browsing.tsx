"use client";

import { useState } from "react";
import type { Category, Job } from "../lib/fixtures";

const filters = ["International", "Non-phone", "1099 / Contract", "Flexible income"];
const icons = ["◎", "▤", "◇", "✳️"];
const roles = ["Data Entry", "Customer Service", "Healthcare", "Technical Support", "Administrative", "Email & Chat"];

export default function JobBrowsing({ categories, jobs }: { categories: Category[]; jobs: Job[] }) {
  const [selected, setSelected] = useState("all");
  const publishedCategories = categories.filter((category) => category.status === "published").sort((a, b) => a.sort_order - b.sort_order);
  const visibleJobs = jobs.filter((job) => job.status === "published" && publishedCategories.some((category) => category.slug === job.category_slug) && (selected === "all" || job.category_slug === selected));

  return (
    <>
      <section id="job-categories" className="job-categories" aria-labelledby="categories-title" tabIndex={-1}>
        <div className="container">
          <p className="eyebrow">Explore your options</p>
          <h2 id="categories-title">Find the guidance that fits.</h2>
          <p className="section-introduction">Filter these guides by work style. These are informational categories, not live job results.</p>
          <div className="category-filters" role="group" aria-label="Filter jobs by category">
            <button type="button" className="filter-pill" aria-pressed={selected === "all"} aria-controls="job-results" onClick={() => setSelected("all")}>All guidance</button>
            {publishedCategories.map((category) => (
              <button key={category.slug} type="button" className="filter-pill" aria-pressed={selected === category.slug} aria-controls="job-results" onClick={() => setSelected(category.slug)}>{filters[category.sort_order]}</button>
            ))}
          </div>
          <div className="category-grid">
            {publishedCategories.map((category) => (
              <article key={category.slug} className="category-card">
                <span className="category-icon" aria-hidden="true">{icons[category.sort_order]}</span>
                <h3><button type="button" className="category-select" aria-pressed={selected === category.slug} aria-controls="job-results" onClick={() => setSelected(category.slug)}>{category.name}</button></h3>
                <p>{category.description}</p>
                <a className="guidance-link" href="#job-listings" onClick={() => setSelected(category.slug)}>{category.slug === "international" ? "View WFH jobs list" : "View guidance"}<span className="sr-only">: {category.name}</span></a>
              </article>
            ))}
          </div>
          <div className="role-shortcuts">
            <h3>Explore common role areas</h3>
            <p>Choose a chip to highlight related guidance—not to search active openings.</p>
            <ul aria-label="Role areas">{roles.map((role) => <li key={role} className="role-chip">{role}</li>)}</ul>
          </div>
        </div>
      </section>
      <section id="job-listings" className="job-listings" aria-labelledby="listings-title" tabIndex={-1}>
        <div className="container listings-layout">
          <div className="lead-checklist">
            <p className="eyebrow">Transparency first</p>
            <h2 id="listings-title">How to read a legitimate lead</h2>
            <p className="section-introduction">A useful lead should make the essentials easy to find. Missing details are a reason to pause and verify—not a reason to guess.</p>
            <ul>
              <li>Employer name and direct application link</li>
              <li>Pay or rate, schedule, and employment type</li>
              <li>Country or state eligibility and time-zone expectations</li>
              <li>Phone expectations and equipment or internet requirements</li>
            </ul>
            <blockquote>“A good opportunity should stand up to a good question.”</blockquote>
          </div>
          <div id="job-results" className="job-results" role="region" aria-label="Job listings">
            <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{visibleJobs.length === 0 ? "No jobs in this category yet." : `${visibleJobs.length} sample jobs shown. ${selected === "all" ? "All categories" : publishedCategories.find((category) => category.slug === selected)?.name}.`}</p>
            {visibleJobs.length === 0 ? <p className="job-card empty-state">No jobs in this category yet.</p> : visibleJobs.map((job) => (
              <article key={job.id} className="job-card" aria-labelledby={`title-${job.id}`}>
                <p className="sample-badge">Sample only — no active opening shown</p>
                <h3 id={`title-${job.id}`}>{job.title}</h3>
                <p className="job-category">{publishedCategories.find((category) => category.slug === job.category_slug)?.name}</p>
                <dl className="job-details">
                  <div><dt>Company/source</dt><dd>{job.company_source}</dd></div>
                  <div><dt>Location/eligibility</dt><dd>{job.location_eligibility}</dd></div>
                </dl>
                <p className="job-description">{job.description}</p>
                <a className="button" href={job.application_url} target="_blank" rel="noopener noreferrer">Apply<span className="sr-only"> for {job.title} (opens in a new tab)</span></a>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
