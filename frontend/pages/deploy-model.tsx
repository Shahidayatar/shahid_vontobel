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

  useEffect(() => {
    api.get<ModelCatalogItem[]>("/models/catalog").then((items) => {
      setCatalog(items);
      if (items.length > 0) {
        setModelId(items[0].id);
        setDescription(items[0].description);
        setSystemPrompt(items[0].defaultSystemPrompt);
        setDeploymentName(`${tenantId ?? "tenant-dev"}-${items[0].id}`);
      }
    });
  }, [tenantId]);

  useEffect(() => {
    if (!tenantId) {
      return;
    }

    api.get<ModelDeployment[]>(`/model-deployments?tenantId=${encodeURIComponent(tenantId)}`).then(setDeployments);
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
    if (!tenantId || !modelId || !deploymentName) {
      return;
    }

    const result = await api.post<{ deployment: ModelDeployment }>("/model-deployments", {
      tenantId,
      modelId,
      deploymentName,
      description,
      systemPrompt
    });

    setStatus(`Deployment ${result.deployment.deploymentName} is ${result.deployment.state}.`);
    const refreshed = await api.get<ModelDeployment[]>(`/model-deployments?tenantId=${encodeURIComponent(tenantId)}`);
    setDeployments(refreshed);
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
            <select value={modelId} onChange={(event) => handleModelChange(event.target.value)}>
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
          <button className="primary-button" type="submit" disabled={!selectedModel}>Deploy model</button>
          {status ? <p className="success-text">{status}</p> : null}
        </form>

        <section className="surface-card chat-panel">
          <h2>Deployments</h2>
          <div className="chat-thread">
            {deployments.map((deployment) => (
              <div className="message assistant" key={deployment.id}>
                <span>{deployment.state}</span>
                <p>
                  <strong>{deployment.deploymentName}</strong> using {deployment.modelName}
                  <br />
                  {deployment.provisioningMessage}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}