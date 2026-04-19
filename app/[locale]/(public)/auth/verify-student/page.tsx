"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Phone, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

function VerifyStudentContent() {
  const t = useTranslations("Auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [view, setView] = useState<"ms" | "phone" | "otp">("ms");

  useEffect(() => {
    const error = searchParams.get("error");
    if (error === "azure_email_failed") {
      toast.error("Неуспешна Microsoft најава: не може да се преземе универзитетскиот емаил. Најавете се со UKIM Microsoft сметка.");
    } else if (error === "missing_state") {
      toast.error("Сесијата за верификација истече. Обидете се повторно.");
    } else if (error === "invalid_ukim_email") {
      toast.error("Оваа Microsoft сметка не изгледа како UKIM универзитетски емаил.");
    }
  }, [searchParams]);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  
  const handleMsConnect = () => {
    // Initiate MS OAuth flow
    window.location.href = "/api/auth/verify-student/initiate";
  };

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setView("otp");
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast("Телефонската верификација ќе биде достапна наскоро.");
    router.push("/auth/waitlist");
  };

  // OTP Input handler
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    // Autofocus next
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-sm bg-surface text-center rounded-xl overflow-hidden transition-all duration-300">
        
        {view === "ms" && (
          <div className="animate-in fade-in slide-in-from-bottom-2">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-semibold tracking-tight">{t("verify_student")}</CardTitle>
              <CardDescription className="text-foreground-muted mt-2">{t("connect_ms")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Button onClick={handleMsConnect} className="w-full bg-[#0078D4] hover:bg-[#0078D4]/90 text-white font-medium h-12 text-md">
                {t("connect_ms_btn")}
              </Button>
              <div>
                <button onClick={() => setView("phone")} className="text-sm font-medium text-foreground-muted hover:text-foreground underline underline-offset-4 decoration-border-subtle">
                  {t("not_a_student")}
                </button>
              </div>
            </CardContent>
          </div>
        )}

        {view === "phone" && (
          <div className="animate-in fade-in slide-in-from-right-4">
            <CardHeader className="pb-4 text-left">
              <div className="w-12 h-12 bg-surface-raised rounded-lg flex items-center justify-center mb-4">
                <Phone className="text-foreground" size={24} />
              </div>
              <CardTitle className="text-xl font-semibold">{t("phone_verify")}</CardTitle>
              <CardDescription className="text-foreground-muted mt-1">{t("phone_verify_desc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePhoneSubmit} className="space-y-4 text-left">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t("phone_verify")}</label>
                  <div className="flex gap-2">
                    <select className="bg-background border border-border rounded-md px-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent">
                      <option>+389</option>
                      <option>+1</option>
                      <option>+44</option>
                    </select>
                    <Input required type="tel" placeholder="7x xxx xxx" className="bg-background border-border flex-1" />
                  </div>
                </div>
                <Button type="submit" className="w-full bg-accent hover:bg-accent-hover text-background font-medium">
                  {t("send_code")}
                </Button>
              </form>
            </CardContent>
          </div>
        )}

        {view === "otp" && (
          <div className="animate-in fade-in slide-in-from-right-4">
            <CardHeader className="pb-4 text-left">
               <div className="w-12 h-12 bg-surface-raised rounded-lg flex items-center justify-center mb-4 text-foreground">
                <CheckCircle2 size={24} />
              </div>
              <CardTitle className="text-xl font-semibold">Внесете код за верификација</CardTitle>
              <CardDescription className="text-foreground-muted mt-1">Испративме 6-цифрен код на вашиот телефон.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleOtpSubmit} className="space-y-6 text-left">
                <div className="flex justify-between gap-2">
                  {otp.map((digit, i) => (
                    <Input 
                      key={i} 
                      id={`otp-${i}`}
                      type="text" 
                      inputMode="numeric"
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      className="w-12 h-14 text-center font-mono text-xl bg-background border-border"
                      maxLength={1}
                      required
                    />
                  ))}
                </div>
                <div className="text-center">
                  <button type="button" className="text-xs font-medium text-foreground-muted hover:text-foreground">
                    {t("resend_code")}
                  </button>
                </div>
                <Button type="submit" className="w-full bg-accent hover:bg-accent-hover text-background font-medium">
                  {t("verify")}
                </Button>
              </form>
            </CardContent>
          </div>
        )}

      </Card>
    </div>
  );
}

export default function VerifyStudentPage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center p-12"><div className="w-8 h-8 rounded-full border-2 border-accent border-r-transparent animate-spin" /></div>}>
      <VerifyStudentContent />
    </Suspense>
  );
}
