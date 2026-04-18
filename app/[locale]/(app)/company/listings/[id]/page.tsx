"use client";

import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { SkillTag } from "@/components/ui/skill-tag";
import { useRouter } from "next/navigation";

const MOCK_DETAIL = {
  id: "1",
  title: "Frontend Engineering Intern",
  listing_type: "Internship",
  slots_remaining: 2,
  total_slots: 3,
  is_active: true,
  applications: [
    { id: "101", candidate_id: "stud_1", status: "pending_review", created_at: "2 hours ago", match_score: 95, skills: ["React", "TypeScript", "Next.js"] },
    { id: "102", candidate_id: "stud_2", status: "accepted", created_at: "1 day ago", match_score: 80, skills: ["Vue", "JavaScript", "HTML"] }
  ]
};

export default function CompanyListingDetailPage({ params }: { params: { id: string } }) {
  const listing = MOCK_DETAIL;
  const router = useRouter();

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto px-4 lg:px-8 py-8 flex flex-col gap-8">
      
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">{listing.title}</h1>
            <span className={`px-2 py-1 rounded-md text-xs font-medium border ${listing.is_active ? 'bg-success/10 text-success border-success/20' : 'bg-surface-raised text-foreground-faint border-border'}`}>
              {listing.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
          <p className="text-sm text-foreground-muted">
            {listing.listing_type} • {listing.slots_remaining} of {listing.total_slots} slots remaining
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="bg-surface hover:bg-surface-raised border-border" onClick={() => router.push(`/listings/${listing.id}`)}>
            View public page
          </Button>
          <Button variant="outline" className="bg-surface hover:bg-surface-raised border-border">
            Edit listing
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-surface border-border p-5 md:col-span-1">
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-foreground-muted mb-1">Total Applications</p>
              <p className="text-3xl font-semibold tracking-tight">{listing.applications.length}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground-muted mb-1">Acknowledgment Usage</p>
              <div className="flex items-center justify-between text-sm mb-2">
                <span>{listing.total_slots - listing.slots_remaining} used</span>
                <span className="text-foreground-muted">{listing.total_slots} limit</span>
              </div>
              <div className="h-1.5 w-full bg-surface-raised rounded-full overflow-hidden">
                <div className="h-full bg-accent" style={{ width: `${Math.max(5, ((listing.total_slots - listing.slots_remaining) / listing.total_slots) * 100)}%` }} />
              </div>
            </div>
          </div>
        </Card>

        <div className="md:col-span-3 space-y-4">
          <h2 className="text-lg font-medium tracking-tight">Applications & Acknowledgments</h2>
          
          <div className="bg-surface border border-border rounded-xl px-1 overflow-hidden">
            <Table>
              <TableHeader className="bg-background">
                <TableRow className="border-border">
                  <TableHead className="font-medium text-foreground-muted py-4 px-5">Candidate</TableHead>
                  <TableHead className="font-medium text-foreground-muted py-4 px-5">Match</TableHead>
                  <TableHead className="font-medium text-foreground-muted py-4 px-5">Applied</TableHead>
                  <TableHead className="font-medium text-foreground-muted py-4 px-5">Status</TableHead>
                  <TableHead className="font-medium text-foreground-muted py-4 px-5 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border">
                {listing.applications.map(app => (
                  <TableRow key={app.id} className="hover:bg-surface-raised transition-colors">
                    <TableCell className="px-5 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground cursor-pointer hover:underline" onClick={() => router.push(`/profile/${app.candidate_id}`)}>
                            {app.status === 'accepted' ? 'Jane Doe' : 'Anonymous Student'}
                          </span>
                          <VerifiedBadge size="sm" />
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {app.skills.slice(0, 2).map(s => <span key={s} className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-background border border-border text-foreground-muted">{s}</span>)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <span className={`font-mono text-sm ${app.match_score >= 85 ? 'text-success' : 'text-foreground-muted'}`}>
                        {app.match_score}%
                      </span>
                    </TableCell>
                    <TableCell className="text-foreground-muted px-5 py-4 text-sm">{app.created_at}</TableCell>
                    <TableCell className="px-5 py-4">
                      <span className="px-2 py-1 rounded-md text-xs font-medium border bg-surface-raised text-foreground-muted border-border capitalize">
                        {app.status.replace("_", " ")}
                      </span>
                    </TableCell>
                    <TableCell className="text-right px-5 py-4">
                      <Button size="sm" variant="outline" className="bg-background hover:bg-surface-raised border-border">Review</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

    </div>
  );
}
