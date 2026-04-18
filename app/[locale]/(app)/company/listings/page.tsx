"use client";

import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Plus, Pencil, Trash, Power } from "lucide-react";
import { useRouter } from "next/navigation";

const MOCK_LISTINGS = [
  { id: "1", title: "Frontend Engineering Intern", listing_type: "Internship", slots_remaining: 2, total_slots: 3, applications: 5, is_active: true, created_at: new Date().toLocaleDateString() },
  { id: "2", title: "React Native Developer", listing_type: "Part-time", slots_remaining: 0, total_slots: 1, applications: 12, is_active: false, created_at: new Date(Date.now() - 86400000).toLocaleDateString() },
];

export default function CompanyListingsPage() {
  const router = useRouter();

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto px-4 lg:px-8 py-8 flex flex-col gap-6">
      <PageHeader 
        title="Listing Management" 
        description="Manage your job postings and applications."
        actions={
          <Button onClick={() => router.push("/company/listings/new")} className="bg-accent hover:bg-accent-hover text-background font-medium">
            <Plus size={16} className="mr-2" /> New Listing
          </Button>
        }
      />

      <div className="bg-surface border border-border rounded-xl px-1 overflow-hidden">
        <Table>
          <TableHeader className="bg-background">
            <TableRow className="border-border">
              <TableHead className="font-medium text-foreground-muted py-4 px-5">Title</TableHead>
              <TableHead className="font-medium text-foreground-muted py-4 px-5 hidden sm:table-cell">Type</TableHead>
              <TableHead className="font-medium text-foreground-muted py-4 px-5">Slots</TableHead>
              <TableHead className="font-medium text-foreground-muted py-4 px-5 hidden md:table-cell">Applications</TableHead>
              <TableHead className="font-medium text-foreground-muted py-4 px-5">Status</TableHead>
              <TableHead className="font-medium text-foreground-muted py-4 px-5 hidden lg:table-cell">Created</TableHead>
              <TableHead className="font-medium text-foreground-muted py-4 px-5 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border">
            {MOCK_LISTINGS.map(l => (
              <TableRow key={l.id} className="hover:bg-surface-raised cursor-pointer transition-colors" onClick={() => router.push(`/company/listings/${l.id}`)}>
                <TableCell className="font-medium text-foreground px-5 py-4">{l.title}</TableCell>
                <TableCell className="hidden sm:table-cell text-foreground-muted px-5 py-4">{l.listing_type}</TableCell>
                <TableCell className="text-foreground-muted px-5 py-4 text-sm">{l.slots_remaining} / {l.total_slots}</TableCell>
                <TableCell className="hidden md:table-cell text-foreground-muted px-5 py-4 text-sm">{l.applications}</TableCell>
                <TableCell className="px-5 py-4">
                  <span className={`px-2 py-1 rounded-md text-xs font-medium border ${l.is_active ? 'bg-success/10 text-success border-success/20' : 'bg-surface-raised text-foreground-faint border-border'}`}>
                    {l.is_active ? 'Active' : 'Inactive'}
                  </span>
                </TableCell>
                <TableCell className="hidden lg:table-cell text-foreground-muted px-5 py-4 text-sm">{l.created_at}</TableCell>
                <TableCell className="text-right px-5 py-4" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-surface-raised">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-surface border-border shadow-custom-dropdown">
                      <DropdownMenuItem className="cursor-pointer hover:bg-surface-raised" onClick={() => router.push(`/company/listings/${l.id}`)}>
                        <Pencil className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer hover:bg-surface-raised">
                        <Power className="mr-2 h-4 w-4" /> Toggle Status
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive hover:bg-destructive/10">
                        <Trash className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {MOCK_LISTINGS.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-foreground-muted">
                  No listings found. Post your first listing to start discovering candidates.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

    </div>
  );
}
