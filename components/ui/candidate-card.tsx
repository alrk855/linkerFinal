import { cn } from "@/lib/utils";
import { AnonymousAvatar } from "@/components/ui/anonymous-avatar";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { SkillTag } from "@/components/ui/skill-tag";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";

interface CandidateCardProps {
  candidate: any;
  onAcknowledge?: () => void;
  className?: string;
}

export function CandidateCard({ candidate, onAcknowledge, className }: CandidateCardProps) {
  // Safe defaults
  const skills = candidate.skills || [];
  
  return (
    <div className={cn("bg-surface border border-border rounded-xl p-5 flex flex-col gap-4", className)}>
      {/* Top Row */}
      <div className="flex items-center gap-3">
        <AnonymousAvatar size="md" />
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground">Anonymous Student</span>
            {candidate.is_verified_student && <VerifiedBadge size="sm" />}
          </div>
          <span className="text-sm text-foreground-muted">
            {candidate.faculty || "Unknown Faculty"} • {candidate.year_of_study ? `Year ${candidate.year_of_study}` : "Graduated"} • {candidate.degree_type || "BSc"}
          </span>
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2 text-xs font-medium">
        {candidate.focus_area && (
          <span className="bg-surface-raised border border-border text-foreground px-2 py-1 rounded-md">
            {candidate.focus_area}
          </span>
        )}
        {candidate.experience_level && (
          <span className="bg-surface-raised border border-border text-foreground px-2 py-1 rounded-md">
            {candidate.experience_level}
          </span>
        )}
      </div>

      {/* Skill Match Indicator - Mocked for visual */}
      <div className="space-y-1.5 mt-2">
        <div className="flex justify-between items-center text-xs">
          <span className="text-foreground-muted">Skill match</span>
          <span className="text-foreground font-medium">8 / 12 required</span>
        </div>
        <div className="h-1 bg-surface-raised rounded-full overflow-hidden">
          <div className="h-full bg-accent" style={{ width: '66%' }} />
        </div>
      </div>

      {/* Skills */}
      <div className="flex flex-wrap gap-1.5 mt-2">
        {skills.slice(0, 6).map((skill: any) => (
          <SkillTag key={skill.id} name={skill.name} />
        ))}
        {skills.length > 6 && (
          <span className="text-xs font-mono text-foreground-faint py-0.5 px-1">+{skills.length - 6} more</span>
        )}
      </div>

      {/* Bio excerpt */}
      <p className="text-sm text-foreground-muted line-clamp-2 mt-2">
        {candidate.bio || "This student hasn't written a bio yet, but their skills indicate a strong foundation in software engineering..."}
      </p>

      {/* Action */}
      <div className="mt-auto pt-4 flex gap-3">
        <Button 
          onClick={onAcknowledge}
          className="w-full bg-accent hover:bg-accent-hover text-background font-medium"
        >
          Acknowledge
        </Button>
      </div>
    </div>
  );
}
