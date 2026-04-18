"use client";

import { PageHeader } from "@/components/ui/page-header";
import { CandidateCard } from "@/components/ui/candidate-card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";

// Mock Candidates
const MOCK_CANDIDATES = [
  { id: "1", is_verified_student: true, faculty: "FINKI", year_of_study: "4", degree_type: "Bachelor", focus_area: "Frontend", experience_level: "Junior", skills: [{id:"1", name: "React"}, {id:"2", name:"Next.js"}, {id:"3", name:"TypeScript"}] },
  { id: "2", is_verified_student: true, faculty: "FEIT", year_of_study: "3", degree_type: "Bachelor", focus_area: "Backend", experience_level: "No experience", skills: [{id:"4", name: "Node.js"}, {id:"5", name:"Java"}, {id:"6", name:"SQL"}] },
  { id: "3", is_verified_student: true, faculty: "FINKI", year_of_study: null, degree_type: "Master", focus_area: "Data", experience_level: "Mid-level", skills: [{id:"7", name: "Python"}, {id:"8", name:"Machine Learning"}, {id:"9", name:"SQL"}] },
  { id: "4", is_verified_student: false, faculty: "Mechanical Engineering", year_of_study: "2", degree_type: "Bachelor", focus_area: "Other", experience_level: "No experience", skills: [{id:"10", name: "CAD"}] },
];

export default function CompanyDiscoverPage() {

  const handleAcknowledge = (id: string) => {
    toast.success("Acknowledgment request sent. 1 slot used.");
  };

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 lg:px-8 py-8 flex flex-col md:flex-row gap-8">
      {/* Sidebar Filters */}
      <aside className="w-full md:w-64 shrink-0 flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg hover:text-foreground transition-colors">Filters</h2>
          <button className="text-sm text-foreground-muted hover:text-foreground transition-colors">Clear filters</button>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-medium text-foreground-muted uppercase tracking-wider">Faculty</h3>
          <div className="space-y-3">
            {["FINKI", "FEIT", "Mechanical Engineering"].map(f => (
              <div key={f} className="flex items-center space-x-2">
                <Checkbox id={`fac-${f}`} />
                <Label htmlFor={`fac-${f}`} className="font-normal text-sm">{f}</Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-medium text-foreground-muted uppercase tracking-wider">Focus Area</h3>
          <div className="space-y-3">
            {["Frontend", "Backend", "Fullstack", "Mobile", "Data", "Security"].map(f => (
              <div key={f} className="flex items-center space-x-2">
                <Checkbox id={`focus-${f}`} />
                <Label htmlFor={`focus-${f}`} className="font-normal text-sm">{f}</Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-medium text-foreground-muted uppercase tracking-wider">Experience</h3>
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

        <div className="space-y-4">
          <h3 className="text-sm font-medium text-foreground-muted uppercase tracking-wider">Status</h3>
          <div className="flex items-center space-x-2">
            <Checkbox id="verified-only" defaultChecked />
            <Label htmlFor="verified-only" className="font-normal text-sm">Verified students only</Label>
          </div>
        </div>
      </aside>

      {/* Main Discover Grid */}
      <main className="flex-1 min-w-0">
        <PageHeader 
          title="Discover Candidates" 
          description="Find anonymous talent based on skills, faculty, and focus area. Send acknowledgments to request contact." 
          className="pt-0 mt-0 sm:pt-0 border-none pb-4 mb-2 max-w-2xl" 
        />
        
        <div className="p-4 bg-surface-raised border border-border rounded-xl mb-6 flex items-center justify-between">
          <span className="text-sm">You have <strong>8 acknowledgment slots</strong> remaining.</span>
          <a href="#" className="text-sm font-medium text-accent hover:text-accent-hover transition-colors">Manage slots</a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-4">
          {MOCK_CANDIDATES.map((candidate) => (
            <CandidateCard 
              key={candidate.id} 
              candidate={candidate} 
              onAcknowledge={() => handleAcknowledge(candidate.id)} 
              className="h-full justify-between"
            />
          ))}
        </div>
      </main>
    </div>
  );
}
