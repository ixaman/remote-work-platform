"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { signOut } from "./actions";
import AdminIcon, { type AdminIconName } from "./admin-icon";
import styles from "./auth.module.css";

const navigation: { href: string; label: string; icon: AdminIconName }[] = [
  { href: "/admin", label: "Dashboard", icon: "dashboard" },
  { href: "/admin/categories", label: "Categories", icon: "categories" },
  { href: "/admin/jobs", label: "Jobs", icon: "jobs" },
  { href: "/admin/users", label: "Users", icon: "users" },
];

export default function AdminShell({ children, name, email, isSuperAdmin }: {
  children: ReactNode; name: string; email: string; isSuperAdmin: boolean;
}) {
  const pathname = usePathname();
  const [navigationOpen, setNavigationOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const account = useRef<HTMLDivElement>(null);
  const accountButton = useRef<HTMLButtonElement>(null);
  const navigationButton = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const links = navigation.filter(({ href }) => href !== "/admin/users" || isSuperAdmin);
  const active = links.find(({ href }) => href === "/admin" ? pathname === href : pathname.startsWith(`${href}/`) || pathname === href);
  const initials = name.trim().split(/\s+/).slice(0, 2).map((part) => Array.from(part)[0]).join("").toLocaleUpperCase();

  function cancelClose() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }

  useEffect(() => () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  useEffect(() => {
    if (!accountOpen) return;
    function outside(event: PointerEvent) {
      if (event.target instanceof Node && !account.current?.contains(event.target)) setAccountOpen(false);
    }
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [accountOpen]);

  return <div className={styles.admin} onKeyDown={(event) => {
    if (event.key !== "Escape") return;
    if (accountOpen) {
      setAccountOpen(false);
      accountButton.current?.focus();
    } else if (navigationOpen) {
      setNavigationOpen(false);
      navigationButton.current?.focus();
    }
  }}>
    <a className={`skip-link ${styles.skipLink}`} href="#admin-content">Skip to content</a>
    <header className={styles.topBar}>
      <button ref={navigationButton} type="button" className={styles.navigationToggle} aria-expanded={navigationOpen} aria-controls="admin-navigation" aria-label={navigationOpen ? "Close navigation" : "Open navigation"} onClick={() => setNavigationOpen(!navigationOpen)}>
        <AdminIcon name={navigationOpen ? "close" : "menu"} />
      </button>
      <span className={styles.headerBrand}>Real Work From Home Jobs</span>
      <div ref={account} className={styles.account} onPointerEnter={(event) => {
        if (event.pointerType !== "mouse") return;
        cancelClose();
        closeTimer.current = setTimeout(() => setAccountOpen(true), 120);
      }} onPointerLeave={() => {
        cancelClose();
        closeTimer.current = setTimeout(() => {
          if (!account.current?.contains(document.activeElement)) setAccountOpen(false);
        }, 200);
      }} onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setAccountOpen(false);
      }}>
        <button ref={accountButton} className={styles.accountTrigger} type="button" aria-expanded={accountOpen} aria-controls="admin-account" onClick={() => {
          cancelClose();
          setAccountOpen(!accountOpen);
        }}>
          <span className={styles.avatar} aria-hidden="true">{initials || "A"}</span>
          <span className={styles.accountName}>{name}</span>
          <AdminIcon name="chevron" />
          <span className="sr-only"> account</span>
        </button>
        <div id="admin-account" className={styles.accountPopover} hidden={!accountOpen}>
          <div className={styles.accountDetails}>
            <span className={styles.avatar} aria-hidden="true">{initials || "A"}</span>
            <div><strong>{name}</strong><span className={styles.accountRole}>{isSuperAdmin ? "Super admin" : "Admin"}</span><span className={styles.email}>{email}</span></div>
          </div>
          <form action={signOut}><button className={styles.signOut} type="submit"><AdminIcon name="logout" />Sign out</button></form>
        </div>
      </div>
    </header>
    <aside id="admin-navigation" className={`${styles.sidebar} ${navigationOpen ? styles.sidebarOpen : ""}`}>
      <Link href="/admin" className={styles.sidebarBrand} onClick={() => setNavigationOpen(false)}>Real Work From<br />Home Jobs</Link>
      <p className={styles.sidebarLabel}>Administration</p>
      <nav aria-label="Admin navigation" className={styles.navigation}>
        {links.map(({ href, label, icon }) => <Link key={href} href={href} aria-current={active?.href === href ? "page" : undefined} onClick={() => setNavigationOpen(false)}><AdminIcon name={icon} /><span>{label}</span></Link>)}
      </nav>
      <a href="/" className={styles.viewSite}><AdminIcon name="external" />View site</a>
    </aside>
    <main id="admin-content" tabIndex={-1} className={styles.content}>{children}</main>
  </div>;
}
