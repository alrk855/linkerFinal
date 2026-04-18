import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-8 border-b border-border-subtle mb-8", className)}>
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">{title}</h1>
        {description && <p className="text-sm text-foreground-muted">{description}</p>}
      </div>
      {actions && (
        <div className="flex items-center gap-3">
          {actions}
        </div>
      )}
    </div>
  );
}
