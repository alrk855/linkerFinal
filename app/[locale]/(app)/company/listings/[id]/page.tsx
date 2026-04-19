"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { mk } from "date-fns/locale";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-warning/10 text-warning border-warning/20",
  reviewed: "bg-accent/10 text-accent border-accent/20",
  acknowledged: "bg-success/10 text-success border-success/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
  withdrawn: "bg-surface-raised text-foreground-faint border-border",
};

function formatListingType(value?: string) {
  const key = (value || "").toLowerCase();
  if (key === "internship") return "Практикантство";
  if (key === "part_time" || key === "part-time") return "Скратено работно време";
  if (key === "full_time" || key === "full-time") return "Полно работно време";
  return value || "-";
}

function formatApplicationStatus(value?: string) {
  const key = (value || "pending").toLowerCase();
  if (key === "pending") return "на чекање";
  if (key === "reviewed") return "прегледана";
  if (key === "acknowledged") return "потврдена";
  if (key === "rejected") return "одбиена";
  if (key === "withdrawn") return "повлечена";
  return key;
}

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
        if (!listRes.ok) throw new Error("Огласот не е пронајден");
        const listData = await listRes.json();
        setListing(listData.listing || listData);
        if (appRes.ok) {
          const appData = await appRes.json();
          setApplications(appData.applications || []);
        }
      } catch (err: any) {
        toast.error(err?.message || "Неуспешно вчитување на огласот");
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
      toast.success(`Огласот е ${!listing.is_active ? "активиран" : "деактивиран"}.`);
    } catch {
      toast.error("Неуспешна промена на огласот");
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
        <p className="text-foreground-muted">Огласот не е пронајден.</p>
        <Button variant="outline" onClick={() => router.push("/company/listings")}>Назад кон огласи</Button>
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
            <ArrowLeft size={14} /> Назад кон огласи
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
              {listing.is_active ? "Активен" : "Неактивен"}
            </span>
          </div>
          <p className="text-sm text-foreground-muted">
            {formatListingType(listing.listing_type)}
            {listing.focus_area ? ` · ${listing.focus_area}` : ""}
            {" · "}
            {listing.slots_remaining ?? 0} од {listing.total_slots} слотови преостанати
          </p>
        </div>
        <div className="flex gap-3 shrink-0">
          <Button
            variant="outline"
            className="bg-surface hover:bg-surface-raised border-border"
            onClick={() => router.push(`/listings/${listing.id}`)}
          >
            Јавна страница
          </Button>
          <Button
            variant="outline"
            className="bg-surface hover:bg-surface-raised border-border"
            onClick={handleToggle}
          >
            {listing.is_active ? "Деактивирај" : "Активирај"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-surface border-border p-5 shadow-card md:col-span-1 space-y-5">
          <div>
            <p className="text-sm font-medium text-foreground-muted mb-1">Вкупно апликации</p>
            <p className="text-3xl font-semibold tracking-tight">{applications.length}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground-muted mb-2">Искористеност на потврди</p>
            <div className="flex items-center justify-between text-xs mb-2 text-foreground-muted">
              <span>{slotsUsed} искористени</span>
              <span>{listing.total_slots} лимит</span>
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
              <p className="text-sm font-medium text-foreground-muted mb-1">Опис</p>
              <p className="text-sm text-foreground-muted line-clamp-5">{listing.description}</p>
            </div>
          )}
        </Card>

        <div className="md:col-span-3 space-y-4">
          <h2 className="text-lg font-medium tracking-tight">Апликации</h2>

          <div className="bg-surface border border-border rounded-xl px-1 overflow-hidden shadow-card">
            <Table>
              <TableHeader className="bg-background">
                <TableRow className="border-border">
                  <TableHead className="font-medium text-foreground-muted py-4 px-5">Кандидат</TableHead>
                  <TableHead className="font-medium text-foreground-muted py-4 px-5">Совпаѓање</TableHead>
                  <TableHead className="font-medium text-foreground-muted py-4 px-5 hidden sm:table-cell">Аплицирано</TableHead>
                  <TableHead className="font-medium text-foreground-muted py-4 px-5">Статус</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border">
                {applications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12 text-foreground-muted text-sm">
                      Се уште нема апликации.
                    </TableCell>
                  </TableRow>
                ) : (
                  applications.map((app) => {
                    const card = app.student_card || {};
                    return (
                      <TableRow key={app.id} className="hover:bg-surface-raised transition-colors">
                        <TableCell className="px-5 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-foreground">Анонимен студент</span>
                              <VerifiedBadge size="sm" />
                            </div>
                            <p className="text-xs text-foreground-muted">
                              {card.faculty || "Непознат факултет"}
                              {card.year_of_study ? ` · Година ${card.year_of_study}` : ""}
                              {card.focus_area ? ` · ${String(card.focus_area).replace(/_/g, " ")}` : ""}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="px-5 py-4">
                          {app.skill_match_score != null ? (
                            <span className={`font-mono text-sm ${app.skill_match_score >= 75 ? "text-success" : "text-foreground-muted"}`}>
                              {app.skill_match_score}%
                            </span>
                          ) : (
                            <span className="text-foreground-faint text-sm">—</span>
                          )}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-foreground-muted px-5 py-4 text-sm">
                          {app.created_at
                            ? formatDistanceToNow(new Date(app.created_at), { addSuffix: true, locale: mk })
                            : "—"}
                        </TableCell>
                        <TableCell className="px-5 py-4">
                          <span
                            className={`px-2 py-1 rounded-md text-xs font-medium border capitalize ${
                              STATUS_STYLES[app.status] || "bg-surface-raised text-foreground-muted border-border"
                            }`}
                          >
                            {formatApplicationStatus(app.status)}
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
