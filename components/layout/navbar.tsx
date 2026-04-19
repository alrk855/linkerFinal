"use client";

import Link from "next/link";
import { useAuth } from "@/providers/auth-provider";
import { Bell, Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Navbar() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();

  const logoHref = user ? "/dashboard" : "/";

  const navLinks = user?.role === "company"
    ? [
        { href: "/dashboard", label: "Контролна табла" },
        { href: "/company/listings", label: "Мои огласи" },
        { href: "/company/discover", label: "Кандидати" },
        { href: "/acknowledgments", label: "Сандаче" },
      ]
    : [
        { href: "/dashboard", label: "Контролна табла", role: "student" },
        { href: "/listings", label: "Огласи" },
        { href: "/acknowledgments", label: "Сандаче", role: "student" },
      ];

  const visibleLinks = navLinks.filter(l => !l.role || l.role === user?.role);

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur border-b border-border w-full">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8 min-w-0">
          {/* Left: Logo */}
          <Link href={logoHref} className="flex items-center gap-3 shrink-0">
            <span className="font-medium text-foreground">Link<span className="text-accent">er</span></span>
          </Link>

          <nav className="hidden md:flex items-center gap-4 text-sm min-w-0">
            {visibleLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={isActive
                    ? "text-foreground font-medium"
                    : "text-foreground-muted hover:text-foreground transition-colors"
                  }
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
        
        {/* Right side Desktop */}
        <div className="hidden sm:flex items-center gap-6">
          <div className="flex bg-surface-raised rounded-full p-0.5 border border-border">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-accent text-white shadow-sm">MK</span>
          </div>
          
          <Link href="/notifications" className="relative text-foreground-muted hover:text-foreground">
            <Bell size={20} />
          </Link>
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="outline-none">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user.avatar_url || ""} />
                  <AvatarFallback className="bg-surface-raised text-xs text-foreground font-medium">
                    {user.full_name?.charAt(0) || user.username.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 shadow-custom-dropdown border-border bg-surface">
                <div className="px-2 py-1.5 flex flex-col">
                    <span className="text-sm font-medium text-foreground">{user.full_name || "Корисник"}</span>
                  <span className="text-xs text-foreground-muted">@{user.username}</span>
                </div>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem className="text-foreground hover:bg-surface-raised" asChild><Link href="/profile">Профил</Link></DropdownMenuItem>
                <DropdownMenuItem className="text-foreground hover:bg-surface-raised" asChild><Link href="/profile/edit">Уреди профил</Link></DropdownMenuItem>
                <DropdownMenuItem className="text-foreground hover:bg-surface-raised" asChild><Link href="/profile/settings">Поставки</Link></DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem onClick={signOut} className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer">
                  Одјави се
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/auth/signin" className="text-sm font-medium text-foreground hover:text-accent transition-colors">
              Најава
            </Link>
          )}
        </div>

        {/* Mobile menu */}
        <div className="sm:hidden flex items-center gap-4">
          <div className="flex bg-surface-raised rounded-full p-[1px] border border-border">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-accent text-white shadow-sm">MK</span>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <button className="text-foreground-muted">
                <Menu size={24} />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-background border-l border-border pt-16">
              <nav className="flex flex-col gap-4">
                {visibleLinks.map(link => (
                  <Link key={link.href} href={link.href} className="text-lg font-medium text-foreground-muted hover:text-foreground">
                    {link.label}
                  </Link>
                ))}
                <div className="h-px w-full bg-border my-2" />
                {user ? (
                  <>
                    <Link href="/profile" className="text-lg font-medium text-foreground-muted hover:text-foreground">Профил</Link>
                    <Link href="/profile/edit" className="text-lg font-medium text-foreground-muted hover:text-foreground">Уреди профил</Link>
                    <button onClick={signOut} className="text-left text-lg font-medium text-destructive mt-4">Одјави се</button>
                  </>
                ) : (
                  <Link href="/auth/signin" className="text-lg font-medium text-foreground">Најава</Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
