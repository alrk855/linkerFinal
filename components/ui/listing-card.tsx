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
        "group relative bg-surface border border-border rounded-2xl p-5 sm:p-6 flex flex-col gap-4 cursor-pointer shadow-sm hover:shadow-md transition-all duration-300",
        className
      )}
    >
      {/* Top row: Company and Date */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {company.logo_url ? (
            <img
              src={company.logo_url}
              alt={company.company_name}
              className="w-10 h-10 rounded-xl object-cover shrink-0 border border-border shadow-sm"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shrink-0 shadow-sm">
              <span className="text-white font-bold text-base leading-none">
                {company.company_name?.charAt(0) || "?"}
              </span>
            </div>
          )}
          <div className="flex flex-col truncate">
            <span className="text-sm font-semibold text-foreground truncate">
              {company.company_name}
            </span>
            <span className="text-xs text-foreground-muted truncate">
              {listing.focus_area || "Software"}
            </span>
          </div>
        </div>
        <span className="text-xs text-foreground-faint whitespace-nowrap shrink-0 self-start mt-1">
          {listing.created_at
            ? formatDistanceToNow(new Date(listing.created_at), { addSuffix: true })
            : "Recently"}
        </span>
      </div>

      {/* Main content: Title + Badges */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground leading-tight tracking-tight group-hover:text-accent transition-colors">
          {listing.title}
        </h3>
        <div className="flex flex-wrap gap-2">
          <span className={cn("text-xs font-medium px-2.5 py-0.5 rounded-full border", typeStyle)}>
            {listing.listing_type}
          </span>
          {listing.experience_level && (
            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-surface-raised border border-border text-foreground-muted">
              {listing.experience_level}
            </span>
          )}
        </div>
      </div>

      {/* Skills */}
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-1">
          {skills.slice(0, 5).map((skill: any) => (
            <span
              key={skill.id || skill.name}
              className="text-[11px] px-2 py-0.5 rounded text-foreground-muted bg-surface-raised border border-border"
            >
              {skill.name}
            </span>
          ))}
          {skills.length > 5 && (
            <span className="text-[11px] text-foreground-faint px-1 py-0.5 font-medium">
              +{skills.length - 5}
            </span>
          )}
        </div>
      )}

      {/* Footer / Floating Button */}
      <div className="mt-2 pt-4 flex items-center justify-between border-t border-border-subtle relative">
        <div className="flex items-center gap-1.5 text-xs font-medium text-foreground-muted">
          <Zap size={14} className="text-accent" />
          <span>{listing.slots_remaining ?? "?"} open positions</span>
        </div>
        <div className="text-xs font-semibold text-accent flex items-center gap-1 transition-transform duration-300 group-hover:translate-x-1">
          View Details
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
}
