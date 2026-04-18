import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface VerifiedBadgeProps {
  size?: "sm" | "md";
  className?: string;
}

export function VerifiedBadge({ size = "md", className }: VerifiedBadgeProps) {
  if (size === "sm") {
    return (
      <div 
        className={cn("text-verified", className)} 
        title="Verified Student"
      >
        <BadgeCheck size={14} className="fill-current bg-background rounded-full" />
      </div>
    );
  }

  return (
    <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium border border-verified rounded-md text-verified bg-verified/10", className)}>
      <BadgeCheck size={14} className="fill-current text-background bg-verified rounded-full border border-background" />
      <span>Verified Student</span>
    </div>
  );
}
