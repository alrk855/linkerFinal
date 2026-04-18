"use client";

import Link from "next/link";
import { useAuth } from "@/providers/auth-provider";
import { Bell, Menu } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
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
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("Common"); // Assuming Common has generic stuff, maybe need explicit translations if any

  // Simplified language toggler
  const toggleLocale = () => {
    const nextLocale = locale === "en" ? "mk" : "en";
    let newPath = pathname;
    
    if (newPath === `/${locale}` || newPath.startsWith(`/${locale}/`)) {
      newPath = newPath.replace(`/${locale}`, `/${nextLocale}`);
    } else if (newPath === "/") {
      newPath = `/${nextLocale}`;
    } else {
      newPath = `/${nextLocale}${newPath}`;
    }
    
    router.push(newPath);
  };

  const navLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/listings", label: "Listings" },
    { href: "/company/discover", label: "Discover Candidates", role: "company" },
    { href: "/acknowledgments", label: "Acknowledgments", role: "student" },
  ];

  const visibleLinks = navLinks.filter(l => !l.role || l.role === user?.role);

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur border-b border-border w-full">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Left: Logo */}
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-md bg-accent flex items-center justify-center text-foreground font-bold text-xs">
            L
          </div>
          <span className="font-medium">Linker</span>
        </Link>
        
        {/* Right side Desktop */}
        <div className="hidden sm:flex items-center gap-6">
          <button onClick={toggleLocale} className="text-sm font-medium uppercase text-foreground-muted hover:text-foreground transition-colors">
            {locale === "en" ? "EN / mk" : "en / MK"}
          </button>
          
          <Link href="/notifications" className="relative text-foreground-muted hover:text-foreground">
            <Bell size={20} />
            <span className="absolute top-0 right-0 w-2 h-2 bg-destructive rounded-full border border-background"></span>
          </Link>
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="outline-none">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user.avatar_url || ""} />
                  <AvatarFallback className="bg-surface-raised text-xs">
                    {user.full_name?.charAt(0) || user.username.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 shadow-custom-dropdown border-border">
                <div className="px-2 py-1.5 flex flex-col">
                  <span className="text-sm font-medium">{user.full_name || "User"}</span>
                  <span className="text-xs text-foreground-muted">@{user.username}</span>
                </div>
                <DropdownMenuSeparator className="bg-border-subtle" />
                <DropdownMenuItem asChild><Link href="/profile">Profile</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/profile/edit">Edit profile</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/profile/settings">Account settings</Link></DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border-subtle" />
                <DropdownMenuItem onClick={signOut} className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer">
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/auth/signin" className="text-sm font-medium text-foreground hover:text-accent transition-colors">
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile menu */}
        <div className="sm:hidden flex items-center gap-4">
          <button onClick={toggleLocale} className="text-xs font-medium uppercase text-foreground-muted">
            {locale}
          </button>
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
                <div className="h-px w-full bg-border-subtle my-2" />
                {user ? (
                  <>
                    <Link href="/profile" className="text-lg font-medium text-foreground-muted hover:text-foreground">Profile</Link>
                    <Link href="/profile/edit" className="text-lg font-medium text-foreground-muted hover:text-foreground">Edit profile</Link>
                    <button onClick={signOut} className="text-left text-lg font-medium text-destructive">Sign out</button>
                  </>
                ) : (
                  <Link href="/auth/signin" className="text-lg font-medium text-foreground">Sign In</Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
