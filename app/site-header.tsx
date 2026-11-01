"use client";

import { useEffect, useRef, useState } from "react";

import { navigation } from "./navigation";

export default function SiteHeader({ homeLinks = false }: { homeLinks?: boolean }) {
  const hrefFor = (id: string) => homeLinks ? (id === "home" ? "/" : `/#${id}`) : `#${id}`;
  const [open, setOpen] = useState(false);
  const header = useRef<HTMLElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const element = header.current;
    if (!element) return;

    const updateScroll = () => {
      element.dataset.scrolled = String(window.scrollY > 0);
    };
    const updateHeight = () => {
      document.documentElement.style.setProperty("--header-height", `${element.getBoundingClientRect().height}px`);
    };
    const observer = new ResizeObserver(updateHeight);
    observer.observe(element);
    updateHeight();
    updateScroll();
    window.addEventListener("scroll", updateScroll, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", updateScroll);
      document.documentElement.style.removeProperty("--header-height");
    };
  }, []);

  function closeMenu() {
    setOpen(false);
    toggle.current?.focus();
  }

  return (
    <header ref={header} className="site-header" onKeyDown={(event) => {
      if (event.key === "Escape" && open) {
        event.preventDefault();
        closeMenu();
      }
    }}>
      <div className="container header-inner">
        <a className="brand" href={hrefFor("home")} aria-label="Real Work From Home Jobs | Advice, Tips & Fresh Leads, back to home" onClick={() => setOpen(false)}>
          <span className="brand-desktop">Real Work From Home Jobs | Advice,<br />Tips &amp; Fresh Leads</span>
          <span className="brand-mobile">Real Work From Home Jobs<br />Advice, Tips &amp; Fresh Leads</span>
        </a>
        <nav className="desktop-nav" aria-label="Main navigation">
          {navigation.map(([label, id]) => <a key={id} href={hrefFor(id)}>{label}</a>)}
        </nav>
        <a className="button header-cta" href={hrefFor("newsletter")}>Get Fresh Leads</a>
        <button ref={toggle} className="menu-toggle" type="button" aria-expanded={open} aria-controls="mobile-navigation" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen(!open)}>
          <span className="hamburger" aria-hidden="true"><span /><span /><span /></span>
          <span className="sr-only">Menu</span>
        </button>
        <nav id="mobile-navigation" className="mobile-nav" aria-label="Mobile navigation" hidden={!open}>
          {navigation.map(([label, id]) => <a key={id} href={hrefFor(id)} onClick={closeMenu}>{label}</a>)}
          <a className="button" href={hrefFor("newsletter")} onClick={closeMenu}>Get Fresh Leads</a>
        </nav>
      </div>
    </header>
  );
}
