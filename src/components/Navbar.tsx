"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FaBagShopping,
  FaMagnifyingGlass,
  FaBars,
  FaXmark,
  FaRightToBracket,
  FaRightFromBracket,
  FaTicket,
  FaChevronDown,
  FaEnvelope,
} from "react-icons/fa6";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useEscapeKey } from "@/lib/useDialog";
import LogoMark from "@/components/Logo";
import { NAV, POPULAR_SEARCHES } from "@/lib/navigation";

/**
 * Primary navigation.
 *
 * Redesigned from a flat eight-item row into a grouped structure: four direct
 * links plus two dropdowns, so the information hierarchy is visible instead of
 * every destination competing at equal weight.
 *
 * Not built on any component framework — the button, badge, input and menu
 * primitives this needs are defined locally in globals.css under `apex-`.
 */

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { totalCount, openCart, hydrated } = useCart();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<HTMLUListElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEscapeKey(Boolean(mobileOpen || searchOpen || menuOpen || openGroup), () => {
    setMobileOpen(false);
    setSearchOpen(false);
    setMenuOpen(false);
    setOpenGroup(null);
  });

  // Close everything on navigation so nothing lingers over the new page.
  useEffect(() => {
    setMobileOpen(false);
    setMenuOpen(false);
    setSearchOpen(false);
    setOpenGroup(null);
  }, [pathname]);

  // The header gains an elevation once the page scrolls, so it separates from
  // content without needing a permanent heavy border.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen && !openGroup) return;
    const handler = (event: MouseEvent) => {
      const target = event.target as Node;
      if (menuRef.current && !menuRef.current.contains(target)) setMenuOpen(false);
      if (groupRef.current && !groupRef.current.contains(target)) setOpenGroup(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen, openGroup]);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href.split("#")[0]);

  function submitSearch(term: string) {
    const value = term.trim();
    if (!value) return;
    setSearchOpen(false);
    setSearchQuery("");
    router.push(`/products?search=${encodeURIComponent(value)}`);
  }

  const cartCount = hydrated ? totalCount : 0;

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to main content
      </a>

      <header
        className={[
          "sticky top-0 z-40 bg-surface-0/90 backdrop-blur-lg transition-shadow",
          scrolled ? "shadow-md" : "border-b border-line-200",
        ].join(" ")}
      >
        <div className="apex-container">
          <div className="flex h-16 items-center justify-between gap-2 lg:h-[4.5rem]">
            {/* Left: mobile toggle + logo */}
            <div className="flex items-center gap-1 lg:gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen((v) => !v)}
                aria-expanded={mobileOpen}
                aria-controls="mobile-nav"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                className="apex-btn apex-btn-icon -ml-2 text-ink-700 lg:hidden"
              >
                {mobileOpen ? <FaXmark aria-hidden="true" /> : <FaBars aria-hidden="true" />}
              </button>

              <Link
                href="/"
                className="flex items-center gap-2.5 rounded-md"
                aria-label="Apex Hockey Club — home"
              >
                <LogoMark className="h-9 w-9 shrink-0 lg:h-10 lg:w-10" />
                <span className="flex flex-col leading-none">
                  <span className="font-display text-[15px] font-extrabold tracking-tight text-ink-900 lg:text-lg">
                    Apex Hockey
                  </span>
                  <span className="mt-0.5 hidden text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-500 sm:block">
                    Elite Club &amp; Academy
                  </span>
                </span>
              </Link>
            </div>

            {/* Centre: primary navigation */}
            <nav aria-label="Primary" className="hidden lg:block">
              <ul ref={groupRef} className="flex items-center gap-0.5">
                {NAV.map((item) => {
                  const active = isActive(item.href);

                  if (!item.children) {
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          aria-current={active ? "page" : undefined}
                          className={[
                            "block rounded-lg px-3.5 py-2 text-[15px] font-semibold transition-colors",
                            active
                              ? "bg-brand-50 text-brand-600"
                              : "text-ink-700 hover:bg-surface-100 hover:text-ink-900",
                          ].join(" ")}
                        >
                          {item.label}
                        </Link>
                      </li>
                    );
                  }

                  const open = openGroup === item.label;
                  return (
                    <li key={item.label} className="relative">
                      <div className="flex items-center">
                        <Link
                          href={item.href}
                          aria-current={active ? "page" : undefined}
                          className={[
                            "rounded-l-lg py-2 pl-3.5 pr-1 text-[15px] font-semibold transition-colors",
                            active || open
                              ? "bg-brand-50 text-brand-600"
                              : "text-ink-700 hover:bg-surface-100 hover:text-ink-900",
                          ].join(" ")}
                        >
                          {item.label}
                        </Link>
                        <button
                          type="button"
                          onClick={() => setOpenGroup(open ? null : item.label)}
                          aria-expanded={open}
                          aria-label={`${item.label} menu`}
                          className={[
                            "rounded-r-lg px-1.5 py-2 transition-colors",
                            active || open
                              ? "bg-brand-50 text-brand-600"
                              : "text-ink-700 hover:bg-surface-100",
                          ].join(" ")}
                        >
                          <FaChevronDown
                            aria-hidden="true"
                            className={`text-[10px] transition-transform ${open ? "rotate-180" : ""}`}
                          />
                        </button>
                      </div>

                      {open && (
                        <div className="absolute left-0 top-full z-50 mt-2 w-[22rem] animate-scale-in rounded-2xl border border-line-200 bg-surface-0 p-2 shadow-lg">
                          {item.children.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              className="block rounded-xl px-3.5 py-3 transition-colors hover:bg-surface-50"
                            >
                              <span className="block text-sm font-semibold text-ink-900">
                                {child.label}
                              </span>
                              <span className="mt-0.5 block text-xs leading-relaxed text-ink-600">
                                {child.description}
                              </span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Right: actions */}
            <div className="flex items-center gap-0.5 sm:gap-1">
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                aria-label="Search the store"
                aria-expanded={searchOpen}
                className="apex-btn apex-btn-icon text-ink-700 hover:bg-surface-100"
              >
                <FaMagnifyingGlass aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={openCart}
                aria-label={`Open cart, ${cartCount} item${cartCount === 1 ? "" : "s"}`}
                className="apex-btn apex-btn-icon relative text-ink-700 hover:bg-surface-100"
              >
                <FaBagShopping aria-hidden="true" />
                {cartCount > 0 && (
                  <span
                    aria-hidden="true"
                    className="absolute right-0.5 top-0.5 flex h-[1.15rem] min-w-[1.15rem] items-center justify-center rounded-full bg-brand-500 px-1 text-[10px] font-bold text-white"
                  >
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </button>

              {user ? (
                <div className="relative" ref={menuRef}>
                  <button
                    type="button"
                    onClick={() => setMenuOpen((v) => !v)}
                    aria-expanded={menuOpen}
                    aria-haspopup="menu"
                    className="apex-btn apex-btn-sm ml-0.5 gap-2 border border-line-300 px-2.5 text-ink-800 hover:bg-surface-100"
                  >
                    <span
                      aria-hidden="true"
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-500 text-[11px] font-bold text-white"
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                    <span className="hidden max-w-[7rem] truncate sm:block">
                      {user.name.split(" ")[0]}
                    </span>
                  </button>

                  {menuOpen && (
                    <div
                      role="menu"
                      aria-label="Account"
                      className="absolute right-0 top-full z-50 mt-2 w-64 animate-scale-in rounded-2xl border border-line-200 bg-surface-0 p-1.5 shadow-lg"
                    >
                      <div className="border-b border-line-200 px-3 py-2.5">
                        <p className="truncate text-sm font-bold text-ink-900">{user.name}</p>
                        <p className="truncate text-xs text-ink-500">{user.email}</p>
                        <span className="apex-badge apex-badge-sm apex-badge-brand mt-1.5">
                          {user.membershipPlan || "Member"}
                        </span>
                      </div>
                      {[
                        { href: "/account", label: "Profile & portal" },
                        { href: "/account?tab=bookings", label: "Tickets & camps" },
                        { href: "/account?tab=settings", label: "Settings" },
                      ].map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          role="menuitem"
                          className="block rounded-lg px-3 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-surface-50 hover:text-ink-900"
                        >
                          {item.label}
                        </Link>
                      ))}
                      <button
                        type="button"
                        role="menuitem"
                        onClick={logout}
                        className="mt-1 flex w-full items-center gap-2 rounded-lg border-t border-line-200 px-3 py-2 text-sm font-semibold text-danger-600 transition-colors hover:bg-danger-50"
                      >
                        <FaRightFromBracket aria-hidden="true" /> Sign out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href={`/auth/signin?next=${encodeURIComponent(pathname)}`}
                  className="apex-btn apex-btn-ghost apex-btn-sm ml-0.5 hidden sm:inline-flex"
                >
                  <FaRightToBracket aria-hidden="true" />
                  Sign in
                </Link>
              )}

              <Link href="/get-ticket" className="apex-btn apex-btn-primary apex-btn-sm ml-1">
                <FaTicket aria-hidden="true" />
                <span className="hidden sm:inline">Get tickets</span>
                <span className="sm:hidden">Tickets</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div
            id="mobile-nav"
            className="max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-line-200 bg-surface-0 lg:hidden"
          >
            <nav aria-label="Mobile" className="apex-container py-4">
              <ul className="flex flex-col gap-0.5">
                {NAV.map((item) => {
                  const active = isActive(item.href);
                  const expanded = openGroup === item.label;

                  return (
                    <li key={item.label} className="border-b border-line-200 last:border-0">
                      <div className="flex items-center">
                        <Link
                          href={item.href}
                          aria-current={active ? "page" : undefined}
                          className={[
                            "flex-1 rounded-lg px-3 py-3 text-base font-semibold transition-colors",
                            active ? "text-brand-600" : "text-ink-800 hover:bg-surface-50",
                          ].join(" ")}
                        >
                          {item.label}
                        </Link>
                        {item.children && (
                          <button
                            type="button"
                            onClick={() => setOpenGroup(expanded ? null : item.label)}
                            aria-expanded={expanded}
                            aria-label={`${item.label} submenu`}
                            className="apex-btn apex-btn-icon text-ink-600"
                          >
                            <FaChevronDown
                              aria-hidden="true"
                              className={`text-xs transition-transform ${expanded ? "rotate-180" : ""}`}
                            />
                          </button>
                        )}
                      </div>

                      {item.children && expanded && (
                        <ul className="pb-2 pl-3">
                          {item.children.map((child) => (
                            <li key={child.href}>
                              <Link
                                href={child.href}
                                className="block rounded-lg px-3 py-2.5 text-sm text-ink-600 transition-colors hover:bg-surface-50 hover:text-ink-900"
                              >
                                {child.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>

              {!user && (
                <div className="mt-4 space-y-2 border-t border-line-200 pt-4">
                  <Link
                    href={`/auth/signin?next=${encodeURIComponent(pathname)}`}
                    className="apex-btn apex-btn-secondary apex-btn-block"
                  >
                    <FaRightToBracket aria-hidden="true" /> Sign in
                  </Link>
                  <a
                    href="mailto:islamrakibul9274@gmail.com"
                    className="apex-btn apex-btn-ghost apex-btn-block"
                  >
                    <FaEnvelope aria-hidden="true" /> Contact the club
                  </a>
                </div>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Search overlay */}
      {searchOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Search the store"
          className="fixed inset-0 z-50 flex items-start justify-center bg-ink-900/50 p-4 pt-20 backdrop-blur-sm"
        >
          <button
            type="button"
            aria-label="Close search"
            tabIndex={-1}
            onClick={() => setSearchOpen(false)}
            className="absolute inset-0 h-full w-full cursor-default"
          />
          <div className="relative z-10 w-full max-w-lg animate-scale-in rounded-2xl bg-surface-0 p-5 shadow-lg">
            <form onSubmit={(e) => { e.preventDefault(); submitSearch(searchQuery); }} role="search">
              <label htmlFor="global-search" className="apex-label">
                Search products
              </label>
              <div className="flex gap-2">
                <input
                  id="global-search"
                  ref={searchInputRef}
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Sticks, skates, helmets, gloves…"
                  className="apex-input"
                />
                <button type="submit" className="apex-btn apex-btn-primary">
                  Search
                </button>
              </div>
            </form>

            <div className="mt-4">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-ink-500">
                Popular searches
              </p>
              <div className="flex flex-wrap gap-2">
                {POPULAR_SEARCHES.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => submitSearch(term)}
                    className="apex-badge transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-600"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}