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
};

export default function CreateAgentPage() {
  const tenantId = useTenantId();
  const [catalog, setCatalog] = useState<ModelCatalogItem[]>([]);
  const [name, setName] = useState("Customer Support Copilot");
  const [model, setModel] = useState("gpt-5-pro");
  const [systemPrompt, setSystemPrompt] = useState("You are a precise internal assistant that answers only from provided company documents.");
  const [description, setDescription] = useState("Internal support assistant for policy and knowledge-base questions.");
  const [result, setResult] = useState<string | null>(null);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [temperature, setTemperature] = useState(0.2);
  const [retrievalEnabled, setRetrievalEnabled] = useState(true);
  const [memoryEnabled, setMemoryEnabled] = useState(true);
  const [safetyMode, setSafetyMode] = useState("balanced");
  const [template, setTemplate] = useState("support");

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

  const selectedTemplateCopy = useMemo(() => {
    if (template === "support") {
      return "Ground responses in company policy, preferred workflows, and approved internal knowledge.";
    }

    if (template === "sales") {
      return "Answer with customer-facing clarity, product accuracy, and concise objection handling.";
    }

    return "Use the platform to draft, review, and validate internal decisions with high precision.";
  }, [template]);

  const promptPreview = useMemo(() => {
    return [
      `Agent: ${name}`,
      `Model: ${model}`,
      `Temperature: ${temperature.toFixed(1)}`,
      `Retrieval: ${retrievalEnabled ? "Enabled" : "Disabled"}`,
      `Memory: ${memoryEnabled ? "Enabled" : "Disabled"}`,
      `Safety: ${safetyMode}`,
      "",
      systemPrompt,
      "",
      selectedTemplateCopy
    ].join("\n");
  }, [name, model, temperature, retrievalEnabled, memoryEnabled, safetyMode, systemPrompt, selectedTemplateCopy]);

  return (
    <AppShell title="Agent builder" description="Design the agent, tune its behavior, and preview the prompt contract before provisioning.">
      <section className="hero-panel dashboard-hero">
        <div>
          <p className="eyebrow">Agent architecture</p>
          <h1>Build a governed AI agent</h1>
          <p className="hero-copy">Use templates, retrieval, memory, and safety controls to shape how the agent behaves in production.</p>
        </div>
        <div className="hero-actions">
          <span className="status-pill success">Prompt ready</span>
          <span className="status-pill pending">Provisioned by platform</span>
        </div>
      </section>

      <section className="page-grid agent-builder-grid">
        <form className="surface-card form-card agent-wizard" onSubmit={handleSubmit}>
          <div className="section-title">
            <h2>Agent definition</h2>
            <p>Capture the business goal and attach the model that powers the agent.</p>
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
            Temperature {temperature.toFixed(1)}
            <input type="range" min="0" max="1" step="0.1" value={temperature} onChange={(event) => setTemperature(Number(event.target.value))} />
          </label>
          <div className="toggle-grid">
            <button className={`toggle-chip ${retrievalEnabled ? "on" : "off"}`} type="button" onClick={() => setRetrievalEnabled((current) => !current)}>
              Retrieval {retrievalEnabled ? "on" : "off"}
            </button>
            <button className={`toggle-chip ${memoryEnabled ? "on" : "off"}`} type="button" onClick={() => setMemoryEnabled((current) => !current)}>
              Memory {memoryEnabled ? "on" : "off"}
            </button>
            <select value={safetyMode} onChange={(event) => setSafetyMode(event.target.value)}>
              <option value="strict">Strict safety</option>
              <option value="balanced">Balanced safety</option>
              <option value="open">Open safety</option>
            </select>
            <select value={template} onChange={(event) => setTemplate(event.target.value)}>
              <option value="support">Support copilot</option>
              <option value="sales">Sales assistant</option>
              <option value="ops">Operations assistant</option>
            </select>
          </div>
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

        <aside className="surface-card prompt-preview-panel">
          <div className="section-title">
            <h2>Prompt preview</h2>
            <p>Review the contract the platform will provision.</p>
          </div>
          <pre className="code-panel">{promptPreview}</pre>
          <div className="stack-list compact">
            <div className="list-row">
              <div>
                <strong>Template guidance</strong>
                <p>{selectedTemplateCopy}</p>
              </div>
            </div>
          </div>
        </aside>
      </section>
    </AppShell>
  );
}
