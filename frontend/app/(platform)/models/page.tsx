import { ModelsView } from "@/components/models/ModelsView";
import { AppShell } from "@/layout/AppShell";

export default function ModelsPage() {
  return (
    <AppShell title="Models" subtitle="Deploy and manage Azure OpenAI model endpoints across regions.">
      <ModelsView />
    </AppShell>
  );
}
