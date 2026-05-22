import { logout } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";

export function Navbar({ name, grade }: { name: string; grade: number }) {
  return (
    <header className="flex h-14 items-center justify-between border-b px-4 md:px-6">
      <div>
        <p className="font-semibold">Learn Track</p>
        <p className="text-xs text-muted-foreground">
          {name} · {grade} 年级
        </p>
      </div>
      <form action={logout}>
        <Button type="submit" variant="outline" size="sm">
          退出
        </Button>
      </form>
    </header>
  );
}
