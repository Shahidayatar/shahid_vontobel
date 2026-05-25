"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, Brain, LayoutDashboard, MessageSquareText, ServerCog } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/models", label: "Models", icon: ServerCog },
  { href: "/model-chat", label: "Model Chat", icon: MessageSquareText },
  { href: "/agents", label: "Agents", icon: Brain },
  { href: "/agent-chat", label: "Agent Chat", icon: Bot }
];

type AppShellProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

export function AppShell({ title, subtitle, children }: AppShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="mx-auto grid max-w-[1600px] gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="glass rounded-2xl p-4">
          <div className="mb-8 px-2 pt-1">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-cyan-200/70">AI Foundry</p>
            <h1 className="mt-2 text-2xl font-bold">FoundryOS</h1>
            <p className="mt-1 text-sm text-slate-300/80">Enterprise AI Control Plane</p>
          </div>
          <nav className="space-y-1">
            {nav.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                    active
                      ? "bg-cyan-400/15 text-cyan-100"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="space-y-6">
          <header className="glass rounded-2xl p-6">
            <h2 className="text-3xl font-semibold tracking-tight">{title}</h2>
            <p className="mt-2 text-sm text-slate-300/80">{subtitle}</p>
          </header>
          <div className="space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}