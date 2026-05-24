import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "../components/AppShell";
import { api } from "../services/api";

type ModelCatalogItem = {
  id: string;
  displayName: string;
  provider: string;
  modelName: string;
  version?: string;
  description: string;
  lifecycleStatus?: string;
  capabilities?: Record<string, unknown>;
  defaultSystemPrompt: string;
};

const formatCapability = (value: unknown) => (typeof value === "number" || typeof value === "string" ? String(value) : "Managed in Azure");

export default function ModelCatalogPage() {
  const [catalog, setCatalog] = useState<ModelCatalogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.get<ModelCatalogItem[]>("/models/catalog")
      .then(setCatalog)
      .catch((catalogError: unknown) => {
        setError(catalogError instanceof Error ? catalogError.message : "Failed to load model catalog");
      })
      .finally(() => setLoading(false));
  }, []);

  const totalModels = useMemo(() => catalog.length, [catalog]);

  return (
    <AppShell title="Model catalog" description="Centrally managed models available to tenants for agent creation and chat workloads.">
      <section className="hero-panel dashboard-hero">
        <div>
          <p className="eyebrow">Shared models</p>
          <h1>{totalModels}</h1>
          <p className="hero-copy">Models are preconfigured by platform administrators and selected by developers when creating agents.</p>
        </div>
        <div className="hero-actions">
          <Link className="primary-button" href="/create-agent">Create agent</Link>
          <Link className="secondary-button" href="/chat">Open chat playground</Link>
        </div>
      </section>

      <section className="page-grid dashboard-grid">
        {loading ? <article className="surface-card"><p className="hero-copy">Loading catalog...</p></article> : null}
        {error ? <article className="surface-card"><p className="error-text">{error}</p></article> : null}
        {catalog.map((item) => (
          <article className="surface-card dashboard-panel" key={item.id}>
            <div className="deployment-card-header">
              <span className="status-pill success">Shared</span>
              <span className="model-name">{item.provider}</span>
            </div>
            <h2>{item.displayName}</h2>
            <p>{item.description}</p>
            <div className="stack-list compact">
              <div className="list-row"><div><strong>Model</strong><p>{item.modelName}</p></div><strong>{item.lifecycleStatus ?? "Ready"}</strong></div>
              <div className="list-row"><div><strong>Version</strong><p>{item.version ?? "Latest"}</p></div><strong>Managed</strong></div>
              <div className="list-row"><div><strong>Context window</strong><p>{formatCapability(item.capabilities?.contextWindow ?? item.capabilities?.maxContextTokens)}</p></div><strong>Shared</strong></div>
            </div>
            <div className="hero-actions">
              <Link className="primary-button" href={`/create-agent?model=${encodeURIComponent(item.modelName)}`}>Use in agent</Link>
            </div>
          </article>
        ))}
      </section>
    </AppShell>
  );
}