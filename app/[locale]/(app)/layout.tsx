import { Navbar } from "@/components/layout/navbar";
import { CookieBanner } from "@/components/layout/cookie-banner";
import { AuthProvider } from "@/providers/auth-provider";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <Navbar />
      <main className="flex-1 flex flex-col w-full">
        {children}
      </main>
      <CookieBanner />
    </AuthProvider>
  );
}
