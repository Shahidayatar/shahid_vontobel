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

type UsageResponse = {
  requestCount: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCostUsd: number;
};

export default function DashboardPage() {
  const tenantId = useTenantId();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [deployments, setDeployments] = useState<ModelDeployment[]>([]);
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

    api.get<ModelDeployment[]>(`/model-deployments?tenantId=${encodeURIComponent(tenantId)}`)
      .then((items) => {
        setDeployments(items);
      })
      .catch(() => {
        setDeployments([]);
      });

    api.get<UsageResponse>(`/usage/${encodeURIComponent(tenantId)}`)
      .then(setUsage)
      .catch(() => {
        setUsage(null);
      });
  }, [tenantId]);

  const deployedModels = useMemo(() => deployments.filter((deployment) => deployment.tenantId !== "platform"), [deployments]);
  const activeAgents = useMemo(() => agents.filter((agent) => agent.isProvisioned).length, [agents]);
  const succeededDeployments = useMemo(() => deployedModels.filter((deployment) => deployment.state === "succeeded").length, [deployedModels]);
  const failedDeployments = useMemo(() => deployedModels.filter((deployment) => deployment.state === "failed").length, [deployedModels]);

  const recentActivity = useMemo(() => {
    const deploymentCards = deployedModels.slice(0, 3).map((deployment) => ({
      title: deployment.deploymentName,
      detail: `${deployment.modelName} • ${deployment.state}`,
      tone: deployment.state === "succeeded" ? "success" : deployment.state === "failed" ? "danger" : "warning"
    }));

    const agentCards = agents.slice(0, 2).map((agent) => ({
      title: agent.name,
      detail: `${agent.model} • ${agent.isProvisioned ? "provisioned" : "pending"}`,
      tone: agent.isProvisioned ? "success" : "warning"
    }));

    return [...deploymentCards, ...agentCards].slice(0, 5);
  }, [agents, deployedModels]);

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
            Self-service deployments, governed agents, retrieval pipelines, and observability for every internal team.
          </p>
        </div>
        <div className="hero-actions">
          <Link className="primary-button" href="/create-agent">Create agent</Link>
          <Link className="secondary-button" href="/chat">Open chat</Link>
        </div>
      </section>

      <section className="page-grid metrics-grid dashboard-metrics">
        <article className="surface-card metric-card">
          <span>Total deployed models</span>
          <strong>{deployedModels.length}</strong>
          <p>{succeededDeployments} healthy, {failedDeployments} failed</p>
        </article>
        <article className="surface-card metric-card">
          <span>Active agents</span>
          <strong>{activeAgents}</strong>
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
            <h2>Deployment health</h2>
            <p>Model and agent provisioning status across the tenant.</p>
          </div>
          <div className="health-stack">
            <div className="health-row">
              <span>Healthy deployments</span>
              <strong>{succeededDeployments}</strong>
            </div>
            <div className="health-bar"><span style={{ width: `${Math.max(20, Math.min(100, succeededDeployments * 30))}%` }} /></div>
            <div className="health-row">
              <span>Failed deployments</span>
              <strong>{failedDeployments}</strong>
            </div>
            <div className="health-bar danger"><span style={{ width: `${Math.max(10, Math.min(100, failedDeployments * 45))}%` }} /></div>
          </div>
        </article>

        <article className="surface-card dashboard-panel">
          <div className="section-title">
            <h2>Recent activity</h2>
            <p>Latest deployment and agent events in the control plane.</p>
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
            <p>Provisioned and pending agent definitions.</p>
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
            <Link className="shortcut-link" href="/deploy-model">Deploy model</Link>
            <Link className="shortcut-link" href="/create-agent">Create agent</Link>
            <Link className="shortcut-link" href="/upload-documents">Upload documents</Link>
            <Link className="shortcut-link" href="/analytics">Usage and cost analytics</Link>
          </div>
        </article>
      </section>
    </AppShell>
  );
}
