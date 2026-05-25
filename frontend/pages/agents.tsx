import Link from "next/link";
import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { AppShell } from "../components/AppShell";
import { api } from "../services/api";
import { useTenantId } from "../hooks/useTenantId";

type ModelCatalogItem = {
  id: string;
  displayName: string;
  provider: string;
  modelName: string;
  version?: string;
};

type Agent = {
  id: string;
  name: string;
  model: string;
  isProvisioned: boolean;
  provisioningStatus?: string;
  updatedAt: string;
};

export default function AgentsPage() {
  const router = useRouter();
  const tenantId = useTenantId();
  const [catalog, setCatalog] = useState<ModelCatalogItem[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [name, setName] = useState("Customer Support Copilot");
  const [model, setModel] = useState("gpt-5-pro");
  const [systemPrompt, setSystemPrompt] = useState("You are a precise internal assistant that answers only from provided company documents.");
  const [description, setDescription] = useState("Internal support assistant for policy and knowledge-base questions.");
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    setCatalogLoading(true);
    setCatalogError(null);
    Promise.all([
      api.get<ModelCatalogItem[]>("/models/catalog"),
      tenantId ? api.get<Agent[]>(`/agents?tenantId=${encodeURIComponent(tenantId)}`) : Promise.resolve([] as Agent[])
    ])
      .then(([items, currentAgents]) => {
        setCatalog(items);
        setAgents(currentAgents);

        const requestedModel = router.isReady && typeof router.query.model === "string" ? router.query.model : "";
        const selected = requestedModel ? items.find((item) => item.modelName === requestedModel) : undefined;

        if (selected) {
          setModel(selected.modelName);
          return;
        }

        if (items.length > 0) {
          setModel(items[0].modelName);
        }
      })
      .catch((error: unknown) => {
        setCatalogError(error instanceof Error ? error.message : "Failed to load workspace data");
      })
      .finally(() => setCatalogLoading(false));
  }, [router.isReady, router.query.model, tenantId]);

  const provisionedAgents = useMemo(() => agents.filter((agent) => agent.isProvisioned), [agents]);

  async function refreshAgents() {
    if (!tenantId) {
      return;
    }

    const refreshed = await api.get<Agent[]>(`/agents?tenantId=${encodeURIComponent(tenantId)}`);
    setAgents(refreshed);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!tenantId || !name || !model || !systemPrompt || !description) {
      return;
    }

    setSubmitLoading(true);
    setSubmitError(null);
    setResult(null);

    try {
      const agent = await api.post<{ id: string; name: string }>("/agents", {
        tenantId,
        name,
        model,
        systemPrompt,
        description,
        dataSources: []
      });

      await api.post(`/provision/${agent.id}`, { tenantId });
      await refreshAgents();
      setResult(`Created agent ${name} and started provisioning.`);
      setName("Customer Support Copilot");
      setDescription("Internal support assistant for policy and knowledge-base questions.");
      setSystemPrompt("You are a precise internal assistant that answers only from provided company documents.");
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Failed to create agent");
    } finally {
      setSubmitLoading(false);
    }
  }

  async function handleDelete(agentId: string) {
    if (!tenantId) {
      return;
    }

    await api.delete<{ deleted: boolean }>(`/agents/${agentId}`, { tenantId });
    await refreshAgents();
  }

  return (
    <AppShell title="Agents" description="Create governed agents, provision them on shared models, and jump into chat with any agent.">
      <section className="hero-panel dashboard-hero">
        <div>
          <p className="eyebrow">Agent workspace</p>
          <h1>{provisionedAgents.length} ready agents</h1>
          <p className="hero-copy">Build a new agent, assign a shared model, and chat with provisioned agents from one screen.</p>
        </div>
        <div className="hero-actions">
          <Link className="secondary-button" href="/model-catalog">Open model catalog</Link>
          <Link className="primary-button" href="/chat">Open chat</Link>
        </div>
      </section>

      <section className="page-grid agent-builder-grid">
        <form className="surface-card form-card agent-wizard" onSubmit={handleSubmit}>
          <div className="section-title">
            <h2>Create agent</h2>
            <p>Choose a shared model and provision an agent that can be used in chat.</p>
          </div>
          <label>
            Agent name
            <input value={name} onChange={(event) => setName(event.target.value)} />
          </label>
          <label>
            Description
            <input value={description} onChange={(event) => setDescription(event.target.value)} />
          </label>
          <label>
            Base model
            <select value={model} onChange={(event) => setModel(event.target.value)} disabled={catalogLoading || catalog.length === 0}>
              {catalogLoading ? <option value="">Loading catalog...</option> : null}
              {!catalogLoading && catalog.length === 0 ? <option value="">No Azure models returned</option> : null}
              {catalog.map((item) => (
                <option key={item.id} value={item.modelName}>{item.displayName} - {item.provider}{item.version ? ` (${item.version})` : ""}</option>
              ))}
            </select>
          </label>
          <label>
            System prompt
            <textarea value={systemPrompt} onChange={(event) => setSystemPrompt(event.target.value)} rows={8} />
          </label>
          <button className="primary-button" type="submit" disabled={submitLoading || !name || !model || !systemPrompt || !description}>
            {submitLoading ? "Creating..." : "Create and provision"}
          </button>
          {catalogError ? <p className="error-text">{catalogError}</p> : null}
          {submitError ? <p className="error-text">{submitError}</p> : null}
          {result ? <p className="success-text">{result}</p> : null}
        </form>

        <section className="surface-card dashboard-panel">
          <div className="section-title">
            <h2>Provisioned agents</h2>
            <p>Open chat with any deployed agent or remove stale entries.</p>
          </div>
          <div className="stack-list">
            {agents.map((agent) => (
              <div className="list-row" key={agent.id}>
                <div>
                  <strong>{agent.name}</strong>
                  <p>{agent.model}</p>
                </div>
                <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                  <button className="secondary-button" type="button" onClick={() => router.push(`/chat?agentId=${encodeURIComponent(agent.id)}`)}>
                    Chat
                  </button>
                  <button className="secondary-button" type="button" onClick={() => handleDelete(agent.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </section>
    </AppShell>
  );
}