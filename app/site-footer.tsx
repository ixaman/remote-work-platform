import { navigation } from "./navigation";
import { socialLinks } from "../lib/social-links";

function FacebookIcon() {
  return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M14 22v-9h3l.5-4H14V7c0-1.2.4-2 2-2h2V1.4A25 25 0 0 0 15 1c-3 0-5 1.8-5 5v3H7v4h3v9z" /></svg>;
}

function LinkedInIcon() {
  return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M3 8h4v13H3zM5 2a2.3 2.3 0 1 0 0 4.6A2.3 2.3 0 0 0 5 2ZM10 8h3.8v1.8h.1A4.2 4.2 0 0 1 17.7 8c4 0 4.3 2.6 4.3 6v7h-4v-6.2c0-1.5 0-3.4-2-3.4s-2.3 1.6-2.3 3.3V21H10z" /></svg>;
}

function XIcon() {
  return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3L12 14.6 5.5 22H2.4l8.2-9.4L1 2h6.5l5.6 8.1L18.9 2Zm-1.1 18h1.7L6.6 3.9H4.8L17.8 20Z" /></svg>;
}

const socialIcons = { Facebook: FacebookIcon, LinkedIn: LinkedInIcon, "X (Twitter)": XIcon };

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
        <div className="footer-nav">
          <nav aria-labelledby="quick-links-title">
            <h2 id="quick-links-title">Quick links</h2>
            <ul>{navigation.map(([label, id]) => <li key={id}><a href={homeLinks ? (id === "home" ? "/" : `/#${id}`) : `#${id}`}>{label}</a></li>)}</ul>
          </nav>
          <nav className="footer-social" aria-label="Social media">
            {socialLinks.map(({ name, href }) => {
              const Icon = socialIcons[name];
              return <a key={name} href={href} aria-label={name} target="_blank" rel="noopener noreferrer"><Icon /></a>;
            })}
          </nav>
        </div>
      </div>
    </footer>
  );
}
