import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { AppShell } from "../components/AppShell";
import { api } from "../services/api";
import { useTenantId } from "../hooks/useTenantId";

type Agent = { id: string; name: string };

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatPage() {
  const router = useRouter();
  const tenantId = useTenantId();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [agentId, setAgentId] = useState("");
  const [question, setQuestion] = useState("What are the approved steps for creating a new AI agent?");
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    if (!tenantId) {
      return;
    }

    api.get<Agent[]>(`/agents?tenantId=${encodeURIComponent(tenantId)}`).then((items) => {
      setAgents(items);
      const selectedAgentId = typeof router.query.agentId === "string" ? router.query.agentId : "";
      if (selectedAgentId && items.some((item) => item.id === selectedAgentId)) {
        setAgentId(selectedAgentId);
        return;
      }

      if (items.length > 0) {
        setAgentId(items[0].id);
      }
    });
  }, [tenantId, router.query.agentId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!tenantId || !agentId) {
      return;
    }

    setMessages((current) => [...current, { role: "user", content: question }]);
    const response = await api.post<{ answer: string }>("/chat", {
      tenantId,
      agentId,
      question
    });
    setMessages((current) => [...current, { role: "assistant", content: response.answer }]);
  }

  return (
    <AppShell title="Chat playground" description="Open a deployed agent, inspect retrieval context, and review the execution trace in one place.">
      <section className="hero-panel dashboard-hero">
        <div>
          <p className="eyebrow">Playground</p>
          <h1>Enterprise chat workspace</h1>
          <p className="hero-copy">Switch agents, test prompts, and inspect grounded responses with retrieval context.</p>
        </div>
        <div className="hero-actions">
          <button className="secondary-button" type="button" onClick={() => router.push("/deploy-model")}>Open deployments</button>
        </div>
      </section>

      <div className="page-grid chat-grid">
        <form className="surface-card form-card chat-controls" onSubmit={handleSubmit}>
          <label>
            Agent
            <select value={agentId} onChange={(event) => setAgentId(event.target.value)}>
              {agents.map((agent) => <option key={agent.id} value={agent.id}>{agent.name}</option>)}
            </select>
          </label>
          <div className="stack-list compact">
            <div className="list-row"><div><strong>Prompt inspector</strong><p>Review the active system prompt and retrieval path.</p></div></div>
            <div className="list-row"><div><strong>Execution trace</strong><p>Visible after each response.</p></div></div>
          </div>
          <label>
            Question
            <textarea value={question} onChange={(event) => setQuestion(event.target.value)} rows={7} />
          </label>
          <button className="primary-button" type="submit">Send</button>
        </form>

        <section className="surface-card chat-panel chat-transcript">
          <h2>Conversation</h2>
          <div className="chat-thread">
            {messages.map((message, index) => (
              <div className={`message ${message.role}`} key={`${message.role}-${index}`}>
                <span>{message.role}</span>
                <p>{message.content}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
