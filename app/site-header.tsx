"use client";

import { useRef, useState } from "react";

import { navigation } from "./navigation";

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);

  function closeMenu() {
    setOpen(false);
    toggle.current?.focus();
  }

  return (
    <header className="site-header" onKeyDown={(event) => {
      if (event.key === "Escape" && open) {
        event.preventDefault();
        closeMenu();
      }
    }}>
      <div className="container header-inner">
        <a className="brand" href="#home" aria-label="Real Work From Home Jobs | Advice, Tips & Fresh Leads, back to home" onClick={() => setOpen(false)}>
          <span className="brand-desktop">Real Work From Home Jobs | Advice,<br />Tips &amp; Fresh Leads</span>
          <span className="brand-mobile">Real Work From Home Jobs<br />Advice, Tips &amp; Fresh Leads</span>
        </a>
        <nav className="desktop-nav" aria-label="Main navigation">
          {navigation.map(([label, id]) => <a key={id} href={`#${id}`}>{label}</a>)}
        </nav>
        <a className="button header-cta" href="#newsletter">Get Fresh Leads</a>
        <button ref={toggle} className="menu-toggle" type="button" aria-expanded={open} aria-controls="mobile-navigation" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen(!open)}>
          <span className="hamburger" aria-hidden="true"><span /><span /><span /></span>
          <span className="sr-only">Menu</span>
        </button>
        <nav id="mobile-navigation" className="mobile-nav" aria-label="Mobile navigation" hidden={!open}>
          {navigation.map(([label, id]) => <a key={id} href={`#${id}`} onClick={closeMenu}>{label}</a>)}
          <a className="button" href="#newsletter" onClick={closeMenu}>Get Fresh Leads</a>
        </nav>
      </div>
    </header>
  );
}
