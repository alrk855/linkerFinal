"use client";

import { useEffect, useState, useMemo } from "react";
import { ListingCard } from "@/components/ui/listing-card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BrowseListingsPage() {
  const router = useRouter();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedFocus, setSelectedFocus] = useState<string[]>([]);
  const [experience, setExperience] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetch("/api/listings?limit=50")
      .then((r) => r.json())
      .then((d) => setListings(d.listings || []))
      .catch(() => setListings([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return listings.filter((l) => {
      const company = Array.isArray(l.company_profiles) ? l.company_profiles[0] : l.company_profiles;
      const skills = (l.listing_skills || []).map((ls: any) => ls.skills?.name || "");
      const typeOk = !selectedTypes.length || selectedTypes.includes(l.listing_type);
      const focusOk = !selectedFocus.length || selectedFocus.includes(l.focus_area);
      const lvl = (l.experience_level || "").toLowerCase();
      const expOk = experience === "all"
        || (experience === "none" && lvl.includes("no experience"))
        || (experience === "junior" && lvl === "junior")
        || (experience === "mid" && lvl.includes("mid"))
        || (experience === "senior" && lvl === "senior");
      const textOk = !q
        || l.title?.toLowerCase().includes(q)
        || company?.company_name?.toLowerCase().includes(q)
        || l.focus_area?.toLowerCase().includes(q)
        || skills.some((s: string) => s.toLowerCase().includes(q));
      return typeOk && focusOk && expOk && textOk;
    });
  }, [listings, query, selectedTypes, selectedFocus, experience]);

  const toggle = (val: string, arr: string[], set: (v: string[]) => void) =>
    set(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);

  const clearFilters = () => { setQuery(""); setSelectedTypes([]); setSelectedFocus([]); setExperience("all"); };
  const hasFilters = selectedTypes.length > 0 || selectedFocus.length > 0 || experience !== "all";

  const FilterPanel = () => (
    <aside className="flex flex-col gap-7">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-base">Filters</h2>
        {hasFilters && <button onClick={clearFilters} className="text-xs font-medium text-accent hover:text-accent-hover">Clear all</button>}
      </div>
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">Type</h3>
        {["Internship", "Part-time", "Full-time"].map((t) => (
          <div key={t} className="flex items-center gap-2.5">
            <Checkbox id={`type-${t}`} checked={selectedTypes.includes(t)} onCheckedChange={() => toggle(t, selectedTypes, setSelectedTypes)} />
            <Label htmlFor={`type-${t}`} className="font-normal text-sm cursor-pointer">{t}</Label>
          </div>
        ))}
      </div>
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">Focus Area</h3>
        {["Frontend", "Backend", "Fullstack", "Mobile", "DevOps", "Data"].map((f) => (
          <div key={f} className="flex items-center gap-2.5">
            <Checkbox id={`focus-${f}`} checked={selectedFocus.includes(f)} onCheckedChange={() => toggle(f, selectedFocus, setSelectedFocus)} />
            <Label htmlFor={`focus-${f}`} className="font-normal text-sm cursor-pointer">{f}</Label>
          </div>
        ))}
      </div>
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">Experience</h3>
        <RadioGroup value={experience} onValueChange={setExperience} className="space-y-2.5">
          {[["all","Any level"],["none","No experience"],["junior","Junior"],["mid","Mid-level"],["senior","Senior"]].map(([v,l]) => (
            <div key={v} className="flex items-center gap-2.5">
              <RadioGroupItem value={v} id={`exp-${v}`} />
              <Label htmlFor={`exp-${v}`} className="font-normal text-sm cursor-pointer">{l}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    </aside>
  );

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Discover Opportunities</h1>
        <p className="text-foreground-muted mt-1">Browse open positions from approved companies.</p>
      </div>
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by title, company, skill..." className="pl-9 bg-surface border-border h-11 shadow-card" />
        </div>
        <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className={`h-11 gap-2 md:hidden ${hasFilters ? "border-accent text-accent" : ""}`}>
          <SlidersHorizontal size={16} /> Filters
        </Button>
      </div>
      <div className="flex gap-8">
        <div className="hidden md:block w-52 shrink-0"><FilterPanel /></div>
        {showFilters && <div className="md:hidden bg-surface border border-border rounded-xl p-5 mb-4 w-full"><FilterPanel /></div>}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-foreground-muted mb-4">
            {loading ? "Loading..." : `${filtered.length} listing${filtered.length !== 1 ? "s" : ""} found`}
          </p>
          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {[...Array(6)].map((_, i) => <div key={i} className="h-52 bg-surface border border-border rounded-xl animate-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-surface border border-border rounded-xl p-12 text-center shadow-card">
              <p className="text-foreground-muted">No listings match your filters.</p>
              {hasFilters && <button onClick={clearFilters} className="mt-3 text-sm font-medium text-accent">Clear filters</button>}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filtered.map((listing) => (
                <ListingCard key={listing.id} listing={listing} onClick={() => router.push(`/listings/${listing.id}`)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
