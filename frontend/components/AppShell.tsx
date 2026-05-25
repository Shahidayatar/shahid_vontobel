import Link from "next/link";
import { useRouter } from "next/router";
import type { ReactNode } from "react";

type AppShellProps = {
  title: string;
  description: string;
  children: ReactNode;
};

const navSections = [
  {
    label: "Core",
    items: [
      { href: "/dashboard", label: "Dashboard" },
      { href: "/model-catalog", label: "Model Catalog" },
      { href: "/agents", label: "Agents" },
      { href: "/knowledge-bases", label: "Knowledge Bases" },
      { href: "/upload-documents", label: "Document Uploads" },
      { href: "/chat", label: "Chat Playground" }
    ]
  }
];

export function AppShell({ title, description, children }: AppShellProps) {
  const router = useRouter();

  return (
    <div className="app-background">
      <aside className="sidebar">
        <div className="sidebar-shell">
          <div className="brand-block">
            <span className="brand-mark" />
            <div>
              <strong>AI Foundry</strong>
              <p>Enterprise control plane</p>
            </div>
          </div>

          <div className="tenant-badge">
            <span>Tenant</span>
            <strong>Internal platform</strong>
          </div>

          <nav className="sidebar-nav">
            {navSections.map((section) => (
              <div className="nav-section" key={section.label}>
                <p className="nav-section-label">{section.label}</p>
                {section.items.map((item) => {
                  const active = router.pathname === item.href;
                  return (
                    <Link className={`nav-link ${active ? "active" : ""}`} href={item.href} key={item.href}>
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>
      </aside>

      <main className="content-shell">
        <header className="page-header">
          <div className="page-header-copy">
            <div>
              <p className="eyebrow">Enterprise control plane</p>
              <h1>{title}</h1>
              <p className="hero-copy">{description}</p>
            </div>
            <div className="page-header-meta">
              <span className="status-pill success">Online</span>
              <span className="status-pill pending">Governed</span>
            </div>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
