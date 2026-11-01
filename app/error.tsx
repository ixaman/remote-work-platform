"use client";

import SiteHeader from "./site-header";
import SiteFooter from "./site-footer";

export default function ErrorPage() {
  return (
    <>
      <SiteHeader homeLinks />
      <main className="hero">
        <div className="container">
          <p className="job-card empty-state" role="alert">Something went wrong loading jobs. Please try again.</p>
        </div>
      </main>
      <SiteFooter homeLinks />
    </>
  );
}
