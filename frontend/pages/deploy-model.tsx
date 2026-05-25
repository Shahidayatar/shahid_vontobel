import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
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

export default function DeployModelPage() {
  const router = useRouter();
  const [catalog, setCatalog] = useState<ModelCatalogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestedModel = typeof router.query.model === "string" ? router.query.model : "";

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

  const selectedModel = useMemo(() => {
    if (requestedModel) {
      const match = catalog.find((item) => item.modelName === requestedModel);
      if (match) {
        return match;
      }
    }

    return catalog[0] ?? null;
  }, [catalog, requestedModel]);

  return (
    <AppShell title="Deploy model" description="Review the selected shared model and continue into the agent builder with that model preselected.">
      <section className="hero-panel dashboard-hero">
        <div>
          <p className="eyebrow">Shared model deployment</p>
          <h1>{selectedModel?.displayName ?? "Select a model"}</h1>
          <p className="hero-copy">
            {selectedModel
              ? `Deploy ${selectedModel.modelName} into a governed agent workspace.`
              : "Choose a model from the catalog, then continue into the agent builder."}
          </p>
        </div>
        <div className="hero-actions">
          <Link className="secondary-button" href="/model-catalog">Back to catalog</Link>
          {selectedModel ? (
            <Link className="primary-button" href={`/create-agent?model=${encodeURIComponent(selectedModel.modelName)}`}>
              Deploy this model
            </Link>
          ) : null}
        </div>
      </section>

      <section className="page-grid dashboard-grid">
        {loading ? <article className="surface-card"><p className="hero-copy">Loading model details...</p></article> : null}
        {error ? <article className="surface-card"><p className="error-text">{error}</p></article> : null}
        {selectedModel ? (
          <article className="surface-card dashboard-panel">
            <div className="deployment-card-header">
              <span className="status-pill success">Selected</span>
              <span className="model-name">{selectedModel.provider}</span>
            </div>
            <h2>{selectedModel.displayName}</h2>
            <p>{selectedModel.description}</p>
            <div className="stack-list compact">
              <div className="list-row"><div><strong>Model</strong><p>{selectedModel.modelName}</p></div><strong>{selectedModel.lifecycleStatus ?? "Ready"}</strong></div>
              <div className="list-row"><div><strong>Version</strong><p>{selectedModel.version ?? "Latest"}</p></div><strong>Managed</strong></div>
            </div>
          </article>
        ) : null}
      </section>
    </AppShell>
  );
}