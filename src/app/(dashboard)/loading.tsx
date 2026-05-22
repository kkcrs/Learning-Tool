export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 rounded-lg bg-muted" />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-[320px] rounded-xl bg-muted" />
        <div className="h-[320px] rounded-xl bg-muted" />
      </div>
      <div className="h-[200px] rounded-xl bg-muted" />
    </div>
  );
}
