"use client";

import { useAuth } from "@/providers/auth-provider";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { ListingCard } from "@/components/ui/listing-card";
import { ProfileCompleteness } from "@/components/ui/profile-completeness";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

// Mock Data
const MOCK_LISTINGS = [
  { id: "1", title: "Frontend Engineering Intern", listing_type: "Internship", slots_remaining: 2, created_at: new Date().toISOString() },
  { id: "2", title: "React Native Developer", listing_type: "Part-time", slots_remaining: 1, created_at: new Date(Date.now() - 86400000).toISOString() },
];

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  if (isLoading || !user) return (
    <div className="flex-1 container mx-auto px-4 py-8">
      <div className="w-full h-8 bg-surface-raised animate-pulse rounded-md max-w-sm mb-6" />
      <div className="w-full h-[200px] bg-surface-raised animate-pulse rounded-xl" />
    </div>
  );

  const StudentDashboard = () => (
    <div className="flex flex-col gap-8 w-full max-w-6xl mx-auto pb-12">
      <div className="bg-surface border border-border rounded-xl p-5 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground tracking-tight">Welcome back, {user.full_name?.split(" ")[0] || user.username}</h2>
          <p className="text-sm text-foreground-muted mt-1 max-w-xl">
            You have received 0 new acknowledgments this week.
          </p>
        </div>
        <div className="w-full md:w-64">
          <ProfileCompleteness value={user.profile_completeness || 0} />
          <p className="text-xs text-foreground-muted mt-2 leading-relaxed">
            {user.profile_completeness < 100 
              ? "Complete your profile to appear in company searches." 
              : "Your profile is fully visible to approved companies."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Recent listings</h3>
            <Button variant="link" className="text-sm text-foreground-muted hover:text-foreground p-0 h-auto" onClick={() => router.push("/listings")}>
              View all
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {MOCK_LISTINGS.map(l => (
              <ListingCard key={l.id} listing={l} onClick={() => router.push(`/listings/${l.id}`)} />
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Acknowledgments</h3>
              <Button variant="link" className="text-sm text-foreground-muted hover:text-foreground p-0 h-auto" onClick={() => router.push("/acknowledgments")}>
                Inbox
              </Button>
            </div>
            <StatCard label="Pending requests" value={0} />
          </div>
        </div>
      </div>
    </div>
  );

  const CompanyDashboard = () => (
    <div className="flex flex-col gap-8 w-full max-w-6xl mx-auto pb-12">
      <PageHeader 
        title={user.full_name || "Company Dashboard"} 
        description="Monitor your active listings and discovery engagements."
        actions={
          <Button onClick={() => router.push("/company/listings/new")} className="bg-accent hover:bg-accent-hover text-background font-medium shadow-sm">
            Post a new listing
          </Button>
        }
      />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Active listings" value={2} />
        <StatCard label="Acknowledgments sent" value={14} />
        <StatCard label="Applications received" value={5} />
      </div>

      <div className="mt-8 space-y-4">
        <h3 className="text-xl font-medium tracking-tight">Active Listings</h3>
        <div className="bg-surface border border-border rounded-xl px-1 overflow-hidden overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-background text-foreground-muted uppercase text-xs border-b border-border">
              <tr>
                <th className="px-5 py-4 font-medium">Title</th>
                <th className="px-5 py-4 font-medium hidden sm:table-cell">Type</th>
                <th className="px-5 py-4 font-medium">Slots</th>
                <th className="px-5 py-4 font-medium hidden md:table-cell">Applications</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {MOCK_LISTINGS.map(l => (
                <tr key={l.id} className="hover:bg-surface-raised cursor-pointer transition-colors" onClick={() => router.push(`/company/listings/${l.id}`)}>
                  <td className="px-5 py-4 font-medium text-foreground">{l.title}</td>
                  <td className="px-5 py-4 hidden sm:table-cell text-foreground-muted">{l.listing_type}</td>
                  <td className="px-5 py-4 text-foreground-muted">{l.slots_remaining} remaining</td>
                  <td className="px-5 py-4 hidden md:table-cell text-foreground-muted">2</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 w-full p-4 lg:p-8">
      {user.role === "student" ? <StudentDashboard /> : <CompanyDashboard />}
    </div>
  );
}
