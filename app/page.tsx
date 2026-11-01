import Image from "next/image";
import SiteHeader from "./site-header";
import JobBrowsing from "./job-browsing";
import ResourceAccordion from "./resource-accordion";
import { categories } from "../lib/fixtures";
import { getCategoryBySlug, getJobsByCategory } from "../lib/categories";
import SiteFooter from "./site-footer";

export default async function HomePage() {
  const categoryResults = await Promise.all(categories.map((category) => getCategoryBySlug(category.slug)));
  const publishedCategories = categoryResults.filter((category) => category !== undefined);
  const jobs = (await Promise.all(publishedCategories.map((category) => getJobsByCategory(category.slug)))).flat();

  return (
    <>
      <a className="skip-link" href="#home">Skip to content</a>
      <SiteHeader />
      <main>
        <section id="home" className="hero" aria-labelledby="hero-title" tabIndex={-1}>
          <div className="container hero-inner">
            <div className="hero-copy">
              <p className="eyebrow">A clearer path to remote work</p>
              <h1 id="hero-title">Find Real Work From Home Opportunities.</h1>
              <p className="hero-introduction">A welcoming community sharing free job leads, practical advice, and career support. Start with clear guidance, then check every opportunity for yourself.</p>
              <div className="hero-actions">
                <a className="button" href="#job-categories">Browse Job Categories</a>
                <a className="button button-outline" href="#newsletter">Join Job Alerts</a>
              </div>
              <p className="hero-note">Free resources. Clear requirements. No invented openings.</p>
            </div>
            <Image className="hero-illustration" src="/images/remote-work-illustration.png" alt="" width={569} height={428} priority />
          </div>
        </section>
        <JobBrowsing categories={publishedCategories} jobs={jobs} />
        <section id="resources" className="resources supporting-section" aria-labelledby="resources-title" tabIndex={-1}>
          <div className="container">
            <p className="eyebrow">Practical support</p>
            <h2 id="resources-title">Tools for the search, not just the scroll.</h2>
            <p className="section-introduction">Open a guide for a short, useful checklist you can put to work today.</p>
            <ResourceAccordion />
          </div>
        </section>
        <section id="success-stories" className="success-stories supporting-section" aria-labelledby="stories-title" tabIndex={-1}>
          <div className="container">
            <p className="eyebrow">Community voices</p>
            <h2 id="stories-title">A place for real member stories.</h2>
            <p className="section-introduction">The spaces below are placeholders, not published testimonials or claims of outcomes.</p>
            <div className="story-grid">
              {[0, 1].map((index) => (
                <div className="story-card" key={index}>
                  <p className="story-label">Placeholder · not a testimonial</p>
                  <p>[Member story placeholder — add an approved quote]</p>
                  <p className="story-role">[Role / location placeholder]</p>
                </div>
              ))}
            </div>
            <p className="story-permission">Publish only with member permission.</p>
          </div>
        </section>
        <section id="newsletter" className="newsletter supporting-section" aria-labelledby="newsletter-title" tabIndex={-1}>
          <div className="container newsletter-panel">
            <p className="eyebrow">Fresh leads, thoughtfully shared</p>
            <h2 id="newsletter-title">Job alerts are coming.</h2>
            <p className="newsletter-message">Email signup is not available on this page yet. Meanwhile, explore the category guides and use the verification checklist to assess opportunities you find.</p>
            <a className="button" href="#job-categories">Explore job guidance</a>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
