"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const t = useTranslations("Common");

  useEffect(() => {
    const consent = localStorage.getItem("linker_cookie_consent");
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleConsent = (decision: boolean) => {
    localStorage.setItem("linker_cookie_consent", decision.toString());
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 bg-surface border-t border-border p-4 z-50">
      <div className="container mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-foreground-muted">
          {t("cookie_consent_text")}
        </p>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button 
            onClick={() => handleConsent(false)}
            className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-foreground hover:bg-surface-raised rounded-lg transition-colors border border-transparent"
          >
            {t("decline")}
          </button>
          <button 
            onClick={() => handleConsent(true)}
            className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium bg-accent hover:bg-accent-hover text-foreground rounded-lg transition-colors"
          >
            {t("accept")}
          </button>
        </div>
      </div>
    </div>
  );
}
