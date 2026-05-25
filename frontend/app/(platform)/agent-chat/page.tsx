import { AgentChatView } from "@/components/agent-chat/AgentChatView";
import { AppShell } from "@/layout/AppShell";

export default function AgentChatPage() {
  return (
    <AppShell title="Agent Chat" subtitle="Interact with enterprise assistants using prompts, retrieval, and citations.">
      <AgentChatView />
    </AppShell>
  );
}
