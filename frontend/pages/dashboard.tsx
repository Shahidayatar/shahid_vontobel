import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "../components/AppShell";
import { api } from "../services/api";
import { useTenantId } from "../hooks/useTenantId";

type Agent = {
  id: string;
  name: string;
  model: string;
  isProvisioned: boolean;
  provisioningStatus?: string;
  updatedAt: string;
};

export default function DashboardPage() {
  const tenantId = useTenantId();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tenantId) {
      return;
    }

    api.get<Agent[]>(`/agents?tenantId=${encodeURIComponent(tenantId)}`)
      .then(setAgents)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Failed to load agents");
      });
  }, [tenantId]);

  async function handleDelete(agentId: string) {
    if (!tenantId) {
      return;
    }

    await api.delete<{ deleted: boolean }>(`/agents/${agentId}`, { tenantId });
    const refreshed = await api.get<Agent[]>(`/agents?tenantId=${encodeURIComponent(tenantId)}`);
    setAgents(refreshed);
  }

  return (
    <AppShell title="Agent dashboard" description="Track agents, provisioning state, and the platform entry points from one place.">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">AI Foundry as a Service</p>
          <h1>Internal enterprise AI platform</h1>
          <p className="hero-copy">
            Self-service agent creation, governed provisioning, and grounded RAG chat for every internal team.
          </p>
        </div>
        <div className="hero-actions">
          <Link className="primary-button" href="/create-agent">Create agent</Link>
          <Link className="secondary-button" href="/chat">Open chat</Link>
        </div>
      </section>

      <section className="page-grid">
        <article className="surface-card">
          <h2>Agents</h2>
          {error ? <p className="error-text">{error}</p> : null}
          <div className="stack-list">
            {agents.map((agent) => (
              <div className="list-row" key={agent.id}>
                <div>
                  <strong>{agent.name}</strong>
                  <p>{agent.model}</p>
                </div>
                <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                  <span className={agent.isProvisioned ? "status-pill success" : "status-pill pending"}>
                    {agent.isProvisioned ? "Provisioned" : agent.provisioningStatus ?? "Not provisioned"}
                  </span>
                  <button className="secondary-button" type="button" onClick={() => handleDelete(agent.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="surface-card">
          <h2>Platform shortcuts</h2>
          <div className="stack-list compact">
            <Link className="shortcut-link" href="/deploy-model">Deploy model</Link>
            <Link className="shortcut-link" href="/upload-documents">Upload documents</Link>
            <Link className="shortcut-link" href="/analytics">Usage and cost analytics</Link>
            <Link className="shortcut-link" href="/chat">Chat interface</Link>
          </div>
        </article>
      </section>
    </AppShell>
  );
}
