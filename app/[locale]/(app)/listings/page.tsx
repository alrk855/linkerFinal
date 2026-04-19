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

const TYPE_OPTIONS = [
  { value: "internship", label: "Практикантство" },
  { value: "part_time", label: "Скратено работно време" },
  { value: "full_time", label: "Полно работно време" },
];

const FOCUS_OPTIONS = [
  { value: "frontend", label: "Фронтенд" },
  { value: "backend", label: "Бекенд" },
  { value: "fullstack", label: "Фулстек" },
  { value: "mobile", label: "Мобилен развој" },
  { value: "devops", label: "DevOps" },
  { value: "data", label: "Податоци" },
  { value: "other", label: "Друго" },
];

const EXPERIENCE_OPTIONS = [
  ["all", "Секое ниво"],
  ["no_experience", "Без искуство"],
  ["junior", "Јуниор"],
  ["mid", "Средно ниво"],
  ["senior", "Сениор"],
] as const;

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
      const expOk = experience === "all" || lvl === experience;
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
        <h2 className="font-semibold text-base">Филтри</h2>
        {hasFilters && <button onClick={clearFilters} className="text-xs font-medium text-accent hover:text-accent-hover">Исчисти</button>}
      </div>
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">Тип</h3>
        {TYPE_OPTIONS.map((t) => (
          <div key={t.value} className="flex items-center gap-2.5">
            <Checkbox id={`type-${t.value}`} checked={selectedTypes.includes(t.value)} onCheckedChange={() => toggle(t.value, selectedTypes, setSelectedTypes)} />
            <Label htmlFor={`type-${t.value}`} className="font-normal text-sm cursor-pointer">{t.label}</Label>
          </div>
        ))}
      </div>
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">Област</h3>
        {FOCUS_OPTIONS.map((f) => (
          <div key={f.value} className="flex items-center gap-2.5">
            <Checkbox id={`focus-${f.value}`} checked={selectedFocus.includes(f.value)} onCheckedChange={() => toggle(f.value, selectedFocus, setSelectedFocus)} />
            <Label htmlFor={`focus-${f.value}`} className="font-normal text-sm cursor-pointer">{f.label}</Label>
          </div>
        ))}
      </div>
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">Искуство</h3>
        <RadioGroup value={experience} onValueChange={setExperience} className="space-y-2.5">
          {EXPERIENCE_OPTIONS.map(([v,l]) => (
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
    <div className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
      <div className="flex flex-col md:flex-row gap-6 md:gap-10 lg:gap-14 items-start justify-center">
        
        {/* Left Sticky Sidebar Filter */}
        <div className="hidden md:block w-60 lg:w-64 shrink-0 sticky top-24 self-start bg-transparent">
          <FilterPanel />
        </div>

        {/* Central Feed */}
        <div className="flex-1 w-full max-w-2xl min-w-0 flex flex-col">
          {/* Header & Search */}
          <div className="mb-6 space-y-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Opportunities Feed</h1>
              <p className="text-sm text-foreground-muted mt-1">Откриј ја следната можност за кариера.</p>
            </div>

            <div className="flex gap-3">
              <div className="relative flex-1 group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted group-focus-within:text-accent transition-colors" />
                <Input 
                  value={query} 
                  onChange={(e) => setQuery(e.target.value)} 
                  placeholder="Пребарај по наслов, компанија, вештина..." 
                  className="pl-10 bg-surface border-border h-12 shadow-sm rounded-xl focus-visible:ring-accent transition-all text-sm" 
                />
              </div>
              <Button 
                variant="outline" 
                onClick={() => setShowFilters(!showFilters)} 
                className={`h-12 rounded-xl md:hidden px-4 ${hasFilters ? "border-accent text-accent bg-accent/5" : "border-border text-foreground-muted bg-surface"}`}
              >
                <SlidersHorizontal size={16} className="mr-2" /> Филтри
              </Button>
            </div>
          </div>
          
          {/* Mobile Filter Panel */}
          {showFilters && (
            <div className="md:hidden bg-surface border border-border rounded-xl p-5 mb-6 w-full shadow-sm animate-in fade-in slide-in-from-top-2">
              <FilterPanel />
            </div>
          )}

          {/* Feed Content */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">
                {loading ? "Освежување..." : `${filtered.length} резултат${filtered.length !== 1 ? "и" : ""}`}
              </p>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-48 bg-surface border border-border rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="bg-transparent border border-dashed border-border rounded-2xl p-12 text-center mt-2">
                <div className="w-12 h-12 rounded-full bg-surface border border-border flex items-center justify-center mx-auto mb-4 text-foreground-faint">
                  <Search size={20} />
                </div>
                <h3 className="font-semibold text-base mb-1 text-foreground">No matches found</h3>
                <p className="text-sm text-foreground-muted max-w-sm mx-auto mb-4">Не најдовме огласи што одговараат на избраните филтри.</p>
                {hasFilters && (
                  <Button onClick={clearFilters} variant="outline" className="rounded-full shadow-sm">
                    Исчисти ги филтрите
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-5 pb-16">
                {filtered.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} onClick={() => router.push(`/listings/${listing.id}`)} />
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
