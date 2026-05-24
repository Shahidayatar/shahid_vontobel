import { AppShell } from "../components/AppShell";

export default function ApiKeysPage() {
  return (
    <AppShell title="API keys" description="Manage external integrations, client access, and secure operational credentials.">
      <section className="page-grid dashboard-grid">
        <article className="surface-card dashboard-panel"><div className="section-title"><h2>Service access</h2><p>Credential posture and distribution.</p></div><div className="stack-list"><div className="list-row"><div><strong>App Service</strong><p>Managed identity only</p></div><span className="status-pill success">Secure</span></div><div className="list-row"><div><strong>Integration key</strong><p>Rotated quarterly</p></div><span className="status-pill pending">Review</span></div></div></article>
        <article className="surface-card dashboard-panel"><div className="section-title"><h2>Key vault</h2><p>Secrets and distribution policies.</p></div><div className="stack-list"><div className="list-row"><div><strong>Azure OpenAI</strong><p>Zero direct exposure</p></div><span className="status-pill success">Vaulted</span></div><div className="list-row"><div><strong>Search access</strong><p>Private connector only</p></div><span className="status-pill success">Vaulted</span></div></div></article>
      </section>
    </AppShell>
  );
}