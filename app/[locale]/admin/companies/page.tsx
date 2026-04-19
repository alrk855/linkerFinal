"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldAlert, CheckCircle, Eye } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function AdminCompaniesPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");

  useEffect(() => {
    async function load() {
      try {
        const param = filter === "all" ? "" : `?status=${filter}`;
        const res = await fetch(`/api/admin/companies${param}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setCompanies(data.companies || []);
      } catch {
        toast.error("Failed to load companies");
      } finally {
        setLoading(false);
      }
    }
    setLoading(true);
    load();
  }, [filter]);

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/companies/${id}/approve`, { method: "PATCH" });
      if (!res.ok) throw new Error();
      setCompanies((prev) =>
        prev.map((c) => c.id === id ? { ...c, approval_status: "approved" } : c)
      );
      toast.success("Company approved");
    } catch {
      toast.error("Failed to approve company");
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm("Reject this company account?")) return;
    try {
      const res = await fetch(`/api/admin/companies/${id}/reject`, { method: "PATCH" });
      if (!res.ok) throw new Error();
      setCompanies((prev) =>
        prev.map((c) => c.id === id ? { ...c, approval_status: "rejected" } : c)
      );
      toast.success("Company rejected");
    } catch {
      toast.error("Failed to reject company");
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full">
      <PageHeader
        title="Company Management"
        description="Approve company accounts and adjust acknowledgment quotas."
        className="pt-0 mt-0 sm:pt-0 pb-2 mb-2 border-none"
      />

      <div className="flex gap-2 flex-wrap">
        {(["all", "pending", "approved", "rejected"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors capitalize ${
              filter === f
                ? "bg-accent text-white border-accent"
                : "bg-surface border-border text-foreground-muted hover:bg-surface-raised"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="bg-surface border border-border rounded-xl px-1 overflow-hidden shadow-card">
        <Table>
          <TableHeader className="bg-background">
            <TableRow className="border-border">
              <TableHead className="font-medium text-foreground-muted py-4 px-5">Company</TableHead>
              <TableHead className="font-medium text-foreground-muted py-4 px-5 hidden md:table-cell">Email</TableHead>
              <TableHead className="font-medium text-foreground-muted py-4 px-5">Status</TableHead>
              <TableHead className="font-medium text-foreground-muted py-4 px-5 hidden sm:table-cell">Slots</TableHead>
              <TableHead className="font-medium text-foreground-muted py-4 px-5 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border">
            {loading ? (
              [...Array(3)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={5} className="py-4 px-5">
                    <div className="h-4 bg-surface-raised rounded animate-pulse w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : companies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-foreground-muted text-sm">
                  No companies found.
                </TableCell>
              </TableRow>
            ) : (
              companies.map((c) => (
                <TableRow key={c.id} className="hover:bg-surface-raised transition-colors">
                  <TableCell className="px-5 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">{c.company_name || "—"}</span>
                      {c.profiles?.username && (
                        <span className="text-xs text-foreground-muted font-mono">@{c.profiles.username}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell px-5 py-4 text-foreground-muted text-sm">
                    {c.profiles?.email || c.email || "—"}
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    {c.approval_status === "approved" ? (
                      <Badge variant="outline" className="bg-success/10 text-success border-success/20">Approved</Badge>
                    ) : c.approval_status === "rejected" ? (
                      <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">Rejected</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">Pending</Badge>
                    )}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell px-5 py-4 text-foreground-muted text-sm">
                    {c.slots_limit ?? "—"} max
                  </TableCell>
                  <TableCell className="px-5 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {c.profiles?.username && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 hover:bg-surface-raised"
                          title="View Profile"
                          onClick={() => router.push(`/profile/${c.profiles.username}`)}
                        >
                          <Eye size={16} className="text-foreground-muted" />
                        </Button>
                      )}
                      {c.approval_status !== "approved" && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 hover:bg-success/20 hover:text-success"
                          title="Approve"
                          onClick={() => handleApprove(c.id)}
                        >
                          <CheckCircle size={16} />
                        </Button>
                      )}
                      {c.approval_status === "approved" && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 hover:bg-destructive/20 hover:text-destructive"
                          title="Suspend"
                          onClick={() => handleReject(c.id)}
                        >
                          <ShieldAlert size={16} />
                        </Button>
                      )}
                    </div>
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
