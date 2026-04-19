"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Plus, Pencil, Trash, Power } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

export default function CompanyListingsPage() {
  const router = useRouter();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/company/listings");
        if (!res.ok) throw new Error("Failed to load listings");
        const data = await res.json();
        setListings(data.listings || []);
      } catch {
        toast.error("Failed to load listings");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleToggle = async (e: React.MouseEvent, listing: any) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/listings/${listing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !listing.is_active }),
      });
      if (!res.ok) throw new Error();
      setListings((prev) =>
        prev.map((l) => (l.id === listing.id ? { ...l, is_active: !l.is_active } : l))
      );
      toast.success(`Listing ${!listing.is_active ? "activated" : "deactivated"}`);
    } catch {
      toast.error("Failed to update listing");
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Delete this listing? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/listings/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setListings((prev) => prev.filter((l) => l.id !== id));
      toast.success("Listing deleted");
    } catch {
      toast.error("Failed to delete listing");
    }
  };

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto px-4 lg:px-8 py-8 flex flex-col gap-6">
      <PageHeader
        title="Your Listings"
        description="Manage your job postings and review applications."
        actions={
          <Button
            onClick={() => router.push("/company/listings/new")}
            className="bg-accent hover:bg-accent-hover text-white font-medium"
          >
            <Plus size={16} className="mr-2" /> New Listing
          </Button>
        }
      />

      <div className="bg-surface border border-border rounded-xl px-1 overflow-hidden shadow-card">
        <Table>
          <TableHeader className="bg-background">
            <TableRow className="border-border">
              <TableHead className="font-medium text-foreground-muted py-4 px-5">Title</TableHead>
              <TableHead className="font-medium text-foreground-muted py-4 px-5 hidden sm:table-cell">Type</TableHead>
              <TableHead className="font-medium text-foreground-muted py-4 px-5">Slots</TableHead>
              <TableHead className="font-medium text-foreground-muted py-4 px-5 hidden md:table-cell">Applications</TableHead>
              <TableHead className="font-medium text-foreground-muted py-4 px-5">Status</TableHead>
              <TableHead className="font-medium text-foreground-muted py-4 px-5 hidden lg:table-cell">Posted</TableHead>
              <TableHead className="font-medium text-foreground-muted py-4 px-5 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border">
            {loading ? (
              [...Array(3)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={7} className="py-4 px-5">
                    <div className="h-4 bg-surface-raised rounded animate-pulse w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : listings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-foreground-muted">
                  No listings yet.{" "}
                  <button
                    className="text-accent hover:underline"
                    onClick={() => router.push("/company/listings/new")}
                  >
                    Post your first listing
                  </button>
                </TableCell>
              </TableRow>
            ) : (
              listings.map((l) => (
                <TableRow
                  key={l.id}
                  className="hover:bg-surface-raised cursor-pointer transition-colors"
                  onClick={() => router.push(`/company/listings/${l.id}`)}
                >
                  <TableCell className="font-medium text-foreground px-5 py-4">{l.title}</TableCell>
                  <TableCell className="hidden sm:table-cell text-foreground-muted px-5 py-4 text-sm">{l.listing_type}</TableCell>
                  <TableCell className="text-foreground-muted px-5 py-4 text-sm">
                    {l.slots_remaining} / {l.total_slots}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-foreground-muted px-5 py-4 text-sm">
                    {l.application_count ?? 0}
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <span
                      className={`px-2 py-1 rounded-md text-xs font-medium border ${
                        l.is_active
                          ? "bg-success/10 text-success border-success/20"
                          : "bg-surface-raised text-foreground-faint border-border"
                      }`}
                    >
                      {l.is_active ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-foreground-muted px-5 py-4 text-sm">
                    {l.created_at
                      ? formatDistanceToNow(new Date(l.created_at), { addSuffix: true })
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right px-5 py-4" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-surface-raised">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-surface border-border shadow-custom-dropdown">
                        <DropdownMenuItem
                          className="cursor-pointer hover:bg-surface-raised"
                          onClick={(e) => { e.stopPropagation(); router.push(`/company/listings/${l.id}`); }}
                        >
                          <Pencil className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer hover:bg-surface-raised"
                          onClick={(e) => handleToggle(e, l)}
                        >
                          <Power className="mr-2 h-4 w-4" />
                          {l.is_active ? "Deactivate" : "Activate"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer text-destructive focus:text-destructive hover:bg-destructive/10"
                          onClick={(e) => handleDelete(e, l.id)}
                        >
                          <Trash className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
