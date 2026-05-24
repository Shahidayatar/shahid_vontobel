import Link from "next/link";
import type { ReactNode } from "react";

type AppShellProps = {
  title: string;
  description: string;
  children: ReactNode;
};

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/deploy-model", label: "Deploy Model" },
  { href: "/create-agent", label: "Create Agent" },
  { href: "/upload-documents", label: "Upload Documents" },
  { href: "/chat", label: "Chat" },
  { href: "/analytics", label: "Analytics" }
];

export function AppShell({ title, description, children }: AppShellProps) {
  return (
    <div className="app-background">
      <aside className="sidebar">
        <div className="brand-block">
          <span className="brand-mark" />
          <div>
            <strong>AI Foundry</strong>
            <p>Internal platform</p>
          </div>
        </div>

        <nav>
          {navItems.map((item) => (
            <Link className="nav-link" href={item.href} key={item.href}>{item.label}</Link>
          ))}
        </nav>
      </aside>

      <main className="content-shell">
        <header className="page-header">
          <div>
            <p className="eyebrow">Enterprise control plane</p>
            <h1>{title}</h1>
            <p className="hero-copy">{description}</p>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
