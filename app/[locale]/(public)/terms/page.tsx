import { getTranslations } from "next-intl/server";
import Link from "next/link";

export default async function TermsPage() {
  const t = await getTranslations("Terms");

  const sections = [
    { title: t("section1_title"), text: t("section1_text") },
    { title: t("section2_title"), text: t("section2_text") },
    { title: t("section3_title"), text: t("section3_text") },
    { title: t("section4_title"), text: t("section4_text") },
    { title: t("section5_title"), text: t("section5_text") },
    { title: t("section6_title"), text: t("section6_text") },
    { title: t("section7_title"), text: t("section7_text") },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto max-w-3xl px-6 py-16">
        <Link href="/" className="text-sm text-foreground-muted hover:text-foreground transition-colors mb-8 inline-block">
          &larr; Back to home
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight mb-2">{t("title")}</h1>
        <p className="text-sm text-foreground-muted mb-10">{t("last_updated")}</p>

        <div className="space-y-8">
          {sections.map((section, i) => (
            <div key={i}>
              <h2 className="text-lg font-medium mb-2">{section.title}</h2>
              <p className="text-foreground-muted leading-relaxed">{section.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
