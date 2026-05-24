import { FormEvent, useEffect, useMemo, useState } from "react";
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
  deploymentName: string;
  modelName: string;
  state: "queued" | "running" | "succeeded" | "failed";
  provisioningMessage: string;
  createdAt: string;
  updatedAt: string;
};

export default function DeployModelPage() {
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
    <AppShell title="Deploy model" description="Pick a base model, create the deployment, and let the platform provision the backing resources.">
      <div className="page-grid chat-grid">
        <form className="surface-card form-card" onSubmit={handleSubmit}>
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

        <section className="surface-card chat-panel">
          <h2>Deployments</h2>
          {deploymentsLoading ? <p className="hero-copy">Loading deployments...</p> : null}
          <div className="chat-thread">
            {deployments.map((deployment) => (
              <div className="message assistant" key={deployment.id}>
                <span>{deployment.state}</span>
                <p>
                  <strong>{deployment.deploymentName}</strong> using {deployment.modelName}
                  <br />
                  {deployment.provisioningMessage}
                </p>
                {deployment.tenantId !== "platform" ? (
                  <button className="secondary-button" type="button" onClick={() => handleDelete(deployment.id)} disabled={deletingId === deployment.id}>
                    {deletingId === deployment.id ? "Deleting..." : "Delete deployment"}
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}