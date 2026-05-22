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
    <aside className="hidden w-56 shrink-0 border-r bg-card md:block">
      <nav className="flex flex-col gap-1 p-4">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            prefetch={link.href !== "/dashboard" && link.href !== "/plan"}
            className={cn(
              "rounded-lg px-3 py-2 text-sm transition-colors",
              pathname === link.href || pathname.startsWith(link.href + "/")
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
