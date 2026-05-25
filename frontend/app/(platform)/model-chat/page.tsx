import { ModelChatView } from "@/components/model-chat/ModelChatView";
import { AppShell } from "@/layout/AppShell";

export default function ModelChatPage() {
  return (
    <AppShell title="Model Chat" subtitle="Directly evaluate raw deployed models with low-latency playground sessions.">
      <ModelChatView />
    </AppShell>
  );
}
