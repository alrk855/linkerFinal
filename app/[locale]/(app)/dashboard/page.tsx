"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { StatCard } from "@/components/ui/stat-card";
import { ListingCard } from "@/components/ui/listing-card";
import { ProfileCompleteness } from "@/components/ui/profile-completeness";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Bell, Plus } from "lucide-react";

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [listings, setListings] = useState<any[]>([]);
  const [acks, setAcks] = useState<any[]>([]);
  const [companyListings, setCompanyListings] = useState<any[]>([]);
  const [stats, setStats] = useState({ active: 0, applications: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    if (user.role === "student") {
      Promise.all([
        fetch("/api/listings?limit=4").then(r => r.json()),
        fetch("/api/acknowledgments/my").then(r => r.json()),
      ]).then(([ld, ad]) => {
        setListings(ld.listings || []);
        setAcks(ad.acknowledgments || []);
      }).catch(() => {}).finally(() => setLoading(false));
    } else {
      fetch("/api/company/listings").then(r => r.json()).then(d => {
        const ls = d.listings || [];
        setCompanyListings(ls);
        setStats({ active: ls.filter((l: any) => l.is_active).length, applications: ls.reduce((s: number, l: any) => s + (l.application_count || 0), 0) });
      }).catch(() => {}).finally(() => setLoading(false));
    }
  }, [user]);

  if (isLoading || !user) return <div className="flex-1 p-8 animate-pulse space-y-4"><div className="h-8 bg-surface-raised rounded w-1/3" /><div className="h-32 bg-surface rounded-xl" /></div>;

  const pendingAcks = acks.filter((a: any) => a.status === "pending").length;
  const profileScore = user.profile_completeness || 0;
  const profileRecommendation = profileScore >= 100
    ? "Your profile is complete and ready for discovery."
    : "Complete your profile to rank higher in company discovery.";

  const StudentDashboard = () => (
    <div className="flex flex-col gap-8 w-full max-w-6xl mx-auto pb-12">
      <div className="bg-surface border border-border rounded-2xl p-6 md:p-8 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Welcome back, {user.full_name?.split(" ")[0] || user.username}</h2>
          <p className="text-foreground-muted mt-1.5">{pendingAcks > 0 ? `You have ${pendingAcks} pending request${pendingAcks > 1 ? "s" : ""}.` : "Your profile is active."}</p>
          {pendingAcks > 0 && <Button onClick={() => router.push("/acknowledgments")} size="sm" className="mt-3 bg-accent hover:bg-accent-hover text-white gap-1.5"><Bell size={14} /> Review</Button>}
        </div>
        <div className="w-full md:w-56 shrink-0">
          <ProfileCompleteness value={profileScore} />
          <p className="text-xs text-foreground-muted mt-2">{profileRecommendation}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Applications" value={acks.length} />
        <StatCard label="Pending requests" value={pendingAcks} />
        <StatCard label="Connections" value={acks.filter((a: any) => a.status === "accepted").length} />
        <StatCard label="Profile" value={profileScore >= 100 ? "Complete" : "Needs updates"} />
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between"><h3 className="text-lg font-semibold">Recent Listings</h3><Button variant="link" className="text-sm text-accent p-0 h-auto font-medium" onClick={() => router.push("/listings")}>Browse all →</Button></div>
        {loading ? <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="h-48 bg-surface border border-border rounded-xl animate-pulse" />)}</div>
          : listings.length === 0 ? <div className="bg-surface border border-border rounded-xl p-8 text-center text-foreground-muted shadow-card">No listings yet.</div>
          : <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{listings.map((l: any) => <ListingCard key={l.id} listing={l} onClick={() => router.push(`/listings/${l.id}`)} />)}</div>}
      </div>
    </div>
  );

  const CompanyDashboard = () => (
    <div className="flex flex-col gap-8 w-full max-w-6xl mx-auto pb-12">
      <div className="flex items-start justify-between gap-4">
        <div><h2 className="text-2xl font-bold tracking-tight">{user.full_name || "Company Dashboard"}</h2><p className="text-foreground-muted mt-1">Manage listings and discover candidates.</p></div>
        <Button onClick={() => router.push("/company/listings/new")} className="bg-accent hover:bg-accent-hover text-white gap-2 shrink-0"><Plus size={16} /> New Listing</Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Active listings" value={stats.active} />
        <StatCard label="Total applications" value={stats.applications} />
        <StatCard label="Slots used" value={`${stats.active} / 3`} />
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between"><h3 className="text-lg font-semibold">Your Listings</h3><Button variant="link" className="text-sm text-accent p-0 h-auto" onClick={() => router.push("/company/listings")}>Manage all →</Button></div>
        {loading ? <div className="h-32 bg-surface rounded-xl animate-pulse" /> : companyListings.length === 0
          ? <div className="bg-surface border border-border rounded-xl p-8 text-center shadow-card"><p className="text-foreground-muted mb-4">No listings yet.</p><Button onClick={() => router.push("/company/listings/new")} className="bg-accent hover:bg-accent-hover text-white">Post your first listing</Button></div>
          : <div className="bg-surface border border-border rounded-xl shadow-card overflow-hidden"><table className="w-full text-sm"><thead className="bg-surface-raised border-b border-border text-foreground-muted text-xs uppercase"><tr><th className="px-5 py-3.5 text-left font-semibold">Title</th><th className="px-5 py-3.5 text-left font-semibold hidden sm:table-cell">Type</th><th className="px-5 py-3.5 text-left font-semibold">Slots</th><th className="px-5 py-3.5 text-left font-semibold">Status</th></tr></thead><tbody className="divide-y divide-border">{companyListings.slice(0, 5).map((l: any) => <tr key={l.id} className="hover:bg-surface-raised cursor-pointer transition-colors" onClick={() => router.push(`/company/listings/${l.id}`)}><td className="px-5 py-4 font-medium">{l.title}</td><td className="px-5 py-4 text-foreground-muted hidden sm:table-cell">{l.listing_type}</td><td className="px-5 py-4 text-foreground-muted">{l.slots_remaining}/{l.total_slots}</td><td className="px-5 py-4"><span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${l.is_active ? "bg-success/10 text-success border-success/20" : "bg-surface-raised text-foreground-muted border-border"}`}>{l.is_active ? "Active" : "Inactive"}</span></td></tr>)}</tbody></table></div>}
      </div>
    </div>
  );

  return <div className="flex-1 w-full p-4 lg:p-8">{user.role === "student" ? <StudentDashboard /> : <CompanyDashboard />}</div>;
}
