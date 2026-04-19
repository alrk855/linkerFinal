"use client";

import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { CandidateCard } from "@/components/ui/candidate-card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";

const FOCUS_AREAS = [
  { value: "frontend", label: "Frontend" },
  { value: "backend", label: "Backend" },
  { value: "fullstack", label: "Fullstack" },
  { value: "mobile", label: "Mobile" },
  { value: "devops", label: "DevOps" },
  { value: "data", label: "Data" },
  { value: "other", label: "Other" },
];

const EXPERIENCE_LEVELS = [
  { value: "no_experience", label: "No experience" },
  { value: "junior", label: "Junior" },
  { value: "mid", label: "Mid-level" },
  { value: "senior", label: "Senior" },
];

type Candidate = {
  id: string;
  faculty: string | null;
  year_of_study: number | null;
  degree_type: string | null;
  experience_level: string | null;
  experience_level_key: string | null;
  focus_area: string | null;
  focus_area_key: string | null;
  is_verified_student: boolean;
  match_score: number | null;
  skills: Array<{ id: string; name: string; slug: string }>;
};

type CompanyListing = {
  id: string;
  title: string;
  is_active: boolean;
  total_slots: number;
  slots_remaining: number;
};

function toLabel(value?: string | null) {
  if (!value) {
    return null;
  }
  return value
    .replace(/[_-]/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function toKey(value?: string | null) {
  if (!value) {
    return null;
  }
  return value.trim().toLowerCase().replace(/\s+/g, "_");
}

function slugToName(slug: string) {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function CompanyDiscoverPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [listings, setListings] = useState<CompanyListing[]>([]);
  const [selectedListingId, setSelectedListingId] = useState("");
  const [loading, setLoading] = useState(true);
  const [acknowledging, setAcknowledging] = useState<string | null>(null);

  const [selectedFaculties, setSelectedFaculties] = useState<string[]>([]);
  const [selectedFocusAreas, setSelectedFocusAreas] = useState<string[]>([]);
  const [experience, setExperience] = useState("all");
  const [verifiedOnly, setVerifiedOnly] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [discoverRes, listingsRes] = await Promise.all([
          fetch("/api/discover/students"),
          fetch("/api/company/listings"),
        ]);

        if (!discoverRes.ok) {
          throw new Error("Failed to load candidates");
        }

        const discoverData = await discoverRes.json();
        const rows = Array.isArray(discoverData.students) ? discoverData.students : [];

        const mappedCandidates: Candidate[] = rows.map((row: any) => {
          const card = row.card || {};
          const focusKey = toKey(card.focus_area);
          const expKey = toKey(card.experience_level);
          const skillSlugs = Array.isArray(card.skill_slugs) ? card.skill_slugs : [];

          return {
            id: row.profile_id,
            faculty: card.faculty || null,
            year_of_study: card.year_of_study ?? null,
            degree_type: toLabel(card.degree_type),
            experience_level: toLabel(card.experience_level),
            experience_level_key: expKey,
            focus_area: toLabel(card.focus_area),
            focus_area_key: focusKey,
            is_verified_student: true,
            match_score: row.skill_match_score ?? null,
            skills: skillSlugs.map((slug: string) => ({
              id: slug,
              slug,
              name: slugToName(slug),
            })),
          };
        });

        setCandidates(mappedCandidates);

        if (listingsRes.ok) {
          const listingsData = await listingsRes.json();
          const ownListings = Array.isArray(listingsData.listings)
            ? listingsData.listings
                .filter((l: any) => l.is_active)
                .map((l: any) => ({
                  id: l.id,
                  title: l.title,
                  is_active: !!l.is_active,
                  total_slots: l.total_slots ?? 0,
                  slots_remaining: l.slots_remaining ?? 0,
                }))
            : [];

          setListings(ownListings);

          const listingWithSlots = ownListings.find((l: CompanyListing) => l.slots_remaining > 0);
          setSelectedListingId(listingWithSlots?.id || ownListings[0]?.id || "");
        }
      } catch (error: any) {
        toast.error(error?.message || "Failed to load candidates.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const faculties = useMemo(
    () => Array.from(new Set(candidates.map((c) => c.faculty).filter(Boolean))).sort() as string[],
    [candidates]
  );

  const totalSlotsRemaining = useMemo(
    () => listings.reduce((sum, listing) => sum + Math.max(0, listing.slots_remaining || 0), 0),
    [listings]
  );

  const selectedListing = useMemo(
    () => listings.find((listing) => listing.id === selectedListingId) || null,
    [listings, selectedListingId]
  );

  const filtered = useMemo(() => {
    return candidates.filter((candidate) => {
      if (verifiedOnly && !candidate.is_verified_student) {
        return false;
      }

      if (selectedFaculties.length > 0 && (!candidate.faculty || !selectedFaculties.includes(candidate.faculty))) {
        return false;
      }

      if (selectedFocusAreas.length > 0 && (!candidate.focus_area_key || !selectedFocusAreas.includes(candidate.focus_area_key))) {
        return false;
      }

      if (experience !== "all" && candidate.experience_level_key !== experience) {
        return false;
      }

      return true;
    });
  }, [candidates, verifiedOnly, selectedFaculties, selectedFocusAreas, experience]);

  const toggleFaculty = (faculty: string) =>
    setSelectedFaculties((prev) => (prev.includes(faculty) ? prev.filter((x) => x !== faculty) : [...prev, faculty]));

  const toggleFocus = (focus: string) =>
    setSelectedFocusAreas((prev) => (prev.includes(focus) ? prev.filter((x) => x !== focus) : [...prev, focus]));

  const handleAcknowledge = async (candidateId: string) => {
    if (!selectedListingId) {
      toast.error("Select an active listing before sending acknowledgments.");
      return;
    }

    if (!selectedListing || selectedListing.slots_remaining <= 0) {
      toast.error("The selected listing has no acknowledgment slots remaining.");
      return;
    }

    setAcknowledging(candidateId);
    let created = false;
    try {
      const res = await fetch("/api/acknowledgments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listing_id: selectedListingId,
          student_profile_id: candidateId,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error?.message || "Failed to send acknowledgment");
      }

      created = true;

      setCandidates((prev) => prev.filter((candidate) => candidate.id !== candidateId));
      setListings((prev) =>
        prev.map((listing) =>
          listing.id === selectedListingId
            ? { ...listing, slots_remaining: Math.max(0, listing.slots_remaining - 1) }
            : listing
        )
      );

      toast.success("Acknowledgment sent.");
    } catch (error: any) {
      if (created) {
        toast.error("Acknowledgment was created, but the local view did not fully refresh.");
      }
      toast.error(error?.message || "Failed to send acknowledgment");
    } finally {
      setAcknowledging(null);
    }
  };

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 lg:px-8 py-8 flex flex-col md:flex-row gap-8">
      <aside className="w-full md:w-64 shrink-0 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg">Filters</h2>
          <button
            className="text-sm text-foreground-muted hover:text-foreground transition-colors"
            onClick={() => {
              setSelectedFaculties([]);
              setSelectedFocusAreas([]);
              setExperience("all");
              setVerifiedOnly(true);
            }}
          >
            Clear
          </button>
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-medium text-foreground-muted uppercase tracking-wider">Faculty</h3>
          {faculties.length === 0 ? (
            <p className="text-xs text-foreground-faint">No faculty data available.</p>
          ) : (
            faculties.map((faculty) => (
              <div key={faculty} className="flex items-center space-x-2">
                <Checkbox id={`fac-${faculty}`} checked={selectedFaculties.includes(faculty)} onCheckedChange={() => toggleFaculty(faculty)} />
                <Label htmlFor={`fac-${faculty}`} className="font-normal text-sm cursor-pointer">{faculty}</Label>
              </div>
            ))
          )}
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-medium text-foreground-muted uppercase tracking-wider">Focus Area</h3>
          {FOCUS_AREAS.map((focus) => (
            <div key={focus.value} className="flex items-center space-x-2">
              <Checkbox
                id={`focus-${focus.value}`}
                checked={selectedFocusAreas.includes(focus.value)}
                onCheckedChange={() => toggleFocus(focus.value)}
              />
              <Label htmlFor={`focus-${focus.value}`} className="font-normal text-sm cursor-pointer">{focus.label}</Label>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-medium text-foreground-muted uppercase tracking-wider">Experience</h3>
          <RadioGroup value={experience} onValueChange={setExperience} className="space-y-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="exp-all" />
              <Label htmlFor="exp-all" className="font-normal text-sm cursor-pointer">Any level</Label>
            </div>
            {EXPERIENCE_LEVELS.map((level) => (
              <div key={level.value} className="flex items-center space-x-2">
                <RadioGroupItem value={level.value} id={`exp-${level.value}`} />
                <Label htmlFor={`exp-${level.value}`} className="font-normal text-sm cursor-pointer">{level.label}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-medium text-foreground-muted uppercase tracking-wider">Status</h3>
          <div className="flex items-center space-x-2">
            <Checkbox id="verified-only" checked={verifiedOnly} onCheckedChange={(v) => setVerifiedOnly(!!v)} />
            <Label htmlFor="verified-only" className="font-normal text-sm cursor-pointer">Verified students only</Label>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <PageHeader
          title="Discover Candidates"
          description="Browse anonymous student profiles matched to your listings."
          className="pt-0 mt-0 sm:pt-0 border-none pb-4 mb-2 max-w-2xl"
        />

        <div className="p-4 bg-accent/5 border border-accent/20 rounded-xl mb-6 flex flex-col sm:flex-row gap-4 sm:items-end sm:justify-between">
          <div className="space-y-2 w-full sm:max-w-md">
            <Label htmlFor="listing-selector" className="text-xs uppercase tracking-wider text-foreground-muted">
              Send acknowledgments from
            </Label>
            <select
              id="listing-selector"
              className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm"
              value={selectedListingId}
              onChange={(e) => setSelectedListingId(e.target.value)}
            >
              {listings.length === 0 ? (
                <option value="">No active listings</option>
              ) : (
                listings.map((listing) => (
                  <option key={listing.id} value={listing.id}>
                    {listing.title} ({listing.slots_remaining} slots left)
                  </option>
                ))
              )}
            </select>
          </div>
          <div className="text-sm text-foreground-muted">
            <div>
              Selected listing: <strong>{selectedListing ? selectedListing.slots_remaining : 0} slots</strong>
            </div>
            <div>
              All active listings: <strong>{totalSlotsRemaining} slots</strong>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="bg-surface border border-border rounded-xl p-5 h-52 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-foreground-muted text-sm">No candidates match your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filtered.map((candidate) => (
              <CandidateCard
                key={candidate.id}
                candidate={candidate}
                onAcknowledge={() => handleAcknowledge(candidate.id)}
                loading={acknowledging === candidate.id}
                className="h-full"
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
