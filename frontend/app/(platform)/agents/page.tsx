import { AgentsView } from "@/components/agents/AgentsView";
import { AppShell } from "@/layout/AppShell";

export default function AgentsPage() {
  return (
    <AppShell title="Agents" subtitle="Create lightweight enterprise assistants powered by deployed models.">
      <AgentsView />
    </AppShell>
  );
}
