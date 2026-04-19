"use client";

import { useAuth } from "@/providers/auth-provider";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Building2, LogOut } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();

  if (user?.role !== "admin") {
    // In real app, redirect or show 403
    return <div className="p-8">Неовластен пристап</div>;
  }

  const NAV_ITEMS = [
    { label: "Контролна табла", href: "/admin", icon: LayoutDashboard },
    { label: "Студенти", href: "/admin/students", icon: Users },
    { label: "Компании", href: "/admin/companies", icon: Building2 },
  ];

  return (
    <div className="flex w-full min-h-screen bg-background">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-surface border-r border-border flex flex-col hidden md:flex shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="font-semibold tracking-tight text-foreground">Linker Админ</span>
          </div>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-1">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/admin");
            return (
              <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${isActive ? "bg-accent/10 text-accent font-medium" : "text-foreground-muted hover:text-foreground hover:bg-surface-raised"}`}>
                <Icon size={18} className={isActive ? "text-accent" : "text-foreground-muted"} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border mt-auto">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-foreground-muted hover:text-foreground hover:bg-surface-raised transition-colors">
            <LogOut size={18} /> Излези од админ
          </Link>
        </div>
      </aside>

      {/* Main Admin Area */}
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-y-auto">
        <header className="h-16 border-b border-border bg-surface flex items-center justify-end px-8 md:hidden">
          <span className="font-semibold px-4">Linker Админ</span>
        </header>
        <div className="p-4 lg:p-8 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
