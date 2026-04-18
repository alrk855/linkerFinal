import { CookieBanner } from "@/components/layout/cookie-banner";
import { Navbar } from "@/components/layout/navbar";
import { AuthProvider } from "@/providers/auth-provider";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Public layout still needs the cookie banner
  return (
    <AuthProvider>
      <Navbar />
      <main className="flex-1 flex flex-col w-full h-full min-h-[100dvh]">
        {children}
      </main>
      <CookieBanner />
    </AuthProvider>
  );
}
