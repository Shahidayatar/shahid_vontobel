import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { AppShell } from "../components/AppShell";
import { api } from "../services/api";
import { useTenantId } from "../hooks/useTenantId";

type Agent = {
  id: string;
  name: string;
};

export default function UploadDocumentsPage() {
  const tenantId = useTenantId();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [agentId, setAgentId] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tenantId) {
      return;
    }

    api.get<Agent[]>(`/agents?tenantId=${encodeURIComponent(tenantId)}`).then((items) => {
      setAgents(items);
      if (items.length > 0) {
        setAgentId(items[0].id);
      }
    });
  }, [tenantId]);

  const canSubmit = useMemo(() => Boolean(agentId && file), [agentId, file]);

  async function handleSubmit() {
    if (!tenantId || !agentId || !file) {
      return;
    }

    setUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append("tenantId", tenantId);
    formData.append("agentId", agentId);
    formData.append("file", file);

    try {
      await api.upload("/documents/upload", formData);
      await api.post(`/documents/${agentId}/index`, { tenantId });
      setStatus(`Uploaded ${file.name} and started indexing.`);
      setFile(null);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Failed to upload document");
    } finally {
      setUploading(false);
    }
  }

  return (
    <AppShell title="Knowledge bases" description="Ingest enterprise documents, inspect source health, and prepare retrieval pipelines for agents.">
      <section className="hero-panel dashboard-hero">
        <div>
          <p className="eyebrow">RAG foundation</p>
          <h1>Enterprise knowledge intake</h1>
          <p className="hero-copy">Upload files, attach them to an agent, and turn them into searchable knowledge for grounded chat.</p>
        </div>
        <div className="hero-actions">
          <span className="status-pill success">Index ready</span>
          <span className="status-pill pending">Ingestion governed</span>
        </div>
      </section>

      <section className="page-grid dashboard-grid">
        <div className="surface-card form-card deploy-form-card">
          <div className="section-title">
            <h2>Upload and index</h2>
            <p>Connect documents to an agent and start indexing immediately.</p>
          </div>
          <label>
            Agent
            <select value={agentId} onChange={(event) => setAgentId(event.target.value)}>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>{agent.name}</option>
              ))}
            </select>
          </label>
          <label className="dropzone">
            File
            <input type="file" onChange={(event: ChangeEvent<HTMLInputElement>) => setFile(event.target.files?.[0] ?? null)} />
            <span>{file ? file.name : "Drag and drop PDFs, DOCX, or TXT files here"}</span>
          </label>
          <button className="primary-button" disabled={!canSubmit || uploading} onClick={handleSubmit} type="button">
            {uploading ? "Uploading..." : "Upload and index"}
          </button>
          {error ? <p className="error-text">{error}</p> : null}
          {status ? <p className="success-text">{status}</p> : null}
        </div>

        <div className="surface-card">
          <div className="section-title">
            <h2>Ingestion status</h2>
            <p>Track knowledge sources and document health.</p>
          </div>
          <div className="stack-list">
            <div className="list-row"><div><strong>SharePoint</strong><p>Connected workspace sync</p></div><span className="status-pill success">Healthy</span></div>
            <div className="list-row"><div><strong>Azure Blob</strong><p>Blob-backed source import</p></div><span className="status-pill success">Healthy</span></div>
            <div className="list-row"><div><strong>Confluence</strong><p>Optional enterprise source</p></div><span className="status-pill pending">Configure</span></div>
            <div className="list-row"><div><strong>Vector index</strong><p>Embedding and chunk pipeline</p></div><span className="status-pill success">Ready</span></div>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
