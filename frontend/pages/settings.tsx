import { AppShell } from "../components/AppShell";

export default function SettingsPage() {
  return (
    <AppShell title="Settings" description="Configure tenants, RBAC, safety, telemetry, and platform operating defaults.">
      <section className="page-grid dashboard-grid">
        <article className="surface-card dashboard-panel"><div className="section-title"><h2>Tenant policy</h2><p>Identity, isolation, and governance.</p></div><div className="stack-list"><div className="list-row"><div><strong>RBAC</strong><p>Admin, Platform Engineer, AI Developer, Viewer</p></div><span className="status-pill success">Enabled</span></div><div className="list-row"><div><strong>Entra ID</strong><p>Workspace-backed authentication</p></div><span className="status-pill success">Enabled</span></div></div></article>
        <article className="surface-card dashboard-panel"><div className="section-title"><h2>Telemetry</h2><p>Logging, metrics, and trace settings.</p></div><div className="stack-list"><div className="list-row"><div><strong>App Insights</strong><p>Structured request telemetry</p></div><span className="status-pill success">Enabled</span></div><div className="list-row"><div><strong>Audit logs</strong><p>Control plane actions</p></div><span className="status-pill pending">Configure</span></div></div></article>
      </section>
    </AppShell>
  );
}