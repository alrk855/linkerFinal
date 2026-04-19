"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/providers/auth-provider";
import { AnonymousAvatar } from "@/components/ui/anonymous-avatar";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SkillTag } from "@/components/ui/skill-tag";
import { Button } from "@/components/ui/button";
import { Github, Linkedin, Globe, Mail, ShieldCheck, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function ProfileViewPage({ params }: { params: { username: string } }) {
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [acknowledging, setAcknowledging] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/profile/${params.username}`);
        if (!res.ok) throw new Error("Profile not found");
        const data = await res.json();
        setProfile(data.profile || data);
      } catch {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.username]);

  const handleAcknowledge = async () => {
    if (!profile) return;
    setAcknowledging(true);
    try {
      const res = await fetch("/api/acknowledgments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_profile_id: profile.id }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error?.message || "Failed to send acknowledgment");
      }
      toast.success("Acknowledgment sent.");
    } catch (err: any) {
      toast.error(err?.message || "Failed to send acknowledgment");
    } finally {
      setAcknowledging(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <div className="w-8 h-8 rounded-full border-2 border-accent border-r-transparent animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-foreground-muted">Profile not found.</p>
        <Button variant="outline" onClick={() => router.back()}>Go back</Button>
      </div>
    );
  }

  const isOwner = user?.username === params.username;
  const isRevealed = profile.email_revealed || isOwner;
  const skills = profile.skills || [];
  const listings = profile.listings || [];

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-4 lg:px-8 py-8 md:py-12 flex flex-col gap-8">
      <button
        className="flex items-center gap-1.5 text-sm text-foreground-muted hover:text-foreground transition-colors self-start"
        onClick={() => router.back()}
      >
        <ArrowLeft size={14} /> Back
      </button>

      {/* Header */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8 bg-surface border border-border p-8 rounded-2xl shadow-card">
        {isRevealed && profile.avatar_url ? (
          <Avatar className="w-24 h-24 border-4 border-background shadow-sm shrink-0">
            <AvatarImage src={profile.avatar_url} />
            <AvatarFallback className="text-3xl bg-surface-raised">{profile.full_name?.charAt(0)}</AvatarFallback>
          </Avatar>
        ) : (
          <AnonymousAvatar size="xl" className="border-4 border-background shadow-sm shrink-0" />
        )}

        <div className="flex flex-col items-center md:items-start flex-1 gap-2">
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            {isRevealed ? (profile.full_name || "Student") : "Anonymous Student"}
          </h1>

          <div className="flex items-center gap-3 flex-wrap">
            {isRevealed && (
              <span className="font-mono text-foreground-muted bg-background border border-border px-2 py-0.5 rounded text-sm">
                @{profile.username}
              </span>
            )}
            {profile.is_verified_student && <VerifiedBadge />}
          </div>

          {profile.role === "student" && (
            <div className="flex flex-wrap gap-2 text-sm font-medium mt-2">
              {profile.focus_area && (
                <span className="bg-accent/8 text-accent border border-accent/20 px-2.5 py-1 rounded-full text-xs font-semibold">
                  {profile.focus_area}
                </span>
              )}
              {profile.experience_level && (
                <span className="bg-surface-raised border border-border text-foreground-muted px-2.5 py-1 rounded-full text-xs">
                  {profile.experience_level}
                </span>
              )}
              {(profile.faculty || profile.year_of_study) && (
                <span className="text-foreground-muted text-xs px-1 py-1">
                  {[profile.faculty, profile.year_of_study && `Year ${profile.year_of_study}`, profile.degree_type]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              )}
            </div>
          )}
        </div>

        {!isOwner && user?.role === "company" && !isRevealed && (
          <div className="shrink-0 mt-2 md:mt-0">
            <Button
              className="bg-accent hover:bg-accent-hover text-white font-medium"
              onClick={handleAcknowledge}
              disabled={acknowledging}
            >
              {acknowledging ? "Sending..." : "Acknowledge Candidate"}
            </Button>
          </div>
        )}

        {isOwner && (
          <div className="shrink-0 mt-2 md:mt-0">
            <Button
              variant="outline"
              className="bg-surface hover:bg-surface-raised border-border"
              onClick={() => router.push("/profile/edit")}
            >
              Edit Profile
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left col */}
        <div className="md:col-span-2 flex flex-col gap-6">
          {profile.bio && (
            <section className="space-y-3">
              <h2 className="text-lg font-semibold tracking-tight">About</h2>
              <div className="bg-surface border border-border rounded-xl p-6 shadow-card">
                <p className="text-foreground-muted leading-relaxed">{profile.bio}</p>
              </div>
            </section>
          )}

          {skills.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-lg font-semibold tracking-tight">Skills</h2>
              <div className="bg-surface border border-border rounded-xl p-6 shadow-card">
                <div className="flex flex-wrap gap-2">
                  {skills.map((s: any) => <SkillTag key={s.id || s.name} name={s.name} />)}
                </div>
              </div>
            </section>
          )}

          {listings.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-lg font-semibold tracking-tight">Active Listings</h2>
              <div className="flex flex-col gap-3">
                {listings.map((l: any) => (
                  <div
                    key={l.id}
                    className="bg-surface border border-border rounded-xl p-4 shadow-card cursor-pointer hover:border-accent/30 transition-all"
                    onClick={() => router.push(`/listings/${l.id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground">{l.title}</span>
                      <span className="text-xs text-foreground-muted">{l.listing_type}</span>
                    </div>
                    {l.focus_area && (
                      <span className="text-xs text-foreground-muted mt-1 block">{l.focus_area}</span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right col */}
        <div className="flex flex-col gap-6">
          {isRevealed ? (
            <section className="space-y-3">
              <h2 className="text-lg font-semibold tracking-tight">Links & Contact</h2>
              <div className="flex flex-col gap-3 bg-surface border border-border rounded-xl p-5 shadow-card">
                {profile.github_url && (
                  <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-foreground-muted hover:text-foreground transition-colors group">
                    <div className="w-8 h-8 rounded bg-background border border-border flex items-center justify-center shrink-0 group-hover:border-accent/40 transition-colors">
                      <Github size={15} />
                    </div>
                    <span className="truncate">GitHub</span>
                  </a>
                )}
                {profile.linkedin_url && (
                  <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-foreground-muted hover:text-foreground transition-colors group">
                    <div className="w-8 h-8 rounded bg-background border border-border flex items-center justify-center shrink-0 group-hover:border-accent/40 transition-colors">
                      <Linkedin size={15} />
                    </div>
                    <span className="truncate">LinkedIn</span>
                  </a>
                )}
                {(profile.portfolio_url || profile.website_url) && (
                  <a href={profile.portfolio_url || profile.website_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-foreground-muted hover:text-foreground transition-colors group">
                    <div className="w-8 h-8 rounded bg-background border border-border flex items-center justify-center shrink-0 group-hover:border-accent/40 transition-colors">
                      <Globe size={15} />
                    </div>
                    <span className="truncate">Website</span>
                  </a>
                )}
                {profile.email && (
                  <>
                    <div className="h-px w-full bg-border my-1" />
                    <a href={`mailto:${profile.email}`} className="flex items-center gap-3 text-sm text-foreground-muted hover:text-foreground transition-colors group">
                      <div className="w-8 h-8 rounded bg-background border border-border flex items-center justify-center shrink-0 group-hover:border-accent/40 transition-colors">
                        <Mail size={15} />
                      </div>
                      <span className="truncate">{profile.email}</span>
                    </a>
                  </>
                )}
              </div>
            </section>
          ) : (
            <section className="space-y-3">
              <h2 className="text-lg font-semibold tracking-tight">Access Restricted</h2>
              <div className="bg-surface border border-border rounded-xl p-6 text-center text-sm text-foreground-muted flex flex-col items-center gap-3 shadow-card">
                <ShieldCheck size={24} className="text-foreground-faint" />
                <p>Identity and contact details are revealed only after the student accepts an acknowledgment.</p>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
