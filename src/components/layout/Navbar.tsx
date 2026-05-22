import { GraduationCap } from "lucide-react";
import { logout } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";

export function Navbar({ name, grade }: { name: string; grade: number }) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-primary/10 bg-card/80 px-4 backdrop-blur-md md:px-6">
      <div className="flex items-center gap-3">
        <div className="sidebar-brand flex h-9 w-9 items-center justify-center rounded-xl shadow-md shadow-primary/20">
          <GraduationCap className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <p className="font-bold leading-tight">
            <span className="text-primary">学霸</span>
            <span className="text-foreground">星球</span>
          </p>
          <p className="text-xs text-muted-foreground">
            {name} · {grade} 年级
          </p>
        </div>
      </div>
      <form action={logout}>
        <Button type="submit" variant="outline" size="sm" className="rounded-xl">
          退出
        </Button>
      </form>
    </header>
  );
}
