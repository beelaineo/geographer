"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

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
      width={8}
      height={9}
      viewBox="0 0 11 9"
      aria-hidden
      className={[
        "origin-center shrink-0 mb-0",
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
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLElement>(null);
  const [menuSize, setMenuSize] = useState<{ width: number; height: number } | null>(null);
  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    left: number;
    align: "left" | "center";
  } | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const updateMenuPosition = () => {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect) {
        return;
      }

      const isDesktop = window.innerWidth >= 768;
      const topOffset = isDesktop ? 20 : 8;

      setMenuPosition({
        top: rect.bottom + topOffset,
        left: isDesktop ? rect.left : rect.left + rect.width / 2,
        align: isDesktop ? "left" : "center"
      });
    };

    updateMenuPosition();
    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);

    return () => {
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open || !menuPosition) {
      return;
    }

    const updateMenuSize = () => {
      const rect = menuRef.current?.getBoundingClientRect();
      if (!rect) {
        return;
      }
      setMenuSize({
        width: rect.width,
        height: rect.height
      });
    };

    updateMenuSize();
    window.addEventListener("resize", updateMenuSize);

    return () => {
      window.removeEventListener("resize", updateMenuSize);
    };
  }, [open, menuPosition, items]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onPointerDown = (event: PointerEvent) => {
      if (
        rootRef.current?.contains(event.target as Node) ||
        menuRef.current?.contains(event.target as Node)
      ) {
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
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        className="flex items-center gap-1 type-body-sans transition uppercase"
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls="site-main-menu"
        id="site-main-menu-button"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? "Close" : "Menu"}
        <ChevronDown open={open} />
      </button>
      {open && menuPosition && typeof document !== "undefined"
        ? createPortal(
            <>
              {menuSize ? (
                <div
                  aria-hidden
                  className="pointer-events-none fixed z-30 bg-[#382f1f] mix-blend-multiply"
                  style={{
                    top: `${menuPosition.top}px`,
                    left: `${menuPosition.left}px`,
                    width: `${menuSize.width}px`,
                    height: `${menuSize.height}px`,
                    transform: menuPosition.align === "center" ? "translateX(-50%)" : undefined
                  }}
                />
              ) : null}
              <nav
                ref={menuRef}
                id="site-main-menu"
                role="menu"
                aria-labelledby="site-main-menu-button"
                className="fixed z-40 min-w-[18rem] py-3 text-white"
                style={{
                  top: `${menuPosition.top}px`,
                  left: `${menuPosition.left}px`,
                  transform: menuPosition.align === "center" ? "translateX(-50%)" : undefined
                }}
              >
                <ul className="relative z-10 flex flex-col gap-1">
                  {items.map((item, index) => {
                    const key = item._key ?? `${item.label ?? "item"}-${index}`;
                    const href = resolveMenuHref(item);
                    const active = isActiveMenuHref(pathname, href);
                    const compactItem = index >= 4;
                    const firstItem = index === 0;
                    const firstCompactItem = index === 4;
                    return (
                      <li key={key} role="none">
                        <Link
                          role="menuitem"
                          href={href}
                          aria-current={active ? "page" : undefined}
                          className={[
                            "block px-3 type-body-sans transition underline-offset-2",
                            compactItem ? "py-0" : "py-2",
                            firstItem ? "pt-0" : "pt-unset",
                            firstCompactItem ? "pt-2" : "",
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
            </>,
            document.body
          )
        : null}
    </div>
  );
}
