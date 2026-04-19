"use client";

import { useState, useEffect, useMemo } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { CandidateCard } from "@/components/ui/candidate-card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";

const FACULTIES = ["FINKI", "FEIT", "FCSE", "Law", "Medicine", "Economics", "Mechanical Engineering"];
const FOCUS_AREAS = ["Frontend", "Backend", "Fullstack", "Mobile", "DevOps", "Data", "Security"];
const EXPERIENCE_LEVELS = ["No experience", "Junior", "Mid-level", "Senior"];

export default function CompanyDiscoverPage() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [slotsRemaining, setSlotsRemaining] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [acknowledging, setAcknowledging] = useState<string | null>(null);

  const [selectedFaculties, setSelectedFaculties] = useState<string[]>([]);
  const [selectedFocusAreas, setSelectedFocusAreas] = useState<string[]>([]);
  const [experience, setExperience] = useState("all");
  const [verifiedOnly, setVerifiedOnly] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/discover/students");
        if (!res.ok) throw new Error("Failed to load");
        const data = await res.json();
        setCandidates(data.candidates || []);
        setSlotsRemaining(data.slots_remaining ?? null);
      } catch {
        toast.error("Failed to load candidates");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    return candidates.filter((c) => {
      if (verifiedOnly && !c.is_verified_student) return false;
      if (selectedFaculties.length > 0 && !selectedFaculties.includes(c.faculty)) return false;
      if (selectedFocusAreas.length > 0 && !selectedFocusAreas.includes(c.focus_area)) return false;
      if (experience !== "all" && c.experience_level !== experience) return false;
      return true;
    });
  }, [candidates, verifiedOnly, selectedFaculties, selectedFocusAreas, experience]);

  const toggleFaculty = (f: string) =>
    setSelectedFaculties((prev) => prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]);
  const toggleFocus = (f: string) =>
    setSelectedFocusAreas((prev) => prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]);

  const handleAcknowledge = async (candidateId: string) => {
    setAcknowledging(candidateId);
    try {
      const res = await fetch("/api/acknowledgments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_profile_id: candidateId }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error?.message || "Failed to send acknowledgment");
      }
      toast.success("Acknowledgment sent. 1 slot used.");
      if (slotsRemaining !== null) setSlotsRemaining((s) => (s ?? 1) - 1);
      setCandidates((prev) => prev.filter((c) => c.id !== candidateId));
    } catch (err: any) {
      toast.error(err?.message || "Failed to send acknowledgment");
    } finally {
      setAcknowledging(null);
    }
  };

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 lg:px-8 py-8 flex flex-col md:flex-row gap-8">
      {/* Sidebar */}
      <aside className="w-full md:w-64 shrink-0 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg">Filters</h2>
          <button
            className="text-sm text-foreground-muted hover:text-foreground transition-colors"
            onClick={() => { setSelectedFaculties([]); setSelectedFocusAreas([]); setExperience("all"); setVerifiedOnly(true); }}
          >
            Clear
          </button>
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-medium text-foreground-muted uppercase tracking-wider">Faculty</h3>
          {FACULTIES.map((f) => (
            <div key={f} className="flex items-center space-x-2">
              <Checkbox id={`fac-${f}`} checked={selectedFaculties.includes(f)} onCheckedChange={() => toggleFaculty(f)} />
              <Label htmlFor={`fac-${f}`} className="font-normal text-sm cursor-pointer">{f}</Label>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-medium text-foreground-muted uppercase tracking-wider">Focus Area</h3>
          {FOCUS_AREAS.map((f) => (
            <div key={f} className="flex items-center space-x-2">
              <Checkbox id={`focus-${f}`} checked={selectedFocusAreas.includes(f)} onCheckedChange={() => toggleFocus(f)} />
              <Label htmlFor={`focus-${f}`} className="font-normal text-sm cursor-pointer">{f}</Label>
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
            {EXPERIENCE_LEVELS.map((lvl) => (
              <div key={lvl} className="flex items-center space-x-2">
                <RadioGroupItem value={lvl} id={`exp-${lvl}`} />
                <Label htmlFor={`exp-${lvl}`} className="font-normal text-sm cursor-pointer">{lvl}</Label>
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

      {/* Main */}
      <main className="flex-1 min-w-0">
        <PageHeader
          title="Discover Candidates"
          description="Browse anonymous student profiles matched to your listings. Send acknowledgments to request contact."
          className="pt-0 mt-0 sm:pt-0 border-none pb-4 mb-2 max-w-2xl"
        />

        <div className="p-4 bg-accent/5 border border-accent/20 rounded-xl mb-6 flex items-center justify-between">
          <span className="text-sm">
            You have <strong>{slotsRemaining ?? "..."} acknowledgment slots</strong> remaining.
          </span>
          <a href="#" className="text-sm font-medium text-accent hover:text-accent-hover transition-colors">Manage slots</a>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-surface border border-border rounded-xl p-5 h-52 animate-pulse" />
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
