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
    <AppShell title="Chat" description="Test an agent against its retrieved context and inspect the grounded response.">
      <div className="page-grid chat-grid">
        <form className="surface-card form-card" onSubmit={handleSubmit}>
          <label>
            Agent
            <select value={agentId} onChange={(event) => setAgentId(event.target.value)}>
              {agents.map((agent) => <option key={agent.id} value={agent.id}>{agent.name}</option>)}
            </select>
          </label>
          <label>
            Question
            <textarea value={question} onChange={(event) => setQuestion(event.target.value)} rows={7} />
          </label>
          <button className="primary-button" type="submit">Send</button>
        </form>

        <section className="surface-card chat-panel">
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
