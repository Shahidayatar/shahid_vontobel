import { AppShell } from "../components/AppShell";

export default function ProfilePage() {
  return (
    <AppShell title="Profile" description="Manage your tenant membership, role, and workspace defaults.">
      <section className="page-grid dashboard-grid">
        <article className="surface-card dashboard-panel">
          <div className="section-title"><h2>User profile</h2><p>Current identity and workspace assignment.</p></div>
          <div className="stack-list">
            <div className="list-row"><div><strong>Name</strong><p>Tenant user</p></div><span className="status-pill success">Active</span></div>
            <div className="list-row"><div><strong>Role</strong><p>AI Developer</p></div><span className="status-pill pending">Scoped</span></div>
            <div className="list-row"><div><strong>Tenant</strong><p>tenant-dev</p></div><span className="status-pill success">Isolated</span></div>
          </div>
        </article>
      </section>
    </AppShell>
  );
}