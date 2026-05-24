import { AppShell } from "../components/AppShell";

export default function AdminPage() {
  return (
    <AppShell title="Admin panel" description="Platform administration, tenant governance, shared models, and operational controls.">
      <section className="page-grid dashboard-grid">
        <article className="surface-card dashboard-panel">
          <div className="section-title"><h2>Platform settings</h2><p>Central resources, shared deployments, and policy controls.</p></div>
          <div className="stack-list">
            <div className="list-row"><div><strong>Shared model set</strong><p>Configured by platform admin</p></div><span className="status-pill success">Active</span></div>
            <div className="list-row"><div><strong>Tenant isolation</strong><p>Index, blob, and analytics separation</p></div><span className="status-pill success">Enforced</span></div>
          </div>
        </article>
        <article className="surface-card dashboard-panel">
          <div className="section-title"><h2>Tenant directory</h2><p>Governed workspaces and access boundaries.</p></div>
          <div className="stack-list">
            <div className="list-row"><div><strong>tenant-dev</strong><p>Internal workspace</p></div><span className="status-pill pending">Default</span></div>
          </div>
        </article>
      </section>
    </AppShell>
  );
}