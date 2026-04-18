"use client";

import { PageHeader } from "@/components/ui/page-header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit2, ShieldAlert, CheckCircle } from "lucide-react";

const MOCK_COMPANIES = [
  { id: "1", name: "TechCorp Skopje", email: "hr@techcorp.mk", is_approved: true, slots_limit: 20 },
  { id: "2", name: "StartupX", email: "hello@startupx.com", is_approved: false, slots_limit: 5 },
];

export default function AdminCompaniesPage() {
  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full">
      <PageHeader 
        title="Company Management" 
        description="Approve company accounts and adjust acknowledgment quotas." 
        className="pt-0 mt-0 sm:pt-0 pb-2 mb-2 border-none"
      />

      <div className="bg-surface border border-border rounded-xl px-1 overflow-hidden">
        <Table>
          <TableHeader className="bg-background">
            <TableRow className="border-border">
              <TableHead className="font-medium text-foreground-muted py-4 px-5">Company</TableHead>
              <TableHead className="font-medium text-foreground-muted py-4 px-5">Email</TableHead>
              <TableHead className="font-medium text-foreground-muted py-4 px-5">Status</TableHead>
              <TableHead className="font-medium text-foreground-muted py-4 px-5">Slot Quota</TableHead>
              <TableHead className="font-medium text-foreground-muted py-4 px-5 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border">
            {MOCK_COMPANIES.map(c => (
              <TableRow key={c.id} className="hover:bg-surface-raised transition-colors">
                <TableCell className="px-5 py-4 font-medium text-foreground">{c.name}</TableCell>
                <TableCell className="px-5 py-4 text-foreground-muted">{c.email}</TableCell>
                <TableCell className="px-5 py-4">
                  {c.is_approved ? (
                    <Badge variant="outline" className="bg-success/10 text-success border-success/20">Approved</Badge>
                  ) : (
                    <Badge variant="outline" className="bg-status-warning/10 text-status-warning border-status-warning/20">Pending Review</Badge>
                  )}
                </TableCell>
                <TableCell className="px-5 py-4 text-foreground-muted">{c.slots_limit} active max</TableCell>
                <TableCell className="px-5 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-surface-raised" title="Adjust Quota">
                      <Edit2 size={16} className="text-foreground-muted" />
                    </Button>
                    {!c.is_approved && (
                      <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-success/20 hover:text-success" title="Approve">
                        <CheckCircle size={16} />
                      </Button>
                    )}
                    {c.is_approved && (
                      <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-destructive/20 hover:text-destructive" title="Suspend">
                        <ShieldAlert size={16} />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

    </div>
  );
}
