"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "仪表盘" },
  { href: "/study", label: "学习记录" },
  { href: "/quiz", label: "AI 自测" },
  { href: "/plan", label: "学习计划" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-56 shrink-0 border-r border-primary/10 bg-card/70 backdrop-blur-sm md:block">
      <nav className="flex flex-col gap-1 p-4">
        {links.map((link) => {
          const active =
            pathname === link.href ||
            pathname.startsWith(link.href + "/");
          return (
            <Link
              key={link.href}
              href={link.href}
              prefetch
              className={cn(
                "rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                  : "text-foreground/80 hover:bg-primary/10 hover:text-primary"
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
