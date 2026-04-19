"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useAuth } from "@/providers/auth-provider";
import { SkillTag } from "@/components/ui/skill-tag";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Users, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const TYPE_STYLES: Record<string, string> = {
  Internship: "badge-internship",
  "Part-time": "badge-parttime",
  "Full-time": "badge-fulltime",
};

export default function ListingDetailPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const router = useRouter();
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    setLogoError(false);
    fetch(`/api/listings/${params.id}`)
      .then(r => r.json()).then(d => setListing(d.listing || d))
      .catch(() => {}).finally(() => setLoading(false));
  }, [params.id]);

  const apply = async () => {
    setApplying(true);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listing_id: params.id }),
      });
      if (!res.ok) { const b = await res.json().catch(() => null); throw new Error(b?.error?.message || "Could not apply."); }
      toast.success("Application submitted!");
      setListing((l: any) => ({ ...l, has_applied: true }));
    } catch (e: any) { toast.error(e.message || "Failed to apply."); } finally { setApplying(false); }
  };

  if (loading) return <div className="flex-1 w-full max-w-4xl mx-auto px-4 py-12 space-y-6 animate-pulse"><div className="h-8 bg-surface-raised rounded w-1/2" /><div className="h-64 bg-surface rounded-xl" /></div>;
  if (!listing) return <div className="flex-1 flex items-center justify-center p-8"><p className="text-foreground-muted">Listing not found.</p></div>;

  const company = Array.isArray(listing.company_profiles) ? listing.company_profiles[0] : listing.company_profiles;
  const skills = (listing.listing_skills || []).map((ls: any) => ls.skills || ls).filter(Boolean);
  const typeStyle = TYPE_STYLES[listing.listing_type] || "";
  const canApply = user?.role === "student" && user?.is_verified_student;

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-4 lg:px-8 py-8 md:py-12 flex flex-col gap-8">
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-foreground-muted hover:text-foreground transition-colors w-fit"><ArrowLeft size={16} /> Back</button>
      <div className="bg-surface border border-border rounded-2xl p-6 md:p-8 shadow-card">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0 text-accent font-bold text-xl">
            {company?.logo_url && !logoError ? (
              <Image
                src={company.logo_url}
                alt={company?.company_name || "Company logo"}
                width={56}
                height={56}
                onError={() => setLogoError(true)}
                className="w-full h-full object-cover rounded-xl"
              />
            ) : company?.company_name?.charAt(0) || "?"}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold tracking-tight">{listing.title}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-foreground-muted">
              <span className="font-medium text-foreground">{company?.company_name}</span>
              {company?.location && <><span>·</span><span className="flex items-center gap-1"><MapPin size={13} />{company.location}</span></>}
              {company?.size_range && <><span>·</span><span className="flex items-center gap-1"><Users size={13} />{company.size_range}</span></>}
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full border", typeStyle)}>{listing.listing_type}</span>
              {listing.focus_area && <span className="text-xs px-2.5 py-1 rounded-full bg-surface-raised border border-border text-foreground-muted">{listing.focus_area}</span>}
              {listing.experience_level && <span className="text-xs px-2.5 py-1 rounded-full bg-surface-raised border border-border text-foreground-muted">{listing.experience_level}</span>}
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-surface border border-border rounded-xl p-6 shadow-card">
            <h2 className="text-lg font-semibold mb-4">Description</h2>
            <p className="text-foreground-muted leading-relaxed whitespace-pre-wrap text-sm">{listing.description || "No description."}</p>
          </div>
          {skills.length > 0 && (
            <div className="bg-surface border border-border rounded-xl p-6 shadow-card">
              <h2 className="text-lg font-semibold mb-4">Required Skills</h2>
              <div className="flex flex-wrap gap-2">{skills.map((s: any) => <SkillTag key={s.id || s.name} name={s.name} />)}</div>
            </div>
          )}
        </div>
        <div>
          <Card className="bg-surface border-border shadow-card sticky top-24">
            <CardContent className="p-6 flex flex-col gap-5">
              <div className="text-center"><div className="text-3xl font-bold text-accent">{listing.slots_remaining}</div><div className="text-sm text-foreground-muted mt-1">positions available</div></div>
              {listing.has_applied ? (
                <div className="flex items-center justify-center gap-2 text-success bg-success/10 border border-success/20 rounded-lg px-4 py-3 text-sm font-medium"><CheckCircle2 size={16} /> Applied!</div>
              ) : canApply ? (
                <Button onClick={apply} disabled={applying || listing.slots_remaining === 0} className="w-full bg-accent hover:bg-accent-hover text-white font-semibold h-11">
                  {applying ? "Submitting..." : listing.slots_remaining === 0 ? "No slots left" : "Apply now"}
                </Button>
              ) : (
                <p className="text-xs text-center text-foreground-muted">{user?.role === "student" ? "Verify your account to apply." : "Only verified students can apply."}</p>
              )}
              <p className="text-xs text-center text-foreground-faint">Identity revealed only after mutual acknowledgment.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
