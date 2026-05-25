"use client";

import { useMemo, useState } from "react";
import { Loader2, Quote, Trash } from "lucide-react";
import { useAgentChatHistory, useSendAgentMessage } from "@/hooks/use-agent-chat";
import { useAgents } from "@/hooks/use-agents";
import { useChatStore } from "@/stores/chat-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Markdown } from "@/components/ui/markdown";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function AgentChatView() {
  const { data: agents = [] } = useAgents();
  const [agentId, setAgentId] = useState("");
  const [prompt, setPrompt] = useState("");
  const { data: history = [] } = useAgentChatHistory(agentId);
  const sendMessage = useSendAgentMessage();
  const { agentMessages, setAgentMessages, clearAgentMessages } = useChatStore();

  const messages = useMemo(() => {
    if (!agentId) {
      return [];
    }
    return agentMessages[agentId] ?? history;
  }, [agentId, agentMessages, history]);

  const submit = async () => {
    if (!agentId || !prompt) {
      return;
    }
    const next = [
      ...messages,
      { id: crypto.randomUUID(), role: "user" as const, content: prompt, createdAt: new Date().toISOString() }
    ];
    setAgentMessages(agentId, next);
    setPrompt("");
    const assistant = await sendMessage.mutateAsync({ agentId, message: prompt });
    setAgentMessages(agentId, [...next, assistant]);
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
      <Card className="h-fit space-y-3">
        <h3 className="text-base font-semibold">Assistant Session</h3>
        <Select
          value={agentId}
          onChange={setAgentId}
          options={[
            { value: "", label: "Select deployed agent" },
            ...agents.map((agent) => ({ value: agent.id, label: agent.name }))
          ]}
        />
        <Button variant="secondary" onClick={() => agentId && clearAgentMessages(agentId)} disabled={!agentId}>
          <Trash className="mr-2 h-4 w-4" />
          Clear Chat
        </Button>
        <p className="text-xs text-slate-400">Responses apply agent prompt, tools, and retrieval settings.</p>
      </Card>

      <Card className="space-y-4">
        <div className="h-[420px] space-y-3 overflow-y-auto rounded-xl bg-black/20 p-4">
          {messages.length === 0 && (
            <p className="rounded-xl border border-dashed border-white/20 p-4 text-sm text-slate-300">
              Select an agent and start an enterprise copilot conversation.
            </p>
          )}

          {messages.map((message) => (
            <div key={message.id} className="rounded-xl bg-white/5 p-3">
              <p className="mb-2 text-xs uppercase tracking-wider text-slate-400">{message.role}</p>
              <Markdown content={message.content} />
              {message.citations && message.citations.length > 0 && (
                <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-cyan-200">Citations</p>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {message.citations.map((citation) => (
                      <li key={`${citation.title}-${citation.source}`} className="flex items-start gap-2">
                        <Quote className="mt-0.5 h-3 w-3" />
                        <span>
                          {citation.title} - {citation.source}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}

          {sendMessage.isPending && (
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Loader2 className="h-4 w-4 animate-spin" />
              Agent is composing response...
            </div>
          )}
        </div>
        <div className="space-y-3">
          <Textarea
            placeholder="Message your selected enterprise agent..."
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
          />
          <div className="flex justify-end">
            <Button onClick={submit} disabled={!agentId || !prompt || sendMessage.isPending}>
              Send Message
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
