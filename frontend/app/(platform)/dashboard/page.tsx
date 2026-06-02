import { DashboardView } from "@/components/dashboard/DashboardView";
import { AppShell } from "@/layout/AppShell";

export default function DashboardPage() {
  return (
    <AppShell title="Dashboard" subtitle="Enterprise overview of deployments, assistants, cost, and health.">
      <DashboardView />
    </AppShell>
  );
}
