import { AppShell } from "../components/AppShell";

export default function EvaluationsPage() {
  return (
    <AppShell title="Evaluations" description="Track regression tests, groundedness scores, and safety reviews for agents and prompts.">
      <section className="page-grid metrics-grid dashboard-metrics">
        <article className="surface-card metric-card"><span>Eval runs</span><strong>84</strong></article>
        <article className="surface-card metric-card"><span>Pass rate</span><strong>96%</strong></article>
        <article className="surface-card metric-card"><span>Safety score</span><strong>98</strong></article>
        <article className="surface-card metric-card"><span>RAG accuracy</span><strong>91%</strong></article>
      </section>
    </AppShell>
  );
}