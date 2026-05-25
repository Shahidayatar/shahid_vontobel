"use client";

import { motion } from "framer-motion";
import { Activity, Bot, Coins, Cpu, Sparkles } from "lucide-react";
import { useDashboard } from "@/hooks/use-dashboard";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatNumber } from "@/lib/utils";

const metricCards = [
  { key: "totalModels", label: "Total Deployed Models", icon: Cpu },
  { key: "activeAgents", label: "Active Agents", icon: Bot },
  { key: "tokenUsage", label: "Token Usage", icon: Sparkles },
  { key: "monthlyCost", label: "Estimated Monthly Cost", icon: Coins }
] as const;

export function DashboardView() {
  const { data, isLoading } = useDashboard();

  return (
    <div className="space-y-6">
      <section className="section-grid">
        {metricCards.map((metric, index) => {
          const Icon = metric.icon;
          const value = data?.[metric.key] ?? 0;
          const displayValue = metric.key === "monthlyCost" ? formatCurrency(Number(value)) : formatNumber(Number(value));
          return (
            <motion.div
              key={metric.key}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card>
                <div className="mb-4 flex items-start justify-between">
                  <p className="text-sm text-slate-300">{metric.label}</p>
                  <Icon className="h-4 w-4 text-cyan-200" />
                </div>
                {isLoading ? <Skeleton className="h-8 w-24" /> : <h3 className="text-3xl font-bold">{displayValue}</h3>}
              </Card>
            </motion.div>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <Card>
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Deployment Health</h3>
            <Activity className="h-4 w-4 text-cyan-200" />
          </div>
          <div className="space-y-3">
            {[
              { label: "Healthy", value: data?.health.healthy ?? 0, tone: "success" as const },
              { label: "Degraded", value: data?.health.degraded ?? 0, tone: "warning" as const },
              { label: "Offline", value: data?.health.offline ?? 0, tone: "danger" as const }
            ].map((row) => (
              <div key={row.label} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">{row.label}</span>
                  <Badge label={`${row.value}`} tone={row.tone} />
                </div>
                <div className="h-2 rounded-full bg-white/10">
                  <div className="h-2 rounded-full bg-cyan-300" style={{ width: `${Math.min(100, row.value * 10)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="mb-4 text-lg font-semibold">Recent Chats</h3>
          <div className="space-y-3">
            {(data?.recentChats ?? []).length === 0 ? (
              <p className="rounded-xl border border-dashed border-white/20 p-4 text-sm text-slate-300">
                No recent chats yet. Start validating a model in Model Chat.
              </p>
            ) : (
              data?.recentChats.map((chat) => (
                <div key={chat.id} className="rounded-xl bg-white/5 p-3">
                  <p className="text-sm font-medium">{chat.title}</p>
                  <p className="mt-1 text-xs text-slate-400">{chat.target}</p>
                </div>
              ))
            )}
          </div>
        </Card>
      </section>
    </div>
  );
}
