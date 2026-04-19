import { cn } from "@/lib/utils";
import { AnonymousAvatar } from "@/components/ui/anonymous-avatar";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { Button } from "@/components/ui/button";
import { GraduationCap } from "lucide-react";

interface CandidateCardProps {
  candidate: any;
  onAcknowledge?: () => void;
  loading?: boolean;
  className?: string;
}

const FOCUS_COLORS: Record<string, string> = {
  frontend: "bg-blue-50 text-blue-700 border-blue-200",
  backend: "bg-emerald-50 text-emerald-700 border-emerald-200",
  fullstack: "bg-violet-50 text-violet-700 border-violet-200",
  mobile: "bg-orange-50 text-orange-700 border-orange-200",
  devops: "bg-slate-50 text-slate-700 border-slate-200",
  data: "bg-amber-50 text-amber-700 border-amber-200",
  security: "bg-red-50 text-red-700 border-red-200",
};

function mkLabel(value?: string | null) {
  const key = (value || "").toLowerCase();
  if (key === "frontend") return "Фронтенд";
  if (key === "backend") return "Бекенд";
  if (key === "fullstack") return "Фулстек";
  if (key === "mobile") return "Мобилен развој";
  if (key === "devops") return "DevOps";
  if (key === "data") return "Податоци";
  if (key === "security") return "Безбедност";
  if (key === "no_experience") return "Без искуство";
  if (key === "junior") return "Јуниор";
  if (key === "mid") return "Средно";
  if (key === "senior") return "Сениор";
  if (key === "bachelor") return "Дипломски";
  if (key === "master") return "Магистерски";
  if (key === "phd") return "Докторски";
  return value || "";
}

export function CandidateCard({ candidate, onAcknowledge, loading, className }: CandidateCardProps) {
  const skills = candidate.skills || [];
  const focusKey = (candidate.focus_area || "").toLowerCase();
  const focusColor = FOCUS_COLORS[focusKey] || "bg-surface-raised text-foreground-muted border-border";
  const matchScore = candidate.match_score ?? null;

  return (
    <div className={cn(
      "bg-surface border border-border rounded-xl p-5 flex flex-col gap-4 shadow-card hover:shadow-card-hover hover:border-accent/30 transition-all duration-150",
      className
    )}>
      {/* Header */}
      <div className="flex items-start gap-3">
        <AnonymousAvatar size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-foreground">Анонимен студент</span>
            {candidate.is_verified_student && <VerifiedBadge size="sm" />}
          </div>
          <div className="flex items-center gap-1.5 text-sm text-foreground-muted mt-0.5">
            <GraduationCap size={13} />
            <span>
              {candidate.faculty || "Непознато"}
              {candidate.year_of_study ? ` · Година ${candidate.year_of_study}` : ""}
              {candidate.degree_type ? ` · ${mkLabel(candidate.degree_type)}` : ""}
            </span>
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2">
        {candidate.focus_area && (
          <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full border", focusColor)}>
            {mkLabel(candidate.focus_area)}
          </span>
        )}
        {candidate.experience_level && (
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-surface-raised border border-border text-foreground-muted">
            {mkLabel(candidate.experience_level)}
          </span>
        )}
      </div>

      {/* Skill match bar (if score provided) */}
      {matchScore !== null && (
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-foreground-muted font-medium">Совпаѓање на вештини</span>
            <span className={cn(
              "font-bold",
              matchScore >= 75 ? "text-success" : matchScore >= 50 ? "text-accent" : "text-foreground-muted"
            )}>
              {matchScore}%
            </span>
          </div>
          <div className="h-1.5 bg-surface-raised rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                matchScore >= 75 ? "bg-success" : matchScore >= 50 ? "bg-accent" : "bg-border"
              )}
              style={{ width: `${matchScore}%` }}
            />
          </div>
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {skills.slice(0, 5).map((skill: any) => (
            <span
              key={skill.id || skill.name}
              className="text-xs px-2 py-0.5 rounded-md font-medium border"
              style={{
                backgroundColor: "hsl(224 90% 56% / 0.07)",
                color: "hsl(224 90% 44%)",
                borderColor: "hsl(224 90% 56% / 0.2)",
              }}
            >
              {skill.name}
            </span>
          ))}
          {skills.length > 5 && (
            <span className="text-xs text-foreground-faint px-1 py-0.5">
              +{skills.length - 5}
            </span>
          )}
        </div>
      )}

      {/* Action */}
      <div className="mt-auto pt-3 border-t border-border">
        <Button
          onClick={onAcknowledge}
          disabled={loading}
          className="w-full bg-accent hover:bg-accent-hover text-white font-medium h-9"
        >
          {loading ? "Се испраќа..." : "Испрати потврда"}
        </Button>
      </div>
    </div>
  );
}
