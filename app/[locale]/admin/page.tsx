"use client";

import { StatCard } from "@/components/ui/stat-card";
import { PageHeader } from "@/components/ui/page-header";

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto w-full">
      <PageHeader 
        title="Admin Platform Overview" 
        description="Monitor system metrics, new registrations, and active connections." 
        className="pt-0 mt-0"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Students" value={142} />
        <StatCard label="Pending Verifications" value={18} className="border-accent-subtle bg-accent/5" />
        <StatCard label="Registered Companies" value={45} />
        <StatCard label="Active Listings" value={68} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-surface border border-border rounded-xl p-6">
          <h3 className="text-lg font-medium tracking-tight mb-4">Recent Student Activity</h3>
          <p className="text-sm text-foreground-muted">Dashboard metrics graph placeholder</p>
          <div className="h-48 mt-4 bg-background border border-border rounded-md flex items-center justify-center font-mono opacity-50">
            [Chart Area]
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-6">
          <h3 className="text-lg font-medium tracking-tight mb-4">System Alerts</h3>
          <div className="space-y-3">
            <div className="p-3 bg-status-warning/10 border border-status-warning/20 rounded-md">
              <p className="text-sm text-status-warning font-medium">18 student IDs pending manual review.</p>
            </div>
            <div className="p-3 bg-background border border-border rounded-md text-sm text-foreground-muted">
              Database connection stability is 99.9% over last 24h.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
