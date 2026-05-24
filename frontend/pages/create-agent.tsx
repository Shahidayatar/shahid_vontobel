import { FormEvent, useEffect, useState } from "react";
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

export default function CreateAgentPage() {
  const tenantId = useTenantId();
  const [catalog, setCatalog] = useState<ModelCatalogItem[]>([]);
  const [name, setName] = useState("Customer Support Copilot");
  const [model, setModel] = useState("gpt-4o");
  const [systemPrompt, setSystemPrompt] = useState("You are a precise internal assistant that answers only from provided company documents.");
  const [description, setDescription] = useState("Internal support assistant for policy and knowledge-base questions.");
  const [result, setResult] = useState<string | null>(null);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    setCatalogLoading(true);
    setCatalogError(null);
    api.get<ModelCatalogItem[]>('/models/catalog')
      .then((items) => {
        setCatalog(items);
        if (items.length > 0) {
          setModel(items[0].modelName);
        }
      })
      .catch((error: unknown) => {
        setCatalogError(error instanceof Error ? error.message : "Failed to load model catalog");
      })
      .finally(() => setCatalogLoading(false));
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!tenantId) {
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    setResult(null);

    try {
      const agent = await api.post<{ id: string }>("/agents", {
        tenantId,
        name,
        model,
        systemPrompt,
        description,
        dataSources: []
      });

      await api.post(`/provision/${agent.id}`, { tenantId });
      setResult(`Created agent ${name} and started provisioning.`);
      setName("Customer Support Copilot");
      setDescription("Internal support assistant for policy and knowledge-base questions.");
      setSystemPrompt("You are a precise internal assistant that answers only from provided company documents.");
      if (catalog.length > 0) {
        setModel(catalog[0].modelName);
      }
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Failed to create agent");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell title="Create agent" description="Define the model, prompt, and operational boundary for a new internal agent.">
      <form className="surface-card form-card" onSubmit={handleSubmit}>
        <label>
          Name
          <input value={name} onChange={(event) => setName(event.target.value)} />
        </label>
        <label>
          Model
          <select value={model} onChange={(event) => setModel(event.target.value)} disabled={catalogLoading || catalog.length === 0}>
            {catalogLoading ? <option value="">Loading catalog...</option> : null}
            {!catalogLoading && catalog.length === 0 ? <option value="">No deployable models found</option> : null}
            {catalog.map((item) => (
              <option key={item.id} value={item.modelName}>{item.displayName} - {item.provider}{item.version ? ` (${item.version})` : ""}</option>
            ))}
          </select>
        </label>
        <label>
          Description
          <input value={description} onChange={(event) => setDescription(event.target.value)} />
        </label>
        <label>
          System prompt
          <textarea value={systemPrompt} onChange={(event) => setSystemPrompt(event.target.value)} rows={8} />
        </label>
        <button className="primary-button" type="submit" disabled={submitting || !name || !model || !systemPrompt || !description}>
          {submitting ? "Creating..." : "Create and provision"}
        </button>
        {catalogError ? <p className="error-text">{catalogError}</p> : null}
        {submitError ? <p className="error-text">{submitError}</p> : null}
        {result ? <p className="success-text">{result}</p> : null}
      </form>
    </AppShell>
  );
}
