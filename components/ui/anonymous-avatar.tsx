import { cn } from "@/lib/utils";

interface AnonymousAvatarProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-16 h-16",
  xl: "w-24 h-24",
};

export function AnonymousAvatar({ className, size = "md" }: AnonymousAvatarProps) {
  return (
    <div 
      className={cn(
        "bg-surface border border-border rounded-full flex items-center justify-center shrink-0", 
        sizeClasses[size], 
        className
      )}
    >
      <svg 
        className="text-foreground-faint w-1/2 h-1/2" 
        viewBox="0 0 24 24" 
        fill="currentColor"
      >
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
      </svg>
    </div>
  );
}
