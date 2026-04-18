"use client";

import { PageHeader } from "@/components/ui/page-header";
import { SkillTag } from "@/components/ui/skill-tag";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, MapPin, Users } from "lucide-react";
import { VerifiedBadge } from "@/components/ui/verified-badge";

const MOCK_DETAIL = {
  id: "1",
  title: "Frontend Engineering Intern",
  description: "Join us this summer as a Frontend Engineering intern. You will be working directly with the core product team on real features that reach millions of users.\n\nRequirements:\n- Strong knowledge of HTML, CSS, JavaScript\n- Experience with React and functional components\n- A passion for UX and fine details",
  listing_type: "Internship",
  slots_remaining: 2,
  focus_area: "Frontend",
  experience_level: "No experience",
  skills: [{id:"1", name: "React"}, {id:"2", name:"Next.js"}, {id:"3", name:"TypeScript"}],
  company: { company_name: "TechCorp", logo_url: "", location: "Skopje, Hybrid", size_range: "50-200" }
};

export default function ListingDetailPage({ params }: { params: { id: string } }) {
  const listing = MOCK_DETAIL;
  
  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-4 lg:px-8 py-8 md:py-12 flex flex-col gap-8">
      
      {/* Header */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-surface border border-border flex items-center justify-center shadow-sm">
            <Building2 size={24} className="text-foreground-muted" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground text-lg">{listing.company.company_name}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-foreground-muted mt-0.5">
              <span className="flex items-center gap-1"><MapPin size={14} /> {listing.company.location}</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Users size={14} /> {listing.company.size_range}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-semibold text-foreground tracking-tight">{listing.title}</h1>
          <div className="flex flex-wrap gap-2 text-sm font-medium">
            <span className="bg-surface-raised border border-border px-2 py-1 rounded-md">{listing.listing_type}</span>
            <span className="bg-surface-raised border border-border px-2 py-1 rounded-md">{listing.focus_area}</span>
            <span className="bg-surface-raised border border-border px-2 py-1 rounded-md">{listing.experience_level}</span>
            <span className="text-foreground-muted px-2 py-1">{listing.slots_remaining} slots remaining</span>
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          
          <section className="space-y-4">
            <h2 className="text-xl font-medium tracking-tight">Description</h2>
            <div className="bg-surface border border-border rounded-xl p-6 text-foreground-muted whitespace-pre-wrap leading-relaxed">
              {listing.description}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-medium tracking-tight">Required Skills</h2>
            <div className="bg-surface border border-border rounded-xl p-6">
               <div className="flex flex-wrap gap-2">
                {listing.skills.map(s => <SkillTag key={s.id} name={s.name} />)}
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar Apply */}
        <div className="relative">
          <div className="sticky top-24">
            <Card className="bg-surface border-border">
              <CardContent className="p-6 flex flex-col gap-6 text-center">
                <div className="mx-auto w-12 h-12 rounded-full border-4 border-accent flex items-center justify-center bg-accent/10">
                  <span className="text-accent font-semibold">{listing.slots_remaining}</span>
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-lg text-foreground">Positions Available</h3>
                  <p className="text-sm text-foreground-muted">Review your profile before applying. Companies see your anonymous skills profile first.</p>
                </div>
                <Button className="w-full bg-accent hover:bg-accent-hover text-background font-medium h-12 shadow-sm">
                  Apply to this listing
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

      </div>
    </div>
  );
}
