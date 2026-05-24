import { AppShell } from "../components/AppShell";

export default function PromptStudioPage() {
  return (
    <AppShell title="Prompt studio" description="Version, test, and govern enterprise prompt templates before they reach production.">
      <section className="hero-panel dashboard-hero">
        <div>
          <p className="eyebrow">Governance</p>
          <h1>Prompt studio</h1>
          <p className="hero-copy">Maintain prompt templates, approval flows, and role-specific instructions in one place.</p>
        </div>
      </section>
      <section className="page-grid dashboard-grid">
        <article className="surface-card dashboard-panel">
          <div className="section-title"><h2>Templates</h2><p>Approved prompt assets.</p></div>
          <div className="stack-list"><div className="list-row"><div><strong>Support copilot</strong><p>Policy-grounded helpdesk assistant</p></div><span className="status-pill success">Active</span></div><div className="list-row"><div><strong>Analyst assistant</strong><p>Executive reporting and summaries</p></div><span className="status-pill pending">Draft</span></div></div>
        </article>
        <article className="surface-card dashboard-panel">
          <div className="section-title"><h2>Preview</h2><p>Prompt inspection and version diff.</p></div>
          <div className="code-panel">System prompt preview\n\nUse approved enterprise knowledge only.\nReturn concise, cited, production-safe responses.</div>
        </article>
      </section>
    </AppShell>
  );
}