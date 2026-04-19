"use client";

import { useAuth } from "@/providers/auth-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { ProfileCompleteness } from "@/components/ui/profile-completeness";
import { Camera } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileSidebarProps {
  activeSection: string;
  onSectionSelect: (sectionId: string) => void;
  className?: string;
}

export const SECTIONS = {
  STUDENT: [
    { id: "basic", label: "Основни информации", required: true },
    { id: "academic", label: "Академски детали", required: true },
    { id: "skills", label: "Вештини", required: true },
    { id: "links", label: "Линкови", required: false },
    { id: "documents", label: "Документи", required: false },
  ],
  COMPANY: [
    { id: "basic", label: "Основни информации", required: true },
    { id: "company", label: "Информации за компанија", required: true },
    { id: "links", label: "Линкови", required: false },
  ]
};

export function ProfileSidebar({ activeSection, onSectionSelect, className }: ProfileSidebarProps) {
  const { user } = useAuth();
  if (!user) return null;

  const sections = user.role === "company" ? SECTIONS.COMPANY : SECTIONS.STUDENT;

  // Placeholder completion tracker. Needs logic to mark completed sections.
  const isSectionComplete = (id: string) => false; 

  return (
    <div className={cn("flex flex-col w-full gap-8", className)}>
      {/* Profile Header */}
      <div className="flex flex-col items-center gap-4 p-6 bg-surface border border-border rounded-xl">
        <div className="relative group cursor-pointer">
          <Avatar className="w-24 h-24 border-2 border-border">
            <AvatarImage src={user.avatar_url || ""} />
            <AvatarFallback className="bg-surface-raised text-2xl font-medium">
              {user.full_name?.charAt(0) || user.username.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="absolute inset-0 bg-background/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Camera size={24} className="text-foreground" />
          </div>
        </div>

        <div className="flex flex-col flex-1 text-center items-center gap-1">
          <span className="font-mono text-foreground">{user.username}</span>
          {user.is_verified_student && <VerifiedBadge size="md" className="mt-1" />}
        </div>

        <ProfileCompleteness value={user.profile_completeness || 0} className="mt-2" />
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 w-full bg-surface border border-border rounded-xl p-3">
        {sections.map(section => (
          <button
            key={section.id}
            onClick={() => onSectionSelect(section.id)}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors text-left",
              activeSection === section.id 
                ? "bg-surface-raised text-foreground" 
                : "text-foreground-muted hover:text-foreground hover:bg-surface-raised/50"
            )}
          >
            <div className={cn("w-2 h-2 rounded-full", isSectionComplete(section.id) ? "bg-accent" : "bg-border-subtle")} />
            {section.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
