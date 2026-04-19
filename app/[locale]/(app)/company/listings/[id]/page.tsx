"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  pending_review: "bg-warning/10 text-warning border-warning/20",
  accepted: "bg-success/10 text-success border-success/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
  withdrawn: "bg-surface-raised text-foreground-faint border-border",
};

export default function CompanyListingDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [listing, setListing] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [listRes, appRes] = await Promise.all([
          fetch(`/api/listings/${params.id}`),
          fetch(`/api/applications/listing/${params.id}`),
        ]);
        if (!listRes.ok) throw new Error("Listing not found");
        const listData = await listRes.json();
        setListing(listData.listing || listData);
        if (appRes.ok) {
          const appData = await appRes.json();
          setApplications(appData.applications || []);
        }
      } catch (err: any) {
        toast.error(err?.message || "Failed to load listing");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id]);

  const handleToggle = async () => {
    if (!listing) return;
    try {
      const res = await fetch(`/api/listings/${listing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !listing.is_active }),
      });
      if (!res.ok) throw new Error();
      setListing((l: any) => ({ ...l, is_active: !l.is_active }));
      toast.success(`Listing ${!listing.is_active ? "activated" : "deactivated"}`);
    } catch {
      toast.error("Failed to update listing");
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <div className="w-8 h-8 rounded-full border-2 border-accent border-r-transparent animate-spin" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-foreground-muted">Listing not found.</p>
        <Button variant="outline" onClick={() => router.push("/company/listings")}>Back to listings</Button>
      </div>
    );
  }

  const slotsUsed = listing.total_slots - (listing.slots_remaining ?? 0);

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto px-4 lg:px-8 py-8 flex flex-col gap-8">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <button
            className="flex items-center gap-1.5 text-sm text-foreground-muted hover:text-foreground transition-colors mb-2"
            onClick={() => router.push("/company/listings")}
          >
            <ArrowLeft size={14} /> Back to listings
          </button>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-semibold tracking-tight">{listing.title}</h1>
            <span
              className={`px-2 py-1 rounded-md text-xs font-medium border ${
                listing.is_active
                  ? "bg-success/10 text-success border-success/20"
                  : "bg-surface-raised text-foreground-faint border-border"
              }`}
            >
              {listing.is_active ? "Active" : "Inactive"}
            </span>
          </div>
          <p className="text-sm text-foreground-muted">
            {listing.listing_type}
            {listing.focus_area ? ` · ${listing.focus_area}` : ""}
            {" · "}
            {listing.slots_remaining ?? 0} of {listing.total_slots} slots remaining
          </p>
        </div>
        <div className="flex gap-3 shrink-0">
          <Button
            variant="outline"
            className="bg-surface hover:bg-surface-raised border-border"
            onClick={() => router.push(`/listings/${listing.id}`)}
          >
            View public page
          </Button>
          <Button
            variant="outline"
            className="bg-surface hover:bg-surface-raised border-border"
            onClick={handleToggle}
          >
            {listing.is_active ? "Deactivate" : "Activate"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-surface border-border p-5 shadow-card md:col-span-1 space-y-5">
          <div>
            <p className="text-sm font-medium text-foreground-muted mb-1">Total Applications</p>
            <p className="text-3xl font-semibold tracking-tight">{applications.length}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground-muted mb-2">Acknowledgment Usage</p>
            <div className="flex items-center justify-between text-xs mb-2 text-foreground-muted">
              <span>{slotsUsed} used</span>
              <span>{listing.total_slots} limit</span>
            </div>
            <div className="h-1.5 w-full bg-surface-raised rounded-full overflow-hidden">
              <div
                className="h-full bg-accent transition-all"
                style={{ width: `${Math.max(2, (slotsUsed / listing.total_slots) * 100)}%` }}
              />
            </div>
          </div>
          {listing.description && (
            <div>
              <p className="text-sm font-medium text-foreground-muted mb-1">Description</p>
              <p className="text-sm text-foreground-muted line-clamp-5">{listing.description}</p>
            </div>
          )}
        </Card>

        <div className="md:col-span-3 space-y-4">
          <h2 className="text-lg font-medium tracking-tight">Applications</h2>

          <div className="bg-surface border border-border rounded-xl px-1 overflow-hidden shadow-card">
            <Table>
              <TableHeader className="bg-background">
                <TableRow className="border-border">
                  <TableHead className="font-medium text-foreground-muted py-4 px-5">Candidate</TableHead>
                  <TableHead className="font-medium text-foreground-muted py-4 px-5">Match</TableHead>
                  <TableHead className="font-medium text-foreground-muted py-4 px-5 hidden sm:table-cell">Applied</TableHead>
                  <TableHead className="font-medium text-foreground-muted py-4 px-5">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border">
                {applications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12 text-foreground-muted text-sm">
                      No applications yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  applications.map((app) => {
                    const isRevealed = app.identity_revealed || app.status === "accepted";
                    return (
                      <TableRow key={app.id} className="hover:bg-surface-raised transition-colors">
                        <TableCell className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={isRevealed ? "font-medium text-foreground cursor-pointer hover:underline" : "text-foreground-muted"}
                              onClick={() => isRevealed && app.candidate_username && router.push(`/profile/${app.candidate_username}`)}
                            >
                              {isRevealed ? (app.candidate_name || "Student") : "Anonymous Student"}
                            </span>
                            {app.is_verified_student && <VerifiedBadge size="sm" />}
                          </div>
                        </TableCell>
                        <TableCell className="px-5 py-4">
                          {app.match_score != null ? (
                            <span className={`font-mono text-sm ${app.match_score >= 75 ? "text-success" : "text-foreground-muted"}`}>
                              {app.match_score}%
                            </span>
                          ) : (
                            <span className="text-foreground-faint text-sm">—</span>
                          )}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-foreground-muted px-5 py-4 text-sm">
                          {app.created_at
                            ? formatDistanceToNow(new Date(app.created_at), { addSuffix: true })
                            : "—"}
                        </TableCell>
                        <TableCell className="px-5 py-4">
                          <span
                            className={`px-2 py-1 rounded-md text-xs font-medium border capitalize ${
                              STATUS_STYLES[app.status] || "bg-surface-raised text-foreground-muted border-border"
                            }`}
                          >
                            {(app.status || "pending").replace(/_/g, " ")}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
