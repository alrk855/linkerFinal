import { cn } from "@/lib/utils";

interface ProfileCompletenessProps {
  value: number;
  className?: string;
}

export function ProfileCompleteness({ value, className }: ProfileCompletenessProps) {
  // Clamp value between 0 and 100
  const clampedValue = Math.max(0, Math.min(100, value));
  
  return (
    <div className={cn("flex flex-col gap-1.5 w-full", className)}>
      <div className="flex justify-between items-center text-xs font-medium text-foreground-muted">
        <span>Комплетност на профил</span>
        <span>{Math.round(clampedValue)}%</span>
      </div>
      <div className="h-1.5 w-full bg-surface-raised rounded-full overflow-hidden">
        <div 
          className="h-full bg-accent transition-all duration-500 ease-out"
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
}
