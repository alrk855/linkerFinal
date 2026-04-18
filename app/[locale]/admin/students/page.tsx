"use client";

import { PageHeader } from "@/components/ui/page-header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, Eye } from "lucide-react";

const MOCK_STUDENTS = [
  { id: "1", username: "student_one", full_name: "John Doe", email: "john@students.finki.ukim.mk", is_verified: false, review_status: "pending", faculty: "FINKI" },
  { id: "2", username: "student_two", full_name: "Jane Smith", email: "jane@students.finki.ukim.mk", is_verified: true, review_status: "approved", faculty: "FINKI" },
  { id: "3", username: "alien_99", full_name: "Some Guy", email: "guy@gmail.com", is_verified: false, review_status: "rejected", faculty: "Unknown" },
];

export default function AdminStudentsPage() {

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full">
      <PageHeader 
        title="Student Management" 
        description="Review student registrations and manage verification status." 
        className="pt-0 mt-0 sm:pt-0 pb-2 mb-2 border-none"
      />

      <div className="bg-surface border border-border rounded-xl px-1 overflow-hidden">
        <Table>
          <TableHeader className="bg-background">
            <TableRow className="border-border">
              <TableHead className="font-medium text-foreground-muted py-4 px-5">User</TableHead>
              <TableHead className="font-medium text-foreground-muted py-4 px-5">Email</TableHead>
              <TableHead className="font-medium text-foreground-muted py-4 px-5">Faculty</TableHead>
              <TableHead className="font-medium text-foreground-muted py-4 px-5">Status</TableHead>
              <TableHead className="font-medium text-foreground-muted py-4 px-5 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border">
            {MOCK_STUDENTS.map(s => (
              <TableRow key={s.id} className="hover:bg-surface-raised transition-colors">
                <TableCell className="px-5 py-4">
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">{s.full_name}</span>
                    <span className="text-xs text-foreground-muted font-mono">@{s.username}</span>
                  </div>
                </TableCell>
                <TableCell className="px-5 py-4 text-foreground-muted">{s.email}</TableCell>
                <TableCell className="px-5 py-4 text-foreground-muted">{s.faculty}</TableCell>
                <TableCell className="px-5 py-4">
                  {s.review_status === "pending" && <Badge variant="outline" className="bg-status-warning/10 text-status-warning border-status-warning/20">Pending ID</Badge>}
                  {s.review_status === "approved" && <Badge variant="outline" className="bg-success/10 text-success border-success/20">Verified</Badge>}
                  {s.review_status === "rejected" && <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">Rejected</Badge>}
                </TableCell>
                <TableCell className="px-5 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-surface-raised" title="View Profile">
                      <Eye size={16} className="text-foreground-muted" />
                    </Button>
                    {s.review_status !== "approved" && (
                      <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-success/20 hover:text-success" title="Approve">
                        <Check size={16} />
                      </Button>
                    )}
                    {s.review_status !== "rejected" && (
                      <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-destructive/20 hover:text-destructive" title="Reject">
                        <X size={16} />
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
