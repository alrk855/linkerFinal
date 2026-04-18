import { cn } from "@/lib/utils";
import { SkillTag } from "@/components/ui/skill-tag";
import { formatDistanceToNow } from "date-fns";
import { Building2 } from "lucide-react";

interface ListingCardProps {
  listing: any;
  onClick?: () => void;
  className?: string;
}

export function ListingCard({ listing, onClick, className }: ListingCardProps) {
  // Safe defaults
  const company = listing.company || { company_name: "Company Name", logo_url: "" };
  const skills = listing.skills || [];

  return (
    <div 
      onClick={onClick}
      className={cn(
        "bg-surface border border-border rounded-xl p-5 flex flex-col gap-4 transition-all hover:border-border-subtle hover:bg-surface-raised cursor-pointer",
        className
      )}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          {company.logo_url ? (
            <img src={company.logo_url} alt={company.company_name} className="w-8 h-8 rounded-md bg-surface-raised object-cover shrink-0" />
          ) : (
            <div className="w-8 h-8 rounded-md bg-surface-raised border border-border flex items-center justify-center shrink-0">
              <Building2 size={16} className="text-foreground-faint" />
            </div>
          )}
          <span className="text-sm font-medium text-foreground-muted">{company.company_name}</span>
        </div>
        <span className="text-xs text-foreground-faint">
          {listing.created_at ? formatDistanceToNow(new Date(listing.created_at), { addSuffix: true }) : "Recently"}
        </span>
      </div>

      <div className="space-y-1.5">
        <h3 className="text-lg font-medium text-foreground tracking-tight">{listing.title}</h3>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="text-foreground-muted bg-background border border-border px-2 py-[1px] rounded-md">{listing.listing_type}</span>
          {listing.focus_area && <span className="text-foreground-muted bg-background border border-border px-2 py-[1px] rounded-md">{listing.focus_area}</span>}
          {listing.experience_level && <span className="text-foreground-muted bg-background border border-border px-2 py-[1px] rounded-md">{listing.experience_level}</span>}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {skills.slice(0, 4).map((skill: any) => (
          <SkillTag key={skill.id} name={skill.name} />
        ))}
        {skills.length > 4 && (
          <span className="text-xs font-mono text-foreground-faint py-0.5 px-1 bg-transparent">+{skills.length - 4} more</span>
        )}
      </div>

      <div className="mt-auto pt-4 flex items-center justify-between border-t border-border-subtle">
        <span className="text-sm text-foreground-muted">{listing.slots_remaining} positions available</span>
        <button className="text-sm font-medium text-foreground px-3 py-1.5 rounded-md hover:bg-surface-raised transition-colors focus:outline-none">
          View details
        </button>
      </div>
    </div>
  );
}
