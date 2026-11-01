"use client";

import { useState } from "react";
import JobCard from "./job-card";
import type { Category, PublicJob as Job } from "../lib/types";

const filters = ["International", "Non-phone", "1099 / Contract", "Flexible income"];
const icons = ["◎", "▤", "◇", "✳️"];
const roles = ["Data Entry", "Customer Service", "Healthcare", "Technical Support", "Administrative", "Email & Chat"];

export default function JobBrowsing({ categories, jobs }: { categories: Category[]; jobs: Job[] }) {
  const [selected, setSelected] = useState("all");
  const allCategories = categories.filter((category) => category.status === "published").sort((a, b) => a.sort_order - b.sort_order);
  const publishedCategories = allCategories.slice(0, 4);
  const publishedJobs = jobs.filter((job) => job.status === "published" && allCategories.some((category) => category.slug === job.category_slug));
  const categoryJobs = publishedJobs.filter((job) => selected === "all" || job.category_slug === selected);
  const visibleJobs = [...categoryJobs].sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at)).slice(0, 5);
  const selectedCategory = publishedCategories.find((category) => category.slug === selected);

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
                <a className="guidance-link" href={`/categories/${category.slug}`} onClick={() => setSelected(category.slug)}>{category.slug === "international" ? "View WFH jobs list" : "View guidance"}<span className="sr-only">: {category.name}</span></a>
                <span> · {publishedJobs.filter((job) => job.category_slug === category.slug).length} {publishedJobs.filter((job) => job.category_slug === category.slug).length === 1 ? "job" : "jobs"}</span>
              </article>
            ))}
          </div>
          {allCategories.length > 4 && (
            <p><a className="guidance-link" href="/categories">View all categories →</a></p>
          )}
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
              <JobCard key={job.id} job={job} categoryName={allCategories.find((category) => category.slug === job.category_slug)?.name} />
            ))}
            {selected === "all" && (
              <a className="guidance-link" href="/jobs">View all jobs →</a>
            )}
            {selectedCategory && (
              <a className="guidance-link" href={`/categories/${selectedCategory.slug}`}>View all {categoryJobs.length} jobs in {selectedCategory.name} →</a>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
