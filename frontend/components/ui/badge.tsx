import { cn } from "@/lib/utils";

type BadgeProps = {
  label: string;
  tone?: "neutral" | "success" | "warning" | "danger";
};

const toneStyles: Record<NonNullable<BadgeProps["tone"]>, string> = {
  neutral: "bg-white/10 text-slate-200",
  success: "bg-emerald-400/20 text-emerald-200",
  warning: "bg-amber-400/20 text-amber-200",
  danger: "bg-rose-400/20 text-rose-200"
};

export function Badge({ label, tone = "neutral" }: BadgeProps) {
  return <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", toneStyles[tone])}>{label}</span>;
}
