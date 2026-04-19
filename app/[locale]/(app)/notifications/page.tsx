"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Bell, Briefcase, FileCheck, CheckCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = () =>
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((d) => { setNotifications(d.notifications || []); setUnreadCount(d.unread_count || 0); })
      .catch(() => {})
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const markRead = async (id: string) => {
    await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const markAllRead = async () => {
    await fetch("/api/notifications/read-all", { method: "PATCH" });
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
    toast.success("All notifications marked as read.");
  };

  return (
    <div className="flex-1 w-full max-w-3xl mx-auto px-4 lg:px-8 py-8 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-foreground-muted text-sm mt-0.5">Updates from the platform and companies.</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-hover transition-colors"
          >
            <CheckCheck size={16} /> Mark all read
          </button>
        )}
      </div>

      <div className="bg-surface border border-border rounded-xl shadow-card overflow-hidden">
        {loading ? (
          <div className="divide-y divide-border">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="p-5 flex gap-4 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-surface-raised shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-surface-raised rounded w-1/3" />
                  <div className="h-3 bg-surface-raised rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center">
            <Bell size={32} className="text-foreground-faint mx-auto mb-3" />
            <p className="text-foreground-muted">No notifications yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => !n.is_read && markRead(n.id)}
                className={cn(
                  "w-full p-5 flex gap-4 text-left transition-colors hover:bg-surface-raised",
                  !n.is_read && "bg-accent/5 border-l-2 border-l-accent"
                )}
              >
                <div className="mt-0.5 shrink-0">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    n.type === "system" ? "bg-accent/10 text-accent" : "bg-surface-raised text-foreground-muted"
                  )}>
                    {n.type === "system" ? <FileCheck size={18} /> : <Briefcase size={18} />}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{n.title || "Notification"}</p>
                      <p className="text-sm text-foreground-muted mt-0.5 leading-relaxed">{n.message}</p>
                    </div>
                    <span className="text-xs text-foreground-faint whitespace-nowrap shrink-0">
                      {n.created_at ? formatDistanceToNow(new Date(n.created_at), { addSuffix: true }) : ""}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
