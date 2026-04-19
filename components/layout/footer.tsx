import Link from "next/link";
import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("Index");

  return (
    <footer className="w-full bg-background border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-foreground-muted">
          
          {/* Logo / Brand */}
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground">Link<span className="text-accent">er</span></span>
            <span className="opacity-50">© {new Date().getFullYear()}</span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6">
            <Link href="/terms" className="hover:text-foreground transition-colors">
              {t("legal_tos")}
            </Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              {t("legal_privacy")}
            </Link>
          </div>

          {/* Empty Space for future elements or duplicate language toggle */}
        </div>
      </div>
    </footer>
  );
}
