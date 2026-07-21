"use client";

import { ExternalLink, Github, Server, Globe, GitBranch, Database, ShieldCheck, Cpu } from "lucide-react";
import { Card } from "@/components/ui/card";

const GITHUB_REPO = "https://github.com/Shahidayatar/shahid_vontobel";

const ARCH_IMAGE_1 = "https://github.com/user-attachments/assets/650017dc-de86-4225-b8da-3e55d9d40536";
const ARCH_IMAGE_2 = "https://github.com/user-attachments/assets/fa9a8311-785e-4a52-b1e8-cd43639cb004";

export function ProjectInfoView() {
  return (
    <div className="space-y-8">

      {/* GitHub link */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Github className="h-5 w-5 text-cyan-300" />
            <div>
              <p className="font-semibold">GitHub Repository</p>
              <p className="text-sm text-slate-400">Shahidayatar / shahid_vontobel</p>
            </div>
          </div>
          <a
            href={GITHUB_REPO}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-xl bg-cyan-500/15 px-4 py-2 text-sm font-medium text-cyan-300 transition hover:bg-cyan-500/25"
          >
            Open repo <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </Card>

      {/* What is this app */}
      <Card>
        <h3 className="mb-3 text-lg font-semibold text-white">What is this app?</h3>
        <p className="text-sm leading-relaxed text-slate-300">
          <strong className="text-white">AI Foundry as a Service</strong> is an internal enterprise platform that lets teams
          deploy Azure OpenAI model deployments, build RAG-powered AI agents on top of them, and chat through a self-service portal —
          all without needing direct Azure console access. It was built as a reusable scaffold for multi-tenant AI adoption inside an organisation.
        </p>
        <ul className="mt-4 space-y-2 text-sm text-slate-300">
          <li className="flex items-start gap-2"><Cpu className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" /><span><strong className="text-white">Models</strong> — Provision and manage Azure OpenAI deployments (GPT-4o, GPT-4.1, Embeddings)</span></li>
          <li className="flex items-start gap-2"><Server className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" /><span><strong className="text-white">Agents</strong> — Create AI assistants with custom system prompts, temperature control, and optional RAG retrieval</span></li>
          <li className="flex items-start gap-2"><Globe className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" /><span><strong className="text-white">Chat</strong> — Chat directly with model deployments or with agents (grounded via Azure AI Search)</span></li>
          <li className="flex items-start gap-2"><Database className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" /><span><strong className="text-white">Documents</strong> — Upload documents, chunk, embed, and index them into Azure AI Search for RAG retrieval</span></li>
          <li className="flex items-start gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" /><span><strong className="text-white">Observability</strong> — Token usage, latency, cost tracking, and deployment health visible on the dashboard</span></li>
        </ul>
      </Card>

      {/* Architecture diagrams */}
      <Card>
        <h3 className="mb-4 text-lg font-semibold text-white">Architecture Diagrams</h3>
        <div className="space-y-6">
          <div>
            <p className="mb-2 text-xs uppercase tracking-widest text-cyan-300/70">High-level platform architecture</p>
            <img
              src={ARCH_IMAGE_1}
              alt="High-level platform architecture"
              className="w-full rounded-xl border border-white/10"
            />
          </div>
          <div>
            <p className="mb-2 text-xs uppercase tracking-widest text-cyan-300/70">Azure services topology</p>
            <img
              src={ARCH_IMAGE_2}
              alt="Azure services topology"
              className="w-full rounded-xl border border-white/10"
            />
          </div>
        </div>
      </Card>

      {/* How it works — flows */}
      <Card>
        <h3 className="mb-4 text-lg font-semibold text-white">How It Works</h3>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-cyan-300">Agent Creation</p>
            <ol className="list-inside list-decimal space-y-1 text-sm text-slate-300">
              <li>User opens the Agents page and submits the create-agent form</li>
              <li>Frontend calls <code className="rounded bg-white/10 px-1 text-xs">POST /api/agents</code></li>
              <li>Backend stores the agent with system prompt and config</li>
              <li>Agent is immediately available for document upload and chat</li>
            </ol>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold text-cyan-300">RAG Ingestion</p>
            <ol className="list-inside list-decimal space-y-1 text-sm text-slate-300">
              <li>User uploads a document from the Documents page</li>
              <li>Backend stores the file and extracts text</li>
              <li>Text is chunked, embedded via Azure OpenAI, and pushed to Azure AI Search</li>
              <li>Chunks are now available for grounded retrieval during agent chat</li>
            </ol>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold text-cyan-300">Chat Runtime</p>
            <ol className="list-inside list-decimal space-y-1 text-sm text-slate-300">
              <li>User asks a question in Agent Chat</li>
              <li>Backend retrieves top-3 relevant chunks from Azure AI Search</li>
              <li>Chunks are injected as context into the system prompt</li>
              <li>Azure OpenAI returns a grounded answer with citations</li>
              <li>Transcript is saved to Azure Blob Storage</li>
            </ol>
          </div>
        </div>
      </Card>

      {/* Azure Infrastructure */}
      <Card>
        <h3 className="mb-4 text-lg font-semibold text-white">Azure Infrastructure (Terraform)</h3>
        <p className="mb-4 text-sm text-slate-400">All infrastructure was provisioned with Terraform from <code className="rounded bg-white/10 px-1 text-xs">infra/terraform/</code>. Resource group: <code className="rounded bg-white/10 px-1 text-xs">Shahid_vontobel</code></p>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { name: "Azure App Service", detail: "shahid-vontobel-api · Linux B1 · swedencentral · Node 22 LTS", icon: "🖥️" },
            { name: "Azure Static Web App", detail: "shahid-vontobel-swa · Standard tier · eastus2 · Next.js frontend", icon: "🌐" },
            { name: "Azure OpenAI", detail: "shahid-openai · S0 · GPT-4o + Embeddings · Managed Identity auth", icon: "🤖" },
            { name: "Azure AI Search", detail: "shahid-search · Standard SKU · vector index for RAG retrieval", icon: "🔍" },
            { name: "Azure Blob Storage", detail: "shahidstgacct01 · LRS · TLS 1.2 · chat transcript storage", icon: "📦" },
            { name: "Azure Key Vault", detail: "shahid-kv · RBAC-enabled · soft-delete 7 days · secrets storage", icon: "🔐" },
            { name: "Application Insights", detail: "shahid-appi · workspace-based · Log Analytics 30-day retention", icon: "📊" },
            { name: "User-Assigned Managed Identity", detail: "Assigned to App Service — no secrets in code or environment", icon: "🛡️" },
          ].map((r) => (
            <div key={r.name} className="flex items-start gap-3 rounded-xl border border-white/10 p-3">
              <span className="text-lg">{r.icon}</span>
              <div>
                <p className="text-sm font-semibold text-white">{r.name}</p>
                <p className="mt-0.5 text-xs text-slate-400">{r.detail}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-xl bg-white/5 p-3 text-xs text-slate-400">
          <strong className="text-slate-300">RBAC roles assigned to the managed identity:</strong>{" "}
          Storage Blob Data Contributor · Key Vault Secrets Officer · Search Index Data Contributor · Cognitive Services OpenAI Contributor
        </div>
      </Card>

      {/* CI/CD */}
      <Card>
        <h3 className="mb-4 text-lg font-semibold text-white">CI / CD — GitHub Actions</h3>
        <p className="mb-4 text-sm text-slate-400">Three workflows in <code className="rounded bg-white/10 px-1 text-xs">.github/workflows/</code> — all triggered on push to <code className="rounded bg-white/10 px-1 text-xs">main</code>.</p>
        <div className="space-y-4">
          <div className="rounded-xl border border-white/10 p-4">
            <div className="flex items-center gap-2 mb-2">
              <GitBranch className="h-4 w-4 text-cyan-400" />
              <p className="text-sm font-semibold text-white">frontend-deploy.yml</p>
              <span className="ml-auto rounded bg-cyan-500/15 px-2 py-0.5 text-xs text-cyan-300">Azure Static Web Apps</span>
            </div>
            <ol className="list-inside list-decimal space-y-1 text-xs text-slate-300">
              <li>Checkout → Node 18 setup</li>
              <li>Install frontend deps (<code className="rounded bg-white/10 px-1">npm ci</code>)</li>
              <li>Build Next.js with <code className="rounded bg-white/10 px-1">NEXT_PUBLIC_API_BASE_URL=https://shahid-vontobel-api.azurewebsites.net</code></li>
              <li>Deploy <code className="rounded bg-white/10 px-1">./frontend/.next</code> to Azure SWA via <code className="rounded bg-white/10 px-1">Azure/static-web-apps-deploy@v1</code></li>
            </ol>
            <p className="mt-2 text-xs text-slate-500">Secret used: <code className="rounded bg-white/10 px-1">AZURE_STATIC_WEBAPP_API_TOKEN</code></p>
          </div>

          <div className="rounded-xl border border-white/10 p-4">
            <div className="flex items-center gap-2 mb-2">
              <GitBranch className="h-4 w-4 text-cyan-400" />
              <p className="text-sm font-semibold text-white">backend-deploy.yml</p>
              <span className="ml-auto rounded bg-cyan-500/15 px-2 py-0.5 text-xs text-cyan-300">Azure App Service</span>
            </div>
            <ol className="list-inside list-decimal space-y-1 text-xs text-slate-300">
              <li>Checkout → Node 18 setup</li>
              <li>Install deps and compile TypeScript (<code className="rounded bg-white/10 px-1">npm run build</code>)</li>
              <li>Package <code className="rounded bg-white/10 px-1">dist/</code> + production <code className="rounded bg-white/10 px-1">node_modules</code> into <code className="rounded bg-white/10 px-1">backend-deploy.zip</code></li>
              <li>Deploy zip to App Service <code className="rounded bg-white/10 px-1">shahid-vontobel-api</code> via <code className="rounded bg-white/10 px-1">azure/webapps-deploy@v2</code></li>
            </ol>
            <p className="mt-2 text-xs text-slate-500">Secret used: <code className="rounded bg-white/10 px-1">AZURE_WEBAPP_PUBLISH_PROFILE</code></p>
          </div>

          <div className="rounded-xl border border-white/10 p-4">
            <div className="flex items-center gap-2 mb-2">
              <GitBranch className="h-4 w-4 text-cyan-400" />
              <p className="text-sm font-semibold text-white">ci.yml</p>
              <span className="ml-auto rounded bg-cyan-500/15 px-2 py-0.5 text-xs text-cyan-300">Validation</span>
            </div>
            <p className="text-xs text-slate-300">Runs linting and type-checking on every push to validate the codebase before deployment workflows proceed.</p>
          </div>
        </div>
      </Card>

      {/* Tech stack */}
      <Card>
        <h3 className="mb-4 text-lg font-semibold text-white">Tech Stack</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { layer: "Frontend", stack: "Next.js 14 · App Router · Tailwind CSS · React Query · Zustand · Framer Motion" },
            { layer: "Backend", stack: "Node.js · Express · TypeScript · Zod · Azure SDK · DefaultAzureCredential" },
            { layer: "AI / Data", stack: "Azure OpenAI (GPT-4o) · Azure AI Search (vector RAG) · Azure Blob Storage" },
            { layer: "Infra / DevOps", stack: "Terraform · Azure App Service · Azure Static Web Apps · GitHub Actions" },
          ].map((t) => (
            <div key={t.layer} className="rounded-xl border border-white/10 p-3">
              <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-cyan-300">{t.layer}</p>
              <p className="text-xs leading-relaxed text-slate-300">{t.stack}</p>
            </div>
          ))}
        </div>
      </Card>

    </div>
  );
}
