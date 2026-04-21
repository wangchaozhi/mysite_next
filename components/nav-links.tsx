"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "首页" },
  { href: "/blog", label: "博客" },
];

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1 rounded-full border border-[rgba(83,72,56,0.08)] bg-[rgba(255,255,255,0.46)] p-1 backdrop-blur-md">
      {items.map((item) => {
        const active =
          item.href === "/" ? pathname === item.href : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-full px-4 py-2 text-sm transition ${
              active
                ? "bg-[rgba(31,26,23,0.9)] text-[var(--paper-50)]"
                : "text-[var(--ink-700)] hover:bg-white/70 hover:text-[var(--ink-950)]"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
