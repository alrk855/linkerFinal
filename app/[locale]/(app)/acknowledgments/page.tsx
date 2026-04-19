"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

type StudentAck = {
  id: string;
  status: "pending" | "accepted" | "declined";
  created_at: string;
  listings?: {
    id: string;
    title: string;
    listing_type?: string | null;
    focus_area?: string | null;
  } | null;
  company_profiles?:
    | {
        id: string;
        company_name: string;
        logo_url: string | null;
      }
    | {
        id: string;
        company_name: string;
        logo_url: string | null;
      }[]
    | null;
};

type CompanyAckGroup = {
  listing: {
    id: string;
    title: string;
    listing_type?: string | null;
    focus_area?: string | null;
  } | null;
  items: Array<{
    id: string;
    status: "pending" | "accepted" | "declined";
    created_at: string;
    profiles?:
      | {
          id: string;
          username: string | null;
          full_name: string | null;
          avatar_url: string | null;
        }
      | {
          id: string;
          username: string | null;
          full_name: string | null;
          avatar_url: string | null;
        }[]
      | null;
  }>;
};

function getCompany(row: StudentAck) {
  return Array.isArray(row.company_profiles)
    ? row.company_profiles[0]
    : row.company_profiles;
}

function getStudent(row: CompanyAckGroup["items"][number]) {
  return Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
}

export default function AcknowledgmentsPage() {
  const { user, isLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [studentRows, setStudentRows] = useState<StudentAck[]>([]);
  const [companyGroups, setCompanyGroups] = useState<CompanyAckGroup[]>([]);
  const [actingId, setActingId] = useState<string | null>(null);

  async function loadInbox() {
    try {
      setLoading(true);
      const res = await fetch("/api/acknowledgments/my");
      if (!res.ok) {
        throw new Error("Failed to load acknowledgments");
      }

      const data = await res.json();
      setStudentRows(Array.isArray(data.acknowledgments) ? data.acknowledgments : []);
      setCompanyGroups(Array.isArray(data.grouped_acknowledgments) ? data.grouped_acknowledgments : []);
    } catch (error: any) {
      toast.error(error?.message || "Failed to load acknowledgments.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!isLoading && user) {
      loadInbox();
    }
  }, [isLoading, user]);

  const pending = useMemo(() => studentRows.filter((r) => r.status === "pending"), [studentRows]);
  const accepted = useMemo(() => studentRows.filter((r) => r.status === "accepted"), [studentRows]);

  async function handleDecision(id: string, status: "accepted" | "declined") {
    setActingId(id);
    try {
      const res = await fetch(`/api/acknowledgments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error?.message || "Failed to update acknowledgment");
      }

      setStudentRows((prev) => prev.map((row) => (row.id === id ? { ...row, status } : row)));
      toast.success(status === "accepted" ? "Acknowledgment accepted." : "Acknowledgment declined.");
    } catch (error: any) {
      toast.error(error?.message || "Failed to update acknowledgment.");
    } finally {
      setActingId(null);
    }
  }

  if (isLoading || !user || loading) {
    return (
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-8 h-8 rounded-full border-2 border-accent border-r-transparent animate-spin" />
      </div>
    );
  }

  if (user.role === "student") {
    return (
      <div className="flex-1 w-full max-w-5xl mx-auto px-4 lg:px-8 py-8 flex flex-col gap-6">
        <PageHeader title="Inbox" description="Manage acknowledgment requests from companies." />

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="mb-6 bg-surface border border-border">
            <TabsTrigger value="pending" className="data-[state=active]:bg-background data-[state=active]:text-foreground">
              Pending Requests
              <span className="ml-2 bg-accent text-background text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                {pending.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="accepted" className="data-[state=active]:bg-background data-[state=active]:text-foreground">
              Connections
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pending.length === 0 ? (
              <div className="rounded-xl border border-border bg-surface p-8 text-sm text-foreground-muted">
                No pending acknowledgment requests.
              </div>
            ) : (
              pending.map((row) => {
                const company = getCompany(row);
                const listingTitle = row.listings?.title || "a listing";
                return (
                  <div key={row.id} className="bg-surface border border-border rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex gap-4 items-start">
                      <Avatar className="w-10 h-10 border border-border">
                        <AvatarImage src={company?.logo_url || undefined} />
                        <AvatarFallback className="bg-background text-xs">
                          {(company?.company_name || "CO").slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium text-foreground">
                          Acknowledgment Request from {company?.company_name || "Company"}
                        </h3>
                        <p className="text-sm text-foreground-muted mt-1 leading-relaxed max-w-xl">
                          They want to reveal your identity for <strong>{listingTitle}</strong>.
                        </p>
                        <span className="text-xs text-foreground-faint mt-2 block">
                          {row.created_at
                            ? formatDistanceToNow(new Date(row.created_at), { addSuffix: true })
                            : "Recently"}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Button
                        variant="outline"
                        className="flex-1 bg-surface hover:bg-surface-raised border-border text-foreground"
                        disabled={actingId === row.id}
                        onClick={() => handleDecision(row.id, "declined")}
                      >
                        <X size={16} className="mr-2" /> Decline
                      </Button>
                      <Button
                        className="flex-1 bg-accent hover:bg-accent-hover text-background font-medium"
                        disabled={actingId === row.id}
                        onClick={() => handleDecision(row.id, "accepted")}
                      >
                        <Check size={16} className="mr-2" /> Accept
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </TabsContent>

          <TabsContent value="accepted" className="space-y-4">
            {accepted.length === 0 ? (
              <div className="rounded-xl border border-border bg-surface p-8 text-sm text-foreground-muted">
                No accepted acknowledgments yet.
              </div>
            ) : (
              accepted.map((row) => {
                const company = getCompany(row);
                return (
                  <div key={row.id} className="bg-surface border border-border rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex gap-4 items-center">
                      <Avatar className="w-10 h-10 border border-border">
                        <AvatarImage src={company?.logo_url || undefined} />
                        <AvatarFallback className="bg-background text-xs">
                          {(company?.company_name || "CO").slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium text-foreground">{company?.company_name || "Company"}</h3>
                        <p className="text-sm text-foreground-muted">
                          Accepted {row.created_at ? formatDistanceToNow(new Date(row.created_at), { addSuffix: true }) : "recently"}
                        </p>
                        {row.listings?.title ? (
                          <p className="text-xs text-foreground-faint mt-1">For: {row.listings.title}</p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto px-4 lg:px-8 py-8 flex flex-col gap-6">
      <PageHeader title="Sent Acknowledgments" description="Track the status of acknowledgment requests sent to candidates." />

      {companyGroups.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-8 text-sm text-foreground-muted">
          No acknowledgments sent yet.
        </div>
      ) : (
        <div className="space-y-6">
          {companyGroups.map((group, idx) => (
            <div key={`${group.listing?.id || "listing"}-${idx}`} className="rounded-xl border border-border bg-surface overflow-hidden">
              <div className="px-5 py-4 border-b border-border bg-background/70">
                <h3 className="font-medium text-foreground">{group.listing?.title || "Listing"}</h3>
                <p className="text-xs text-foreground-muted mt-1">
                  {group.listing?.listing_type ? group.listing.listing_type.replace(/_/g, " ") : "Role"}
                  {group.listing?.focus_area ? ` · ${group.listing.focus_area}` : ""}
                </p>
              </div>
              <div className="divide-y divide-border">
                {group.items.map((item) => {
                  const student = getStudent(item);
                  const statusTone =
                    item.status === "accepted"
                      ? "text-success bg-success/10 border-success/20"
                      : item.status === "declined"
                        ? "text-destructive bg-destructive/10 border-destructive/20"
                        : "text-warning bg-warning/10 border-warning/20";

                  return (
                    <div key={item.id} className="px-5 py-4 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {item.status === "accepted"
                            ? student?.full_name || student?.username || "Student"
                            : "Anonymous Student"}
                        </p>
                        <p className="text-xs text-foreground-muted mt-1">
                          Sent {item.created_at ? formatDistanceToNow(new Date(item.created_at), { addSuffix: true }) : "recently"}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-md text-xs font-medium border capitalize ${statusTone}`}>
                        {item.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
