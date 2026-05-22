import { Suspense } from "react";
import "@/styles/xueba-theme.css";
import { getUserProfile } from "@/lib/auth";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
async function DashboardNavbar() {
  const { profile } = await getUserProfile();
  return <Navbar name={profile.name} grade={profile.grade} />;
}

function NavbarFallback() {
  return (
    <header className="flex h-14 shrink-0 items-center border-b border-primary/10 bg-card/80 px-4 backdrop-blur-md md:px-6">
      <div className="skeleton-shimmer h-5 w-32 rounded-lg" />
    </header>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="xueba-app flex min-h-screen flex-col">
      <Suspense fallback={<NavbarFallback />}>
        <DashboardNavbar />
      </Suspense>
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="dashboard-shell-bg relative flex flex-1 flex-col overflow-hidden">
          <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
