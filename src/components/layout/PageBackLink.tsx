import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

type PageBackLinkProps = {
  href: string;
  label?: string;
  className?: string;
};

export function PageBackLink({
  href,
  label = "返回",
  className,
}: PageBackLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-1 rounded-xl px-2 py-1.5 text-sm font-medium text-muted-foreground transition-colors",
        "hover:bg-primary/10 hover:text-primary",
        className
      )}
    >
      <ChevronLeft className="h-4 w-4" />
      {label}
    </Link>
  );
}
