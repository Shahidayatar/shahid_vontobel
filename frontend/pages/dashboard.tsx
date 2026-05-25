import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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

type ModelDeployment = {
  id: string;
  tenantId: string;
  deploymentName: string;
  modelName: string;
  state: "queued" | "running" | "succeeded" | "failed";
  provisioningMessage: string;
  updatedAt: string;
};

type ModelCatalogItem = {
  id: string;
  displayName: string;
  modelName: string;
};

type UsageResponse = {
  requestCount: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCostUsd: number;
};

export default function DashboardPage() {
  const tenantId = useTenantId();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [models, setModels] = useState<ModelCatalogItem[]>([]);
  const [usage, setUsage] = useState<UsageResponse | null>(null);
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

    api.get<ModelCatalogItem[]>(`/models/catalog`)
      .then(setModels)
      .catch(() => {
        setModels([]);
      });

    api.get<UsageResponse>(`/usage/${encodeURIComponent(tenantId)}`)
      .then(setUsage)
      .catch(() => {
        setUsage(null);
      });
  }, [tenantId]);

  const activeAgents = useMemo(() => agents.filter((agent) => agent.isProvisioned).length, [agents]);
  const modelAvailability = useMemo(() => models.length, [models]);
  const totalDeployedModels = useMemo(() => agents.filter((agent) => agent.isProvisioned).length, [agents]);

  const recentActivity = useMemo(() => {
    const agentCards = agents.slice(0, 2).map((agent) => ({
      title: agent.name,
      detail: `${agent.model} • ${agent.isProvisioned ? "provisioned" : "pending"}`,
      tone: agent.isProvisioned ? "success" : "warning"
    }));

    const modelCards = models.slice(0, 2).map((model) => ({
      title: model.displayName,
      detail: `Shared model • ${model.modelName}`,
      tone: "neutral"
    }));

    return [...modelCards, ...agentCards].slice(0, 5);
  }, [agents, models]);

  async function handleDelete(agentId: string) {
    if (!tenantId) {
      return;
    }

    await api.delete<{ deleted: boolean }>(`/agents/${agentId}`, { tenantId });
    const refreshed = await api.get<Agent[]>(`/agents?tenantId=${encodeURIComponent(tenantId)}`);
    setAgents(refreshed);
  }

  return (
    <AppShell title="Agent dashboard" description="Executive overview for models, agents, usage, health, and platform activity.">
      <section className="hero-panel dashboard-hero">
        <div>
          <p className="eyebrow">AI Foundry as a Service</p>
          <h1>Enterprise AI control plane</h1>
          <p className="hero-copy">
            Shared models, deployed agents, knowledge intake, and usage tracking for every internal team.
          </p>
        </div>
        <div className="hero-actions">
          <Link className="primary-button" href="/agents">Create agent</Link>
          <Link className="secondary-button" href="/chat">Open chat</Link>
        </div>
      </section>

      <section className="page-grid metrics-grid dashboard-metrics">
        <article className="surface-card metric-card">
          <span>Available models</span>
          <strong>{modelAvailability}</strong>
          <p>Shared centrally by the platform admin</p>
        </article>
        <article className="surface-card metric-card">
          <span>Deployed models</span>
          <strong>{totalDeployedModels}</strong>
          <p>{agents.length} total agents in tenant</p>
        </article>
        <article className="surface-card metric-card">
          <span>Total token usage</span>
          <strong>{usage ? (usage.totalInputTokens + usage.totalOutputTokens).toLocaleString() : "0"}</strong>
          <p>{usage?.requestCount ?? 0} requests processed</p>
        </article>
        <article className="surface-card metric-card">
          <span>Monthly cost estimate</span>
          <strong>${usage?.totalCostUsd?.toFixed(2) ?? "0.00"}</strong>
          <p>Based on recorded workload</p>
        </article>
      </section>

      <section className="page-grid dashboard-grid">
        <article className="surface-card dashboard-panel">
          <div className="section-title">
            <h2>Platform snapshot</h2>
            <p>What is currently available to the tenant workspace.</p>
          </div>
          <div className="health-stack">
            <div className="health-row">
              <span>Shared models</span>
              <strong>{modelAvailability}</strong>
            </div>
            <div className="health-bar"><span style={{ width: `${Math.max(20, Math.min(100, modelAvailability * 12))}%` }} /></div>
            <div className="health-row">
              <span>Agent deployment</span>
              <strong>{activeAgents}</strong>
            </div>
            <div className="health-bar danger"><span style={{ width: `${Math.max(12, Math.min(100, activeAgents * 18))}%` }} /></div>
          </div>
        </article>

        <article className="surface-card dashboard-panel">
          <div className="section-title">
            <h2>Recent activity</h2>
            <p>Latest model, agent, and knowledge activity in the control plane.</p>
          </div>
          <div className="activity-list">
            {recentActivity.map((item) => (
              <div className="activity-row" key={`${item.title}-${item.detail}`}>
                <span className={`status-pill ${item.tone}`}>{item.tone}</span>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="page-grid dashboard-grid">
        <article className="surface-card">
          <div className="section-title">
            <h2>Agents</h2>
            <p>Provisioned and pending agents available for chat.</p>
          </div>
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
          <div className="section-title">
            <h2>Platform shortcuts</h2>
            <p>Launch into the major control-plane workflows.</p>
          </div>
          <div className="stack-list compact">
            <Link className="shortcut-link" href="/model-catalog">Model catalog</Link>
            <Link className="shortcut-link" href="/agents">Create agent</Link>
            <Link className="shortcut-link" href="/upload-documents">Upload documents</Link>
            <Link className="shortcut-link" href="/chat">Chat playground</Link>
          </div>
        </article>
      </section>
    </AppShell>
  );
}
