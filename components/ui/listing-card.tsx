import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { MapPin, Users, Zap } from "lucide-react";

interface ListingCardProps {
  listing: any;
  onClick?: () => void;
  className?: string;
}

const TYPE_STYLES: Record<string, string> = {
  Internship: "badge-internship",
  "Part-time": "badge-parttime",
  "Full-time": "badge-fulltime",
};

function normalizeSkills(listing: any): Array<{ id: string; name: string }> {
  if (listing.skills) return listing.skills;
  if (listing.listing_skills) {
    return listing.listing_skills.map((ls: any) => ls.skills || ls).filter(Boolean);
  }
  return [];
}

function normalizeCompany(listing: any) {
  if (listing.company) return listing.company;
  const cp = listing.company_profiles;
  if (!cp) return { company_name: "Company" };
  return Array.isArray(cp) ? cp[0] : cp;
}

export function ListingCard({ listing, onClick, className }: ListingCardProps) {
  const company = normalizeCompany(listing);
  const skills = normalizeSkills(listing);
  const typeStyle = TYPE_STYLES[listing.listing_type] || "";

  return (
    <div
      onClick={onClick}
      className={cn(
        "group bg-surface border border-border rounded-xl p-5 flex flex-col gap-4 cursor-pointer shadow-card transition-all duration-150 hover:shadow-card-hover hover:-translate-y-0.5 hover:border-accent/30",
        className
      )}
    >
      {/* Company row */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          {company.logo_url ? (
            <img
              src={company.logo_url}
              alt={company.company_name}
              className="w-8 h-8 rounded-lg object-cover shrink-0 border border-border"
            />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
              <span className="text-accent font-bold text-sm leading-none">
                {company.company_name?.charAt(0) || "?"}
              </span>
            </div>
          )}
          <span className="text-sm font-medium text-foreground-muted truncate">
            {company.company_name}
          </span>
        </div>
        <span className="text-xs text-foreground-faint whitespace-nowrap shrink-0">
          {listing.created_at
            ? formatDistanceToNow(new Date(listing.created_at), { addSuffix: true })
            : "Recently"}
        </span>
      </div>

      {/* Title + badges */}
      <div className="space-y-2.5">
        <h3 className="text-base font-semibold text-foreground leading-snug group-hover:text-accent transition-colors">
          {listing.title}
        </h3>
        <div className="flex flex-wrap gap-1.5">
          <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full border", typeStyle)}>
            {listing.listing_type}
          </span>
          {listing.focus_area && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-surface-raised border border-border text-foreground-muted">
              {listing.focus_area}
            </span>
          )}
          {listing.experience_level && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-surface-raised border border-border text-foreground-muted">
              {listing.experience_level}
            </span>
          )}
        </div>
      </div>

      {/* Skills */}
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {skills.slice(0, 4).map((skill: any) => (
            <span
              key={skill.id || skill.name}
              className="text-xs px-2 py-0.5 rounded-md bg-accent/8 text-accent border border-accent/20 font-medium"
              style={{ backgroundColor: "hsl(224 90% 56% / 0.08)" }}
            >
              {skill.name}
            </span>
          ))}
          {skills.length > 4 && (
            <span className="text-xs text-foreground-faint px-1 py-0.5">
              +{skills.length - 4}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="mt-auto pt-3 flex items-center justify-between border-t border-border">
        <div className="flex items-center gap-1.5 text-xs text-foreground-muted">
          <Zap size={12} className="text-accent" />
          <span>{listing.slots_remaining ?? "?"} positions open</span>
        </div>
        <span className="text-xs font-medium text-accent opacity-0 group-hover:opacity-100 transition-opacity">
          View details →
        </span>
      </div>
    </div>
  );
}
