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

    const formData = new FormData();
    formData.append("tenantId", tenantId);
    formData.append("agentId", agentId);
    formData.append("file", file);

    await api.upload("/documents/upload", formData);
    await api.post(`/documents/${agentId}/index`, { tenantId });
    setStatus(`Uploaded ${file.name} and started indexing.`);
  }

  return (
    <AppShell title="Upload documents" description="Add documents to an agent and build its retrieval index.">
      <div className="surface-card form-card">
        <label>
          Agent
          <select value={agentId} onChange={(event) => setAgentId(event.target.value)}>
            {agents.map((agent) => (
              <option key={agent.id} value={agent.id}>{agent.name}</option>
            ))}
          </select>
        </label>
        <label>
          File
          <input type="file" onChange={(event: ChangeEvent<HTMLInputElement>) => setFile(event.target.files?.[0] ?? null)} />
        </label>
        <button className="primary-button" disabled={!canSubmit} onClick={handleSubmit} type="button">Upload and index</button>
        {status ? <p className="success-text">{status}</p> : null}
      </div>
    </AppShell>
  );
}
