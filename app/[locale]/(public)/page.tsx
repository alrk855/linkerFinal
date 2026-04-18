import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Footer } from "@/components/layout/footer";

export default async function LandingPage() {
  const t = await getTranslations("Index");

  return (
    <div className="min-h-screen flex flex-col items-center bg-background text-foreground relative">
      {/* 
        This acts as the transparent navbar on scroll top for Landing. 
        It needs to become backdrop-blur on scroll, but since this is RSC, 
        we can either make it a separate client component or just standard fixed header. 
        To adhere to instructions closely, we use a simple header.
      */}
      <header className="absolute top-0 w-full p-6 z-50 flex justify-center lg:justify-start">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-accent flex items-center justify-center text-foreground font-bold">
            L
          </div>
          <span className="font-semibold text-xl tracking-tight">Linker</span>
        </div>
      </header>

      <main className="flex-1 w-full flex flex-col lg:flex-row relative z-10 min-h-[90vh]">
        
        {/* Left Side (Student) */}
        <section className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-24 py-24 lg:py-0 text-center lg:text-left">
          <span className="text-foreground-muted text-xs tracking-widest uppercase mb-4 sm:mb-6">
            {t("for_students")}
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground mb-6 max-w-xl mx-auto lg:mx-0">
            {t("student_heading")}
          </h1>
          <p className="text-foreground-muted text-lg max-w-md mx-auto lg:mx-0 mb-10 leading-relaxed">
            {t("student_subtext")}
          </p>
          <div className="flex flex-col items-center lg:items-start gap-4">
            <Link 
              href="/auth/signup?role=student" 
              className="inline-flex items-center justify-center bg-accent hover:bg-accent-hover text-background font-medium h-14 px-8 rounded-lg w-full sm:w-auto lg:w-96 transition-colors shadow-sm"
            >
              {t("student_cta")}
            </Link>
            <Link href="/auth/signin" className="text-sm font-medium text-foreground-muted hover:text-foreground underline underline-offset-4 transition-colors">
              {t("already_registered")}
            </Link>
          </div>
        </section>

        {/* Divider */}
        <div className="relative flex lg:flex-col items-center justify-center py-8 lg:py-0 lg:w-px">
          <div className="absolute inset-x-8 lg:inset-x-auto lg:inset-y-24 h-px lg:h-auto lg:w-px bg-border flex-1" />
          <div className="relative z-10 bg-background px-4 py-2 text-foreground-faint text-sm font-medium">
            {t("or")}
          </div>
        </div>

        {/* Right Side (Company) */}
        <section className="flex-1 flex flex-col justify-center items-center lg:items-end px-8 sm:px-16 lg:px-24 py-24 lg:py-0 text-center lg:text-right">
          <span className="text-foreground-muted text-xs tracking-widest uppercase mb-4 sm:mb-6">
            {t("for_companies")}
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground mb-6 max-w-xl">
            {t("company_heading")}
          </h1>
          <p className="text-foreground-muted text-lg max-w-md mb-10 leading-relaxed">
            {t("company_subtext")}
          </p>
          <div className="flex flex-col items-center lg:items-end gap-4 w-full sm:w-auto">
            <Link 
              href="/auth/signup?role=company" 
              className="inline-flex items-center justify-center bg-surface hover:bg-surface-raised border border-border text-foreground font-medium h-14 px-8 rounded-lg w-full lg:w-96 transition-colors shadow-sm"
            >
              {t("company_cta")}
            </Link>
            <Link href="/auth/signin" className="text-sm font-medium text-foreground-muted hover:text-foreground underline underline-offset-4 transition-colors">
              {t("already_registered")}
            </Link>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
