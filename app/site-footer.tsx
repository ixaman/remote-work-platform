import { navigation } from "./navigation";

export default function SiteFooter({ homeLinks = false }: { homeLinks?: boolean }) {
  return (
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
          <ul>{navigation.map(([label, id]) => <li key={id}><a href={homeLinks ? (id === "home" ? "/" : `/#${id}`) : `#${id}`}>{label}</a></li>)}</ul>
        </nav>
      </div>
    </footer>
  );
}
