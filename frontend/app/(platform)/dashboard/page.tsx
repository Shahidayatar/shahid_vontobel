import { DashboardView } from "@/components/dashboard/DashboardView";
import { AppShell } from "@/layout/AppShell";

export default function DashboardPage() {
  return (
    <AppShell title="Dashboard (Application to be decommissioned by friday)" subtitle="Enterprise overview of deployments, assistants, cost, and health.">
      <DashboardView />
    </AppShell>
  );
}
