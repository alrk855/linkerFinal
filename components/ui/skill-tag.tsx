import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface SkillTagProps {
  name: string;
  removable?: boolean;
  onRemove?: () => void;
  className?: string;
}

export function SkillTag({ name, removable, onRemove, className }: SkillTagProps) {
  return (
    <div className={cn("inline-flex items-center gap-1.5 bg-surface-raised border border-border text-foreground-muted text-xs font-mono rounded-md px-2 py-0.5", className)}>
      <span>{name}</span>
      {removable && (
        <button 
          type="button" 
          onClick={onRemove}
          className="hover:text-foreground text-foreground-faint focus:outline-none transition-colors"
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
}
