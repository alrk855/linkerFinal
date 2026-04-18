"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { ListingCard } from "@/components/ui/listing-card";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

// Mock Active Listings
const MOCK_LISTINGS = [
  { id: "1", title: "Frontend Engineering Intern", listing_type: "Internship", slots_remaining: 2, created_at: new Date().toISOString(), focus_area: "Frontend", experience_level: "No experience", skills: [{id:"1", name: "React"}, {id:"2", name:"Next.js"}], company: { company_name: "TechCorp" } },
  { id: "2", title: "React Native Developer", listing_type: "Part-time", slots_remaining: 1, created_at: new Date(Date.now() - 86400000).toISOString(), focus_area: "Mobile", experience_level: "Junior", skills: [{id:"1", name: "React Native"}, {id:"2", name:"TypeScript"}], company: { company_name: "StartupApp" } },
];

export default function BrowseListingsPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedFocus, setSelectedFocus] = useState<string[]>([]);
  const [experience, setExperience] = useState("all");

  const filteredListings = useMemo(() => {
    const q = query.trim().toLowerCase();

    return MOCK_LISTINGS.filter((listing) => {
      const typeMatch = selectedTypes.length === 0 || selectedTypes.includes(listing.listing_type);
      const focusMatch = selectedFocus.length === 0 || selectedFocus.includes(listing.focus_area);

      const level = listing.experience_level?.toLowerCase() || "";
      const expMatch = experience === "all"
        || (experience === "none" && level.includes("no experience"))
        || (experience === "junior" && level.includes("junior"));

      const textMatch = !q
        || listing.title.toLowerCase().includes(q)
        || listing.company.company_name.toLowerCase().includes(q)
        || listing.focus_area.toLowerCase().includes(q)
        || listing.skills.some((s: { id: string; name: string }) => s.name.toLowerCase().includes(q));

      return typeMatch && focusMatch && expMatch && textMatch;
    });
  }, [experience, query, selectedFocus, selectedTypes]);

  const toggleFromArray = (
    value: string,
    current: string[],
    setter: (next: string[]) => void
  ) => {
    if (current.includes(value)) {
      setter(current.filter((v) => v !== value));
      return;
    }

    setter([...current, value]);
  };

  const clearFilters = () => {
    setQuery("");
    setSelectedTypes([]);
    setSelectedFocus([]);
    setExperience("all");
  };
  
  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 lg:px-8 py-8 flex flex-col md:flex-row gap-8">
      {/* Sidebar Filters */}
      <aside className="w-full md:w-64 shrink-0 flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg">Filters</h2>
          <button onClick={clearFilters} className="text-sm text-foreground-muted hover:text-foreground">Clear filters</button>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-medium text-foreground-muted uppercase tracking-wider">Type</h3>
          <div className="space-y-3">
            {["Internship", "Part-time", "Full-time"].map(t => (
              <div key={t} className="flex items-center space-x-2">
                <Checkbox
                  id={`type-${t}`}
                  checked={selectedTypes.includes(t)}
                  onCheckedChange={() => toggleFromArray(t, selectedTypes, setSelectedTypes)}
                />
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
                <Checkbox
                  id={`focus-${f}`}
                  checked={selectedFocus.includes(f)}
                  onCheckedChange={() => toggleFromArray(f, selectedFocus, setSelectedFocus)}
                />
                <Label htmlFor={`focus-${f}`} className="font-normal text-sm">{f}</Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-medium text-foreground-muted uppercase tracking-wider">Experience Level</h3>
          <RadioGroup value={experience} onValueChange={setExperience} className="space-y-2">
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
        <PageHeader title="Discover Opportunities" description={`Showing ${filteredListings.length} active positions matching your filters.`} className="pt-0 mt-0 sm:pt-0 border-none pb-4 mb-2" />

        <div className="relative mb-5">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-foreground-muted" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, company, focus, or skill..."
            className="pl-9 bg-background border-border"
          />
        </div>
        
        {filteredListings.length === 0 ? (
          <div className="bg-surface border border-border rounded-xl p-8 text-center text-foreground-muted">
            No listings match your current filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredListings.map((listing) => (
            <ListingCard 
              key={listing.id} 
              listing={listing} 
              onClick={() => router.push(`/listings/${listing.id}`)} 
              className="h-full flex flex-col justify-between"
            />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
