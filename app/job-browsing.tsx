"use client";

import { useState } from "react";
import { getCategories, getJobsByCategory, getLatestJobs } from "../lib/data";
import JobCard from "./job-card";

export default function JobBrowsing() {
  const [selected, setSelected] = useState<string | null>(null);
  const categories = getCategories();
  const category = categories.find((item) => item.slug === selected);
  const visibleJobs = category ? getJobsByCategory(category.slug).slice(0, 5) : getLatestJobs(5);

  function selectCategory(slug: string) {
    setSelected(slug);
    const listings = document.getElementById("job-listings");
    listings?.focus({ preventScroll: true });
    listings?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
  }

  return <>
    <section id="job-categories" className="job-categories" aria-labelledby="categories-title" tabIndex={-1}>
      <div className="container">
        <p className="eyebrow">Explore your options</p>
        <h2 id="categories-title">Find jobs by category.</h2>
        <p className="section-introduction">Choose a category to explore its newest jobs.</p>
        <div className="category-grid">
          {categories.slice(0, 4).map((item) => <article key={item.slug} className="category-card" data-selected={selected === item.slug}>
            <h3><button type="button" className="category-select" aria-pressed={selected === item.slug} aria-controls="job-results" onClick={() => selectCategory(item.slug)}>{item.name}</button></h3>
            <p>{item.description}</p><p className="category-count">{item.jobCount} {item.jobCount === 1 ? "job" : "jobs"}{selected === item.slug ? " · Selected" : ""}</p>
          </article>)}
        </div>
        <a className="browse-link" href="/categories">View all categories</a>
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
          <h2>{category ? category.name : "Latest jobs"}</h2>
          <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{visibleJobs.length} sample jobs shown. {category?.name ?? "All categories"}.</p>
          {visibleJobs.length ? visibleJobs.map((job) => <JobCard key={job.id} job={job} />) : <p className="job-card empty-state">No jobs in this category yet.</p>}
          {category && <a className="browse-link" href={`/categories/${category.slug}`}>View all {category.jobCount} jobs</a>}
        </div>
      </div>
    </section>
  </>;
}
