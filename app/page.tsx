import Image from "next/image";
import SiteHeader from "./site-header";
import { navigation } from "./navigation";

export default function HomePage() {
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
        {navigation.slice(1).map(([label, id]) => (
          <section key={id} id={id} className="section-placeholder" aria-label={label} tabIndex={-1} />
        ))}
      </main>
      <footer className="site-footer">
        <div className="container footer-inner">
          <div className="footer-copy">
            <p className="footer-brand">Real Work From Home Jobs | Advice, Tips &amp; Fresh Leads</p>
            <p>We share leads with clear requirements and encourage members to verify every opening independently.</p>
            <p>This site does not guarantee hiring, pay, eligibility, or legitimacy beyond the information provided.</p>
            <blockquote>“A little clarity makes room for a better next step.”</blockquote>
          </div>
          <nav className="footer-nav" aria-labelledby="quick-links-title">
            <h2 id="quick-links-title">Quick links</h2>
            <ul>{navigation.map(([label, id]) => <li key={id}><a href={`#${id}`}>{label}</a></li>)}</ul>
          </nav>
        </div>
      </footer>
    </>
  );
}
