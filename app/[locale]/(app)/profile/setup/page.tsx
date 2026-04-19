"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/providers/auth-provider";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CheckCircle2, ArrowRight, Sparkles, GraduationCap, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

const studentSchema = z.object({
  full_name: z.string().min(2, "Задолжително е целосно име"),
  bio: z.string().max(200).optional(),
  faculty: z.string().optional(),
  degree_type: z.enum(["bachelor", "master", "phd"]).optional(),
  year_of_study: z.string().optional(),
  experience_level: z.enum(["no_experience", "junior", "mid", "senior"]).optional(),
  focus_area: z.enum(["frontend", "backend", "fullstack", "mobile", "devops", "data", "other"]).optional(),
  github_url: z.string().url().optional().or(z.literal("")),
  linkedin_url: z.string().url().optional().or(z.literal("")),
  portfolio_url: z.string().url().optional().or(z.literal("")),
});

const companySchema = z.object({
  full_name: z.string().min(2, "Задолжително е име на контакт"),
  company_name: z.string().min(2, "Задолжително е име на компанија"),
  company_description: z.string().max(400).optional(),
  industry: z.string().optional(),
  size_range: z.enum(["1-10", "11-50", "51-200", "201-1000", "1000+"]).optional(),
  location: z.string().optional(),
  company_website: z.string().url().optional().or(z.literal("")),
});

const STUDENT_STEPS = ["Добредојде", "Академски", "Област и вештини", "Линкови"];
const COMPANY_STEPS = ["Добредојде", "Инфо за компанија", "Присуство"];

function asOptionalString(value?: string) {
  const trimmed = (value || "").trim();
  return trimmed.length > 0 ? trimmed : null;
}

function asOptionalNumber(value?: string) {
  if (!value || value.trim() === "") {
    return null;
  }
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : null;
}

export default function ProfileSetupPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const verified = searchParams.get("verified") === "true";
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const isStudent = user?.role === "student";
  const steps = isStudent ? STUDENT_STEPS : COMPANY_STEPS;

  const form = useForm<any>({
    resolver: zodResolver(isStudent ? studentSchema : companySchema),
    defaultValues: {
      full_name: user?.full_name || "",
      bio: "",
      faculty: "",
      degree_type: "bachelor",
      year_of_study: "",
      experience_level: "no_experience",
      focus_area: "",
      github_url: "",
      linkedin_url: "",
      portfolio_url: "",
      company_name: "",
      company_description: "",
      industry: "",
      size_range: "",
      location: "",
      company_website: "",
    },
  });

  useEffect(() => {
    if (user?.full_name) {
      form.setValue("full_name", user.full_name);
    }
  }, [user, form]);

  const saveAndFinish = async (values: any) => {
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        full_name: values.full_name.trim(),
      };

      if (isStudent) {
        payload.bio = asOptionalString(values.bio);
        payload.short_description = asOptionalString(values.bio);
        payload.faculty = asOptionalString(values.faculty);
        payload.degree_type = asOptionalString(values.degree_type);
        payload.year_of_study = asOptionalNumber(values.year_of_study);
        payload.experience_level = asOptionalString(values.experience_level);
        payload.focus_area = asOptionalString(values.focus_area);
        payload.github_url = asOptionalString(values.github_url);
        payload.linkedin_url = asOptionalString(values.linkedin_url);
        payload.portfolio_url = asOptionalString(values.portfolio_url);
      } else {
        payload.company_name = asOptionalString(values.company_name);
        payload.company_description = asOptionalString(values.company_description);
        payload.industry = asOptionalString(values.industry);
        payload.size_range = asOptionalString(values.size_range);
        payload.location = asOptionalString(values.location);
        payload.company_website = asOptionalString(values.company_website);
      }

      const res = await fetch("/api/profile/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Неуспешно зачувување");
      toast.success("Профилот е зачуван! Добредојдовте на Linker.");
      router.push("/dashboard");
    } catch {
      toast.error("Профилот не може да се зачува. Може да ажурирате подоцна.");
      router.push("/dashboard");
    } finally {
      setSaving(false);
    }
  };

  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const isLast = step === steps.length - 1;

  if (isLoading || !user) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-accent border-r-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 w-full min-h-screen bg-background flex flex-col items-center px-4 py-12">
      {/* Header */}
      <div className="w-full max-w-lg mb-8 text-center">
        {verified && (
          <div className="inline-flex items-center gap-2 text-success bg-success/10 border border-success/20 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <CheckCircle2 size={16} />
            Студентскиот идентитет е верификуван!
          </div>
        )}
        <h1 className="text-3xl font-semibold tracking-tight text-foreground mb-2">
          {step === 0 ? "Добредојдовте на Linker" : `Поставете го вашиот ${isStudent ? "студентски" : "компаниски"} профил`}
        </h1>
        <p className="text-foreground-muted">
          {step === 0
            ? isStudent
              ? "Да го подготвиме профилот за компаниите лесно да ве откријат."
              : "Пополнете го компанискиот профил додека ја прегледуваме сметката."
            : "Потребни се околу 2 минути. Секогаш можете да уредите подоцна."}
        </p>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-2 mb-10">
        {steps.map((label, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-all",
              i < step
                ? "bg-accent border-accent text-white"
                : i === step
                  ? "border-accent text-accent bg-accent/10"
                  : "border-border text-foreground-faint bg-surface"
            )}>
              {i < step ? <CheckCircle2 size={14} /> : i + 1}
            </div>
            {i < steps.length - 1 && (
              <div className={cn("w-8 h-0.5 rounded-full", i < step ? "bg-accent" : "bg-border")} />
            )}
          </div>
        ))}
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(saveAndFinish)}
          className="w-full max-w-lg"
        >
          <div className="bg-surface border border-border rounded-2xl shadow-card p-8 space-y-6">

            {/* ── STEP 0: Welcome ── */}
            {step === 0 && (
              <div className="space-y-6">
                <div className="flex justify-center mb-2">
                  <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                    {isStudent ? (
                      <GraduationCap size={32} className="text-accent" />
                    ) : (
                      <Building2 size={32} className="text-accent" />
                    )}
                  </div>
                </div>
                {isStudent && !user.is_verified_student && (
                  <div className="rounded-xl border border-accent/30 bg-accent/5 p-4">
                    <p className="text-sm font-medium text-foreground">Верификувајте со Microsoft за отклучување апликации</p>
                    <p className="text-xs text-foreground-muted mt-1">
                      Поврзете UKIM Microsoft сметка сега или завршете ја поставката и верификувајте подоцна од поставките.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      className="mt-3 bg-background border-border"
                      onClick={() => {
                        window.location.href = "/auth/verify-student";
                      }}
                    >
                      Верификувај со Microsoft
                    </Button>
                  </div>
                )}
                <FormField control={form.control} name="full_name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Вашето име</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Целосно име" className="bg-background border-border h-11" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="bio" render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center mb-1">
                      <FormLabel className="m-0">Кратко био</FormLabel>
                      <span className="text-xs text-foreground-faint">{field.value?.length || 0} / 200</span>
                    </div>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder={isStudent
                          ? "пр. студент на ФИНКИ трета година, заинтересиран за фронтенд развој..."
                          : "пр. Градиме алатки за програмери. Седиште во Скопје."
                        }
                        className="bg-background border-border resize-none h-24"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            )}

            {/* ── STEP 1 (Student): Academic Details ── */}
            {isStudent && step === 1 && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="faculty" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Факултет</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-background border-border">
                            <SelectValue placeholder="Избери" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="FINKI">FINKI</SelectItem>
                          <SelectItem value="FEIT">FEIT</SelectItem>
                          <SelectItem value="FCSE">FCSE</SelectItem>
                          <SelectItem value="Other">Друго</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="year_of_study" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Година</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-background border-border">
                            <SelectValue placeholder="Година" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {["1", "2", "3", "4", "5"].map(y => (
                            <SelectItem key={y} value={y}>Година {y}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="degree_type" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Тип на студии</FormLabel>
                    <FormControl>
                      <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-3">
                        {[
                          { val: "bachelor", label: "Дипломски" },
                          { val: "master", label: "Магистерски" },
                        ].map(d => (
                          <FormItem key={d.val} className="flex items-center gap-2 space-y-0 flex-1 bg-background border border-border px-4 py-3 rounded-lg cursor-pointer">
                            <FormControl><RadioGroupItem value={d.val} /></FormControl>
                            <FormLabel className="font-normal cursor-pointer">{d.label}</FormLabel>
                          </FormItem>
                        ))}
                      </RadioGroup>
                    </FormControl>
                  </FormItem>
                )} />
              </div>
            )}

            {/* ── STEP 2 (Student): Focus & Experience ── */}
            {isStudent && step === 2 && (
              <div className="space-y-5">
                <FormField control={form.control} name="focus_area" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Примарна област</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-background border-border">
                          <SelectValue placeholder="Избери област" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="frontend">Фронтенд</SelectItem>
                        <SelectItem value="backend">Бекенд</SelectItem>
                        <SelectItem value="fullstack">Фулстек</SelectItem>
                        <SelectItem value="mobile">Мобилен развој</SelectItem>
                        <SelectItem value="devops">DevOps</SelectItem>
                        <SelectItem value="data">Податоци</SelectItem>
                        <SelectItem value="other">Друго</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )} />

                <FormField control={form.control} name="experience_level" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ниво на искуство</FormLabel>
                    <FormControl>
                      <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-2 gap-3">
                        {[
                          { val: "no_experience", label: "Без искуство", desc: "Барам прва улога" },
                          { val: "junior", label: "Јуниор", desc: "0-2 години" },
                          { val: "mid", label: "Средно", desc: "2-4 години" },
                          { val: "senior", label: "Сениор", desc: "4+ години" },
                        ].map(lvl => (
                          <FormItem key={lvl.val} className="flex flex-col items-start space-y-0 bg-background border border-border p-4 rounded-lg cursor-pointer group">
                            <div className="flex items-center gap-2 mb-1">
                              <FormControl><RadioGroupItem value={lvl.val} /></FormControl>
                              <FormLabel className="font-medium cursor-pointer">{lvl.label}</FormLabel>
                            </div>
                            <span className="text-xs text-foreground-muted ml-6">{lvl.desc}</span>
                          </FormItem>
                        ))}
                      </RadioGroup>
                    </FormControl>
                  </FormItem>
                )} />
              </div>
            )}

            {/* ── STEP 3 (Student): Links ── */}
            {isStudent && step === 3 && (
              <div className="space-y-4">
                <p className="text-sm text-foreground-muted">Додајте профили за компаниите подобро да ве запознаат (опционално).</p>
                {[
                  { name: "github_url", label: "GitHub", placeholder: "https://github.com/you" },
                  { name: "linkedin_url", label: "LinkedIn", placeholder: "https://linkedin.com/in/you" },
                  { name: "portfolio_url", label: "Портфолио", placeholder: "https://your-site.com" },
                ].map(link => (
                  <FormField key={link.name} control={form.control} name={link.name as any} render={({ field }) => (
                    <FormItem>
                      <FormLabel>{link.label}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder={link.placeholder} className="bg-background border-border" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                ))}
              </div>
            )}

            {/* ── STEP 1 (Company): Company Info ── */}
            {!isStudent && step === 1 && (
              <div className="space-y-4">
                <FormField control={form.control} name="company_name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Име на компанија</FormLabel>
                    <FormControl><Input {...field} className="bg-background border-border h-11" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="company_description" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Со што се занимава вашата компанија?</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Краток опис..." className="bg-background border-border h-28 resize-none" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="industry" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Индустрија</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-background border-border"><SelectValue placeholder="Избери" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {[
                            { value: "technology", label: "Технологија" },
                            { value: "finance", label: "Финансии" },
                            { value: "healthcare", label: "Здравство" },
                            { value: "education", label: "Образование" },
                            { value: "retail", label: "Трговија" },
                            { value: "media", label: "Медиуми" },
                            { value: "other", label: "Друго" },
                          ].map((i) => (
                            <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="size_range" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Големина на компанија</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-background border-border"><SelectValue placeholder="Големина" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1-10">1-10 вработени</SelectItem>
                          <SelectItem value="11-50">11-50 вработени</SelectItem>
                          <SelectItem value="51-200">51-200 вработени</SelectItem>
                          <SelectItem value="201-1000">201-1000 вработени</SelectItem>
                          <SelectItem value="1000+">1000+ вработени</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="location" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Локација</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="пр. Скопје, Хибридно" className="bg-background border-border" />
                    </FormControl>
                  </FormItem>
                )} />
              </div>
            )}

            {/* ── STEP 2 (Company): Links ── */}
            {!isStudent && step === 2 && (
              <div className="space-y-4">
                <p className="text-sm text-foreground-muted">Помогнете им на студентите да дознаат повеќе за вашата компанија.</p>
                <FormField control={form.control} name="company_website" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Веб-страница на компанија</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://yourcompany.com" className="bg-background border-border" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            )}

          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-6">
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="text-sm text-foreground-muted hover:text-foreground underline underline-offset-4"
            >
              Прескокни засега
            </button>
            <div className="flex gap-3">
              {step > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(s => s - 1)}
                  className="bg-surface border-border"
                >
                  Назад
                </Button>
              )}
              {isLast ? (
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-accent hover:bg-accent-hover text-white font-medium px-8 gap-2"
                >
                  <Sparkles size={16} />
                  {saving ? "Се зачувува..." : "Заврши поставка"}
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={next}
                  className="bg-accent hover:bg-accent-hover text-white font-medium px-8 gap-2"
                >
                  Продолжи <ArrowRight size={16} />
                </Button>
              )}
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
