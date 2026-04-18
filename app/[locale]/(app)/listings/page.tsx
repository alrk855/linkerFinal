"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { ListingCard } from "@/components/ui/listing-card";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

// Mock Active Listings
const MOCK_LISTINGS = [
  { id: "1", title: "Frontend Engineering Intern", listing_type: "Internship", slots_remaining: 2, created_at: new Date().toISOString(), focus_area: "Frontend", experience_level: "No experience", skills: [{id:"1", name: "React"}, {id:"2", name:"Next.js"}], company: { company_name: "TechCorp" } },
  { id: "2", title: "React Native Developer", listing_type: "Part-time", slots_remaining: 1, created_at: new Date(Date.now() - 86400000).toISOString(), focus_area: "Mobile", experience_level: "Junior", skills: [{id:"1", name: "React Native"}, {id:"2", name:"TypeScript"}], company: { company_name: "StartupApp" } },
];

export default function BrowseListingsPage() {
  const router = useRouter();
  
  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 lg:px-8 py-8 flex flex-col md:flex-row gap-8">
      {/* Sidebar Filters */}
      <aside className="w-full md:w-64 shrink-0 flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg">Filters</h2>
          <button className="text-sm text-foreground-muted hover:text-foreground">Clear filters</button>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-medium text-foreground-muted uppercase tracking-wider">Type</h3>
          <div className="space-y-3">
            {["Internship", "Part-time", "Full-time"].map(t => (
              <div key={t} className="flex items-center space-x-2">
                <Checkbox id={`type-${t}`} />
                <Label htmlFor={`type-${t}`} className="font-normal text-sm">{t}</Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-medium text-foreground-muted uppercase tracking-wider">Focus Area</h3>
          <div className="space-y-3">
            {["Frontend", "Backend", "Fullstack", "Mobile", "DevOps", "Data"].map(f => (
              <div key={f} className="flex items-center space-x-2">
                <Checkbox id={`focus-${f}`} />
                <Label htmlFor={`focus-${f}`} className="font-normal text-sm">{f}</Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-medium text-foreground-muted uppercase tracking-wider">Experience Level</h3>
          <RadioGroup defaultValue="all" className="space-y-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="exp-all" />
              <Label htmlFor="exp-all" className="font-normal text-sm">Any level</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="none" id="exp-none" />
              <Label htmlFor="exp-none" className="font-normal text-sm">No experience</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="junior" id="exp-junior" />
              <Label htmlFor="exp-junior" className="font-normal text-sm">Junior</Label>
            </div>
          </RadioGroup>
        </div>
      </aside>

      {/* Main Listing Grid */}
      <main className="flex-1 min-w-0">
        <PageHeader title="Discover Opportunities" description={`Showing ${MOCK_LISTINGS.length} active positions matching your filters.`} className="pt-0 mt-0 sm:pt-0 border-none pb-4 mb-2" />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {MOCK_LISTINGS.map((listing) => (
            <ListingCard 
              key={listing.id} 
              listing={listing} 
              onClick={() => router.push(`/listings/${listing.id}`)} 
              className="h-full flex flex-col justify-between"
            />
          ))}
        </div>
      </main>
    </div>
  );
}
