"use client";

import { useAuth } from "@/providers/auth-provider";
import { PageHeader } from "@/components/ui/page-header";
import { AnonymousAvatar } from "@/components/ui/anonymous-avatar";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SkillTag } from "@/components/ui/skill-tag";
import { Github, Linkedin, Globe, Mail, FileText, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProfileViewPage({ params }: { params: { username: string } }) {
  const { user } = useAuth();
  
  // NOTE: In standard Next.js, this should fetch data by username.
  // For the sake of the exercise, we will use mock structure mimicking the requirements.
  const isOwner = user?.username === params.username;
  // Assume mock state: candidate viewed by company, not acknowledged yet
  const studentEmailRevealed = isOwner; 
  
  const mockProfile = {
    full_name: isOwner ? user.full_name : "Jane Doe",
    username: params.username,
    bio: "Passionate software engineering student deeply interested in React and Next.js.",
    faculty: "FINKI",
    year_of_study: "3",
    degree_type: "Bachelor",
    experience_level: "Junior",
    focus_area: "Frontend",
    is_verified_student: true,
    github_url: "https://github.com",
    linkedin_url: "https://linkedin.com",
    portfolio_url: "https://portfolio.com",
    email: "jane.doe@students.finki.ukim.mk",
    skills: [
      { id: "1", name: "React" },
      { id: "2", name: "Next.js" },
      { id: "3", name: "TypeScript" },
      { id: "4", name: "Tailwind" }
    ]
  };

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-4 lg:px-8 py-8 md:py-12 flex flex-col gap-8">
      
      {/* Header Profile Section */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8 bg-surface border border-border p-8 rounded-2xl">
        {studentEmailRevealed ? (
          <Avatar className="w-32 h-32 border-4 border-background shadow-sm">
            <AvatarImage src={"https://github.com/identicons/jane.png"} />
            <AvatarFallback className="text-3xl bg-surface-raised">{mockProfile.full_name?.charAt(0)}</AvatarFallback>
          </Avatar>
        ) : (
          <AnonymousAvatar size="xl" className="border-4 border-background shadow-sm" />
        )}

        <div className="flex flex-col items-center md:items-start flex-1 gap-2">
          {studentEmailRevealed ? (
            <h1 className="text-3xl font-semibold text-foreground tracking-tight">{mockProfile.full_name}</h1>
          ) : (
            <h1 className="text-3xl font-semibold text-foreground tracking-tight">Anonymous Student</h1>
          )}
          
          <div className="flex items-center gap-3 mt-1">
            <span className="font-mono text-foreground-muted bg-background border border-border px-2 py-0.5 rounded text-sm">
              @{studentEmailRevealed ? mockProfile.username : "hidden"}
            </span>
            {mockProfile.is_verified_student && <VerifiedBadge />}
          </div>

          <div className="flex flex-wrap gap-2 text-sm font-medium mt-3">
            <span className="bg-surface-raised border border-border text-foreground px-2 py-1 rounded-md">{mockProfile.focus_area}</span>
            <span className="bg-surface-raised border border-border text-foreground px-2 py-1 rounded-md">{mockProfile.experience_level}</span>
            <span className="text-foreground-muted px-2 py-1">{mockProfile.faculty} • Year {mockProfile.year_of_study} • {mockProfile.degree_type}</span>
          </div>
        </div>

        {/* Company Action */}
        {!studentEmailRevealed && user?.role === "company" && (
          <div className="w-full md:w-auto mt-4 md:mt-0">
            <Button className="w-full bg-accent hover:bg-accent-hover text-background font-medium">
              Acknowledge this candidate
            </Button>
          </div>
        )}
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Col */}
        <div className="md:col-span-2 flex flex-col gap-8">
          <section className="space-y-4">
            <h2 className="text-xl font-medium tracking-tight">About</h2>
            <div className="bg-surface border border-border rounded-xl p-6">
              <p className="text-foreground-muted leading-relaxed">
                {mockProfile.bio}
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-medium tracking-tight">Skills</h2>
            <div className="bg-surface border border-border rounded-xl p-6">
              <div className="flex flex-wrap gap-2">
                {mockProfile.skills.map(s => <SkillTag key={s.id} name={s.name} />)}
              </div>
            </div>
          </section>
        </div>

        {/* Right Col */}
        <div className="flex flex-col gap-6">
          {studentEmailRevealed ? (
            <section className="space-y-4">
              <h2 className="text-lg font-medium tracking-tight">Links & Contacts</h2>
              <div className="flex flex-col gap-3 bg-surface border border-border rounded-xl p-6">
                <a href={mockProfile.github_url} className="flex items-center gap-3 text-sm text-foreground-muted hover:text-foreground transition-colors group">
                  <div className="w-8 h-8 rounded bg-background border border-border flex items-center justify-center group-hover:border-accent-subtle transition-colors shrink-0">
                    <Github size={16} />
                  </div>
                  <span className="truncate">GitHub Profile</span>
                </a>
                <a href={mockProfile.linkedin_url} className="flex items-center gap-3 text-sm text-foreground-muted hover:text-foreground transition-colors group">
                  <div className="w-8 h-8 rounded bg-background border border-border flex items-center justify-center group-hover:border-accent-subtle transition-colors shrink-0">
                    <Linkedin size={16} />
                  </div>
                  <span className="truncate">LinkedIn Profile</span>
                </a>
                <a href={mockProfile.portfolio_url} className="flex items-center gap-3 text-sm text-foreground-muted hover:text-foreground transition-colors group">
                  <div className="w-8 h-8 rounded bg-background border border-border flex items-center justify-center group-hover:border-accent-subtle transition-colors shrink-0">
                    <Globe size={16} />
                  </div>
                  <span className="truncate">Portfolio</span>
                </a>
                <div className="h-px w-full bg-border-subtle my-2" />
                <a href={`mailto:${mockProfile.email}`} className="flex items-center gap-3 text-sm text-foreground-muted hover:text-foreground transition-colors group">
                  <div className="w-8 h-8 rounded bg-background border border-border flex items-center justify-center group-hover:border-accent-subtle transition-colors shrink-0">
                    <Mail size={16} />
                  </div>
                  <span className="truncate">{mockProfile.email}</span>
                </a>
                <Button variant="outline" className="w-full mt-2 bg-background hover:bg-surface-raised border-border">
                  <FileText size={16} className="mr-2" />
                  Download CV
                </Button>
              </div>
            </section>
          ) : (
            <section className="space-y-4">
              <h2 className="text-lg font-medium tracking-tight">Access Restricted</h2>
              <div className="bg-surface border border-border/50 rounded-xl p-6 text-center text-sm text-foreground-muted flex flex-col items-center gap-3">
                <ShieldCheck size={24} className="text-foreground-faint" />
                <p>Personal connections, identities, and cv records are hidden until an acknowledgment request is accepted by the student.</p>
              </div>
            </section>
          )}

          {isOwner && (
            <Button onClick={() => window.location.href="/profile/edit"} variant="outline" className="w-full bg-surface border-border">
              Edit Profile
            </Button>
          )}
        </div>

      </div>

    </div>
  );
}
