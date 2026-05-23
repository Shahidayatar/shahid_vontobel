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
    <AppShell title="Analytics" description="See tenant-level token usage and cost estimates across the platform.">
      <section className="page-grid metrics-grid">
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
    </AppShell>
  );
}
