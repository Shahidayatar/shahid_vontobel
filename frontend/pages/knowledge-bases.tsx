import { AppShell } from "../components/AppShell";

export default function KnowledgeBasesPage() {
  return (
    <AppShell title="Knowledge bases" description="Manage RAG sources, sync jobs, chunking, and retrieval health for enterprise knowledge.">
      <section className="hero-panel dashboard-hero">
        <div>
          <p className="eyebrow">Enterprise RAG</p>
          <h1>Knowledge sources</h1>
          <p className="hero-copy">Connect SharePoint, Confluence, blob storage, and uploaded documents into governed retrieval pipelines.</p>
        </div>
      </section>
      <section className="page-grid dashboard-grid">
        <article className="surface-card dashboard-panel">
          <div className="section-title"><h2>Sources</h2><p>Active enterprise knowledge sources.</p></div>
          <div className="stack-list">
            <div className="list-row"><div><strong>SharePoint</strong><p>Office content and team libraries</p></div><span className="status-pill success">Connected</span></div>
            <div className="list-row"><div><strong>Confluence</strong><p>Product and engineering docs</p></div><span className="status-pill pending">Planned</span></div>
            <div className="list-row"><div><strong>Azure Blob</strong><p>Uploaded PDFs and source files</p></div><span className="status-pill success">Connected</span></div>
          </div>
        </article>
        <article className="surface-card dashboard-panel">
          <div className="section-title"><h2>Index health</h2><p>Chunking, embeddings, and sync status.</p></div>
          <div className="stack-list">
            <div className="list-row"><div><strong>Chunks indexed</strong><p>Vectorized text units</p></div><strong>1,248</strong></div>
            <div className="list-row"><div><strong>Embedding model</strong><p>Tenant-wide vector model</p></div><strong>text-embedding-3-large</strong></div>
            <div className="list-row"><div><strong>Last sync</strong><p>Latest ingestion run</p></div><strong>6 min ago</strong></div>
          </div>
        </article>
      </section>
    </AppShell>
  );
}