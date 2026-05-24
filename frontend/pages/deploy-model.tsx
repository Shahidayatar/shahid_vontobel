import { FormEvent, useEffect, useMemo, useState } from "react";
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
  description: string;
  defaultSystemPrompt: string;
};

type ModelDeployment = {
  id: string;
  tenantId: string;
  agentId: string;
  deploymentName: string;
  modelName: string;
  state: "queued" | "running" | "succeeded" | "failed";
  provisioningMessage: string;
  createdAt: string;
  updatedAt: string;
};

export default function DeployModelPage() {
  const router = useRouter();
  const tenantId = useTenantId();
  const [catalog, setCatalog] = useState<ModelCatalogItem[]>([]);
  const [deployments, setDeployments] = useState<ModelDeployment[]>([]);
  const [modelId, setModelId] = useState("");
  const [deploymentName, setDeploymentName] = useState("GPT-5 Pro Assistant");
  const [description, setDescription] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [deploymentsLoading, setDeploymentsLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [deploymentsError, setDeploymentsError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setCatalogLoading(true);
    setCatalogError(null);
    api.get<ModelCatalogItem[]>('/models/catalog')
      .then((items) => {
        setCatalog(items);
        if (items.length > 0) {
          setModelId(items[0].id);
          setDescription(items[0].description);
          setSystemPrompt(items[0].defaultSystemPrompt);
          setDeploymentName(`${tenantId ?? "tenant-dev"}-${items[0].id}`);
        }
      })
      .catch((error: unknown) => {
        setCatalogError(error instanceof Error ? error.message : "Failed to load model catalog");
      })
      .finally(() => setCatalogLoading(false));
  }, [tenantId]);

  useEffect(() => {
    if (!tenantId) {
      return;
    }

    setDeploymentsLoading(true);
    setDeploymentsError(null);
    api.get<ModelDeployment[]>(`/model-deployments?tenantId=${encodeURIComponent(tenantId)}`)
      .then(setDeployments)
      .catch((error: unknown) => {
        setDeploymentsError(error instanceof Error ? error.message : "Failed to load deployments");
      })
      .finally(() => setDeploymentsLoading(false));
  }, [tenantId]);

  const selectedModel = useMemo(() => catalog.find((item) => item.id === modelId), [catalog, modelId]);

  const deployedCount = useMemo(() => deployments.filter((deployment) => deployment.tenantId !== "platform").length, [deployments]);

  function handleModelChange(nextModelId: string) {
    setModelId(nextModelId);
    const item = catalog.find((entry) => entry.id === nextModelId);
    if (item) {
      setDescription(item.description);
      setSystemPrompt(item.defaultSystemPrompt);
      setDeploymentName(`${tenantId ?? "tenant-dev"}-${item.id}`);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!tenantId || !modelId || !deploymentName || !description || !systemPrompt) {
      return;
    }

    setSubmitLoading(true);
    setSubmitError(null);
    setStatus(null);

    try {
      const result = await api.post<{ deployment: ModelDeployment }>("/model-deployments", {
        tenantId,
        modelId,
        deploymentName,
        description,
        systemPrompt
      });

      setStatus(`Deployment ${result.deployment.deploymentName} is ${result.deployment.state}.`);
      setDeploymentName(`${tenantId}-${modelId}`);
      const refreshed = await api.get<ModelDeployment[]>(`/model-deployments?tenantId=${encodeURIComponent(tenantId)}`);
      setDeployments(refreshed);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Deployment failed");
    } finally {
      setSubmitLoading(false);
    }
  }

  async function handleDelete(deploymentId: string) {
    if (!tenantId) {
      return;
    }

    setDeletingId(deploymentId);
    setSubmitError(null);
    try {
      await api.delete<{ deleted: boolean }>(`/model-deployments/${deploymentId}`, { tenantId });
      const refreshed = await api.get<ModelDeployment[]>(`/model-deployments?tenantId=${encodeURIComponent(tenantId)}`);
      setDeployments(refreshed);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  }

  useEffect(() => {
    if (!tenantId) {
      return;
    }

    const interval = window.setInterval(async () => {
      const refreshed = await api.get<ModelDeployment[]>(`/model-deployments?tenantId=${encodeURIComponent(tenantId)}`);
      setDeployments(refreshed);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [tenantId]);

  return (
    <AppShell title="Deploy model" description="Pick a base model, create the deployment, and then open a dedicated chat for that deployed model.">
      <section className="deploy-toolbar hero-panel">
        <div>
          <p className="eyebrow">Deployed models</p>
          <h1>{deployedCount}</h1>
          <p className="hero-copy">Each successful deployment gets its own agent and chat entry.</p>
        </div>
        <div className="hero-actions">
          <button className="secondary-button" type="button" onClick={() => router.push("/chat")}>
            Open chat
          </button>
        </div>
      </section>

      <div className="deploy-layout">
        <form className="surface-card deploy-form-card form-card" onSubmit={handleSubmit}>
          <div className="section-title">
            <h2>Deploy a model</h2>
            <p>Only Azure models that can actually be deployed are shown here.</p>
          </div>

          <label>
            Available model
            <select value={modelId} onChange={(event) => handleModelChange(event.target.value)} disabled={catalogLoading || catalog.length === 0}>
              {catalogLoading ? <option value="">Loading catalog...</option> : null}
              {!catalogLoading && catalog.length === 0 ? <option value="">No deployable models found</option> : null}
              {catalog.map((item) => (
                <option key={item.id} value={item.id}>{item.displayName} - {item.provider}{item.version ? ` (${item.version})` : ""}</option>
              ))}
            </select>
          </label>
          <label>
            Deployment name
            <input value={deploymentName} onChange={(event) => setDeploymentName(event.target.value)} />
          </label>
          <label>
            Description
            <input value={description} onChange={(event) => setDescription(event.target.value)} />
          </label>
          <label>
            System prompt
            <textarea value={systemPrompt} onChange={(event) => setSystemPrompt(event.target.value)} rows={8} />
          </label>
          <button className="primary-button" type="submit" disabled={!selectedModel || submitLoading || !deploymentName || !description || !systemPrompt}>
            {submitLoading ? "Deploying..." : "Deploy model"}
          </button>
          {catalogError ? <p className="error-text">{catalogError}</p> : null}
          {deploymentsError ? <p className="error-text">{deploymentsError}</p> : null}
          {submitError ? <p className="error-text">{submitError}</p> : null}
          {status ? <p className="success-text">{status}</p> : null}
        </form>

        <section className="surface-card deployed-panel">
          <div className="section-title">
            <h2>Deployed models</h2>
            <p>Chat with a deployment once it succeeds, or delete tenant-owned deployments when you are done.</p>
          </div>
          {deploymentsLoading ? <p className="hero-copy">Loading deployments...</p> : null}
          <div className="deployment-card-list">
            {deployments.map((deployment) => (
              <article className={`deployment-card ${deployment.state}`} key={deployment.id}>
                <div className="deployment-card-header">
                  <span className="status-chip">{deployment.state}</span>
                  <span className="model-name">{deployment.modelName}</span>
                </div>
                <h3>{deployment.deploymentName}</h3>
                <p>{deployment.provisioningMessage}</p>
                {deployment.tenantId !== "platform" ? (
                  <div className="deployment-card-actions">
                    {deployment.state === "succeeded" ? (
                      <button className="primary-button" type="button" onClick={() => router.push(`/chat?agentId=${encodeURIComponent(deployment.agentId)}`)}>
                        Chat with model
                      </button>
                    ) : null}
                    <button className="secondary-button" type="button" onClick={() => handleDelete(deployment.id)} disabled={deletingId === deployment.id}>
                      {deletingId === deployment.id ? "Deleting..." : "Delete deployment"}
                    </button>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}