"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { resolveMenuHref } from "../lib/resolveMenuHref";
import type { SITE_SETTINGS_QUERYResult } from "../types/sanity.generated";

type MenuItem = NonNullable<
  NonNullable<SITE_SETTINGS_QUERYResult>["mainMenu"]
>[number];

type HeaderMenuProps = {
  items: MenuItem[];
};

function isActiveMenuHref(pathname: string, href: string): boolean {
  const path = pathname.replace(/\/$/, "") || "/";

  if (href.startsWith("/")) {
    const target = href.split("?")[0].split("#")[0].replace(/\/$/, "") || "/";
    if (target === "/") {
      return path === "/";
    }
    return path === target || path.startsWith(`${target}/`);
  }

  if (/^https?:\/\//i.test(href) && typeof window !== "undefined") {
    try {
      const u = new URL(href);
      if (u.origin !== window.location.origin) {
        return false;
      }
      const target = u.pathname.replace(/\/$/, "") || "/";
      if (target === "/") {
        return path === "/";
      }
      return path === target || path.startsWith(`${target}/`);
    } catch {
      return false;
    }
  }

  return false;
}

function ChevronDown({ open }: { open: boolean }) {
  return (
    <svg
      width={11}
      height={9}
      viewBox="0 0 11 9"
      aria-hidden
      className={[
        "origin-center shrink-0 mb-1",
        open ? "rotate-180 transition-transform" : "transition-transform"
      ].join(" ")}
    >
      <polygon points="0,0 11,0 5.5,8.5" fill="black" />
    </svg>
  );
}

export default function HeaderMenu({ items }: HeaderMenuProps) {
  const pathname = usePathname() ?? "";
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current?.contains(event.target as Node)) {
        return;
      }
      setOpen(false);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!items.length) {
    return null;
  }

  return (
    <div ref={rootRef} className="relative isolate">
      <button
        type="button"
        className="flex items-center gap-1 text-base font-bold transition hover:opacity-70 uppercase tracking-wider"
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls="site-main-menu"
        id="site-main-menu-button"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? "Close" : "Menu"}
        <ChevronDown open={open} />
      </button>
      {open ? (
        <nav
          id="site-main-menu"
          role="menu"
          aria-labelledby="site-main-menu-button"
          className="absolute -left-4 top-full z-30 mt-3 min-w-[16rem] bg-black text-white py-4 shadow-sm"
        >
          <ul className="flex flex-col gap-1">
            {items.map((item, index) => {
              const key = item._key ?? `${item.label ?? "item"}-${index}`;
              const href = resolveMenuHref(item);
              const active = isActiveMenuHref(pathname, href);
              const compactItem = index >= 4;
              const firstItem = index === 0;
              return (
                <li key={key} role="none">
                  <Link
                    role="menuitem"
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={[
                      "block px-4 font-bold tracking-wide transition underline-offset-4",
                      compactItem ? "py-0" : "py-4",
                      firstItem ? "pt-1" : "pt-unset",
                      active ? "underline" : "hover:underline"
                    ].join(" ")}
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      ) : null}
    </div>
  );
}
