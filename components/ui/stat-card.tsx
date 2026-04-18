import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  delta?: {
    value: string;
    trend: "up" | "down" | "neutral";
  };
  className?: string;
}

export function StatCard({ label, value, delta, className }: StatCardProps) {
  return (
    <div className={cn("bg-surface border border-border rounded-xl p-5 flex flex-col gap-2", className)}>
      <h4 className="text-sm font-medium text-foreground-muted">{label}</h4>
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-semibold text-foreground">{value}</span>
        {delta && (
          <span 
            className={cn(
              "text-xs font-medium",
              delta.trend === "up" ? "text-success" : delta.trend === "down" ? "text-destructive" : "text-foreground-muted"
            )}
          >
            {delta.trend === "up" ? "↑" : delta.trend === "down" ? "↓" : ""}{delta.value}
          </span>
        )}
      </div>
    </div>
  );
}
