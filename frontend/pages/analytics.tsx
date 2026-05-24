import { useEffect, useState } from "react";
import { AppShell } from "../components/AppShell";
import { api } from "../services/api";
import { useTenantId } from "../hooks/useTenantId";

type UsageResponse = {
  requestCount: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCostUsd: number;
};

export default function AnalyticsPage() {
  const tenantId = useTenantId();
  const [usage, setUsage] = useState<UsageResponse | null>(null);

  useEffect(() => {
    if (!tenantId) {
      return;
    }

    api.get<UsageResponse>(`/usage/${encodeURIComponent(tenantId)}`).then(setUsage);
  }, [tenantId]);

  return (
    <AppShell title="Analytics" description="Track token usage, cost, latency, and platform health across the tenant.">
      <section className="hero-panel dashboard-hero">
        <div>
          <p className="eyebrow">Observability</p>
          <h1>Usage and cost analytics</h1>
          <p className="hero-copy">Understand platform adoption, cost posture, and performance trends across the tenant.</p>
        </div>
        <div className="hero-actions">
          <span className="status-pill success">Export ready</span>
          <span className="status-pill pending">Last 30 days</span>
        </div>
      </section>

      <section className="page-grid metrics-grid dashboard-metrics">
        <article className="surface-card metric-card">
          <span>Requests</span>
          <strong>{usage?.requestCount ?? 0}</strong>
        </article>
        <article className="surface-card metric-card">
          <span>Input tokens</span>
          <strong>{usage?.totalInputTokens ?? 0}</strong>
        </article>
        <article className="surface-card metric-card">
          <span>Output tokens</span>
          <strong>{usage?.totalOutputTokens ?? 0}</strong>
        </article>
        <article className="surface-card metric-card">
          <span>Estimated cost</span>
          <strong>${usage?.totalCostUsd?.toFixed(4) ?? "0.0000"}</strong>
        </article>
      </section>

      <section className="page-grid dashboard-grid">
        <article className="surface-card dashboard-panel">
          <div className="section-title"><h2>Cost trend</h2><p>Daily run-rate estimate for the current tenant.</p></div>
          <div className="mini-chart">
            <span style={{ height: "22%" }} />
            <span style={{ height: "38%" }} />
            <span style={{ height: "31%" }} />
            <span style={{ height: "55%" }} />
            <span style={{ height: "44%" }} />
            <span style={{ height: "65%" }} />
            <span style={{ height: "52%" }} />
          </div>
        </article>
        <article className="surface-card dashboard-panel">
          <div className="section-title"><h2>Platform health</h2><p>Key signals for AI Foundry operations.</p></div>
          <div className="stack-list">
            <div className="list-row"><div><strong>API latency</strong><p>Median response time</p></div><span className="status-pill success">Healthy</span></div>
            <div className="list-row"><div><strong>Search index</strong><p>Vector index and chunk sync</p></div><span className="status-pill success">Healthy</span></div>
            <div className="list-row"><div><strong>Deployment uptime</strong><p>Model and agent services</p></div><span className="status-pill pending">Review</span></div>
          </div>
        </article>
      </section>
    </AppShell>
  );
}
