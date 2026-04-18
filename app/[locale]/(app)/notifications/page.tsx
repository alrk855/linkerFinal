"use client";

import { PageHeader } from "@/components/ui/page-header";
import { Bell, Briefcase, FileCheck, Circle } from "lucide-react";

const MOCK_NOTIFICATIONS = [
  { id: "1", type: "system", title: "Profile Approved", message: "Your student profile has been verified. You can now be discovered by companies.", date: "1 hour ago", is_read: false },
  { id: "2", type: "job", title: "New listing in Frontend", message: "TechCorp just posted a new Internship role matching your profile constraints.", date: "Yesterday", is_read: true },
  { id: "3", type: "system", title: "Welcome to Linker", message: "Complete your profile to increase your chances of being discovered.", date: "2 days ago", is_read: true },
];

export default function NotificationsPage() {

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-4 lg:px-8 py-8 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <PageHeader title="Notifications" description="Updates from the platform and potential employers." className="pt-0 mt-0 sm:pt-0 border-none pb-0 mb-0" />
        <button className="text-sm font-medium text-accent hover:text-accent-hover transition-colors">Mark all as read</button>
      </div>
      
      <div className="bg-surface border border-border rounded-xl">
        <div className="divide-y divide-border">
          {MOCK_NOTIFICATIONS.map(n => (
            <div key={n.id} className={`p-5 flex gap-4 transition-colors hover:bg-surface-raised ${!n.is_read ? 'bg-background' : ''}`}>
              <div className="mt-1">
                {n.type === 'system' ? (
                  <div className="w-10 h-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                    <FileCheck size={18} />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-surface-raised border border-border flex items-center justify-center text-foreground-muted">
                    <Briefcase size={18} />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                      {n.title}
                      {!n.is_read && <Circle className="w-2 h-2 fill-accent text-accent" />}
                    </h4>
                    <p className="text-sm text-foreground-muted mt-1 leading-relaxed">
                      {n.message}
                    </p>
                  </div>
                  <span className="text-xs text-foreground-faint whitespace-nowrap">{n.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
