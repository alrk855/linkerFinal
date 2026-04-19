"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ProfileSidebar } from "@/components/layout/sidebar";
import { PageHeader } from "@/components/ui/page-header";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

type SkillCategory = {
  id: string;
  name: string;
  slug: string;
  skills: Array<{ id: string; name: string; slug: string }>;
};

const profileSchema = z.object({
  full_name: z.string().min(2, "Задолжително е целосно име"),
  username: z.string(),
  bio: z.string().max(200, "Био максимум 200 карактери").optional(),
  phone: z.string().optional(),
  faculty: z.string().optional(),
  year_of_study: z.string().optional(),
  degree_type: z.string().optional(),
  graduation_year: z.string().optional(),
  experience_level: z.string().optional(),
  focus_area: z.string().optional(),
  company_name: z.string().optional(),
  company_description: z.string().optional(),
  company_website: z.string().url().optional().or(z.literal("")),
  industry: z.string().optional(),
  size_range: z.string().optional(),
  location: z.string().optional(),
  github_url: z.string().url().optional().or(z.literal("")),
  linkedin_url: z.string().url().optional().or(z.literal("")),
  portfolio_url: z.string().url().optional().or(z.literal("")),
  website_url: z.string().url().optional().or(z.literal("")),
});

const DEGREE_OPTIONS = [
  { value: "bachelor", label: "Дипломски" },
  { value: "master", label: "Магистерски" },
  { value: "phd", label: "PhD" },
];

const EXPERIENCE_OPTIONS = [
  { value: "no_experience", label: "Без искуство" },
  { value: "junior", label: "Јуниор" },
  { value: "mid", label: "Средно" },
  { value: "senior", label: "Сениор" },
];

const FOCUS_OPTIONS = [
  { value: "frontend", label: "Фронтенд" },
  { value: "backend", label: "Бекенд" },
  { value: "fullstack", label: "Фулстек" },
  { value: "mobile", label: "Мобилен развој" },
  { value: "devops", label: "DevOps" },
  { value: "data", label: "Податоци" },
  { value: "other", label: "Друго" },
];

const SIZE_OPTIONS = ["1-10", "11-50", "51-200", "201-1000", "1000+"];

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

export default function ProfileEditPage() {
  const { user, isLoading } = useAuth();
  const [activeSection, setActiveSection] = useState("basic");
  const [saving, setSaving] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [skillsLoading, setSkillsLoading] = useState(false);
  const [skillCategories, setSkillCategories] = useState<SkillCategory[]>([]);
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: "",
      username: "",
      bio: "",
      phone: "",
      faculty: "",
      year_of_study: "",
      degree_type: "",
      graduation_year: "",
      experience_level: "",
      focus_area: "",
      company_name: "",
      company_description: "",
      company_website: "",
      industry: "",
      size_range: "",
      location: "",
      github_url: "",
      linkedin_url: "",
      portfolio_url: "",
      website_url: "",
    },
  });

  const isStudent = user?.role === "student";

  useEffect(() => {
    async function loadProfile() {
      try {
        setProfileLoading(true);
        const res = await fetch("/api/profile/me");
        if (!res.ok) {
          throw new Error("Неуспешно вчитување профил");
        }

        const data = await res.json();
        const p = data.profile || {};
        const sp = p.student_profile || {};
        const cp = p.company_profile || {};
        const studentSkills = Array.isArray(p.student_skills) ? p.student_skills : [];

        form.reset({
          full_name: p.full_name || "",
          username: p.username || "",
          bio: p.bio || "",
          phone: p.phone || "",
          faculty: sp.faculty || "",
          year_of_study: sp.year_of_study ? String(sp.year_of_study) : "",
          degree_type: sp.degree_type || "",
          graduation_year: sp.graduation_year ? String(sp.graduation_year) : "",
          experience_level: sp.experience_level || "",
          focus_area: sp.focus_area || "",
          company_name: cp.company_name || "",
          company_description: cp.company_description || "",
          company_website: cp.company_website || "",
          industry: cp.industry || "",
          size_range: cp.size_range || "",
          location: cp.location || "",
          github_url: p.github_url || "",
          linkedin_url: p.linkedin_url || "",
          portfolio_url: p.portfolio_url || "",
          website_url: p.website_url || "",
        });

        setSelectedSkillIds(
          studentSkills
            .map((s: any) => s.skill_id || s.skills?.id)
            .filter(Boolean)
        );
      } catch {
        toast.error("Неуспешно вчитување профил.");
      } finally {
        setProfileLoading(false);
      }
    }

    async function loadSkillsCatalog() {
      try {
        setSkillsLoading(true);
        const res = await fetch("/api/skills");
        if (!res.ok) {
          throw new Error("Неуспешно вчитување вештини");
        }
        const data = await res.json();
        setSkillCategories(Array.isArray(data.categories) ? data.categories : []);
      } catch {
        toast.error("Неуспешно вчитување каталог на вештини.");
      } finally {
        setSkillsLoading(false);
      }
    }

    if (!isLoading && user) {
      loadProfile();
      if (user.role === "student") {
        loadSkillsCatalog();
      }
    }
  }, [isLoading, user, form]);

  const selectedSkillCount = useMemo(() => selectedSkillIds.length, [selectedSkillIds]);

  function toggleSkill(skillId: string) {
    setSelectedSkillIds((prev) => {
      if (prev.includes(skillId)) {
        return prev.filter((id) => id !== skillId);
      }

      if (prev.length >= 20) {
        toast.error("Може да изберете најмногу 20 вештини.");
        return prev;
      }

      return [...prev, skillId];
    });
  }

  async function onSubmit(values: z.infer<typeof profileSchema>) {
    setSaving(true);
    let profileSaved = false;
     try {
      const payload: Record<string, unknown> = {
        full_name: values.full_name.trim(),
        bio: asOptionalString(values.bio),
        phone: asOptionalString(values.phone),
        github_url: asOptionalString(values.github_url),
        linkedin_url: asOptionalString(values.linkedin_url),
        portfolio_url: asOptionalString(values.portfolio_url),
        website_url: asOptionalString(values.website_url),
      };

      if (isStudent) {
        payload.faculty = asOptionalString(values.faculty);
        payload.year_of_study = asOptionalNumber(values.year_of_study);
        payload.degree_type = asOptionalString(values.degree_type);
        payload.graduation_year = asOptionalNumber(values.graduation_year);
        payload.experience_level = asOptionalString(values.experience_level);
        payload.focus_area = asOptionalString(values.focus_area);
        payload.short_description = asOptionalString(values.bio);
      } else {
        payload.company_name = asOptionalString(values.company_name);
        payload.company_description = asOptionalString(values.company_description);
        payload.company_website = asOptionalString(values.company_website);
        payload.industry = asOptionalString(values.industry);
        payload.size_range = asOptionalString(values.size_range);
        payload.location = asOptionalString(values.location);
      }

      const profileRes = await fetch("/api/profile/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!profileRes.ok) {
        const body = await profileRes.json().catch(() => null);
        throw new Error(body?.error?.message || "Неуспешно зачувување профил.");
      }
      profileSaved = true;

      if (isStudent) {
        if (!user?.is_verified_student) {
          toast.info("Профилот е зачуван. Верификувајте студентска сметка за управување со вештини.");
        } else {
          const skillsRes = await fetch("/api/profile/skills", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ skill_ids: selectedSkillIds }),
          });

          if (!skillsRes.ok) {
            const body = await skillsRes.json().catch(() => null);
            throw new Error(body?.error?.message || "Неуспешно зачувување вештини.");
          }
        }
      }

      toast.success("Профилот е успешно зачуван.");
    } catch (error: any) {
      if (profileSaved) {
        toast.error("Деталите за профилот се зачувани, но еден дел не се синхронизираше.");
      }
      toast.error(error?.message || "Неуспешно зачувување профил.");
    } finally {
      setSaving(false);
    }
  }

  if (isLoading || profileLoading || !user) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-accent border-r-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto px-4 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
      <div className="w-full lg:w-80 shrink-0">
        <div className="sticky top-24">
          <ProfileSidebar activeSection={activeSection} onSectionSelect={setActiveSection} />
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0 pb-24">
        <PageHeader title="Уреди профил" description="Ажурирајте ги вашите информации." className="pt-0 mt-0" />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className={activeSection === "basic" ? "block" : "hidden"}>
              <h2 className="text-xl font-medium mb-6">Основни информации</h2>
              <div className="space-y-4 max-w-2xl">
                <FormField control={form.control} name="full_name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Целосно име</FormLabel>
                    <FormControl><Input {...field} className="bg-background border-border" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="username" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Корисничко име</FormLabel>
                    <FormControl><Input {...field} disabled className="bg-surface-raised border-border text-foreground-muted" /></FormControl>
                    <p className="text-xs text-foreground-faint">Корисничкото име е управувано од системот.</p>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="bio" render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center mb-1">
                      <FormLabel className="m-0">Био</FormLabel>
                      <span className="text-xs text-foreground-faint">{field.value?.length || 0} / 200</span>
                    </div>
                    <FormControl>
                      <Textarea {...field} className="bg-background border-border resize-none h-24" placeholder="Кажете ни нешто за вас..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Телефонски број</FormLabel>
                    <FormControl><Input {...field} type="tel" className="bg-background border-border" placeholder="+389..." /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </div>

            {isStudent && (
              <div className={activeSection === "academic" ? "block" : "hidden"}>
                <h2 className="text-xl font-medium mb-6">Академски детали</h2>
                <div className="space-y-4 max-w-2xl">
                  <FormField control={form.control} name="faculty" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Факултет</FormLabel>
                      <FormControl><Input {...field} className="bg-background border-border" placeholder="ФИНКИ / ФЕИТ / ПМФ" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField control={form.control} name="year_of_study" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Година на студии</FormLabel>
                        <FormControl><Input {...field} type="number" min={1} max={7} className="bg-background border-border" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="graduation_year" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Година на дипломирање</FormLabel>
                        <FormControl><Input {...field} type="number" min={2000} max={2100} className="bg-background border-border" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <FormField control={form.control} name="degree_type" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Тип на студии</FormLabel>
                        <Select value={field.value || ""} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className="bg-background border-border"><SelectValue placeholder="Избери" /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {DEGREE_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="experience_level" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Искуство</FormLabel>
                        <Select value={field.value || ""} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className="bg-background border-border"><SelectValue placeholder="Избери" /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {EXPERIENCE_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="focus_area" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Област</FormLabel>
                        <Select value={field.value || ""} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className="bg-background border-border"><SelectValue placeholder="Избери" /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {FOCUS_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </div>
              </div>
            )}

            {isStudent && (
              <div className={activeSection === "skills" ? "block" : "hidden"}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-medium">Вештини</h2>
                  <span className="text-sm text-foreground-muted">{selectedSkillCount} / 20 избрани</span>
                </div>

                {!user.is_verified_student ? (
                  <div className="max-w-2xl rounded-xl border border-warning/30 bg-warning/10 p-4 text-sm text-foreground">
                    Верификувајте ја студентската сметка со Microsoft за ажурирање вештини.
                    <div className="mt-3">
                      <Button type="button" variant="outline" className="bg-background border-border" onClick={() => { window.location.href = "/auth/verify-student"; }}>
                        Поврзи Microsoft сметка
                      </Button>
                    </div>
                  </div>
                ) : skillsLoading ? (
                  <div className="max-w-2xl h-28 bg-surface-raised rounded-xl animate-pulse" />
                ) : (
                  <div className="max-w-2xl space-y-6">
                    {skillCategories.map((category) => (
                      <div key={category.id} className="rounded-xl border border-border bg-surface p-4">
                        <h3 className="font-medium mb-3">{category.name}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {category.skills.map((skill) => (
                            <div key={skill.id} className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-surface-raised">
                              <Checkbox id={`skill-${skill.id}`} checked={selectedSkillIds.includes(skill.id)} onCheckedChange={() => toggleSkill(skill.id)} />
                              <Label htmlFor={`skill-${skill.id}`} className="cursor-pointer text-sm font-normal">{skill.name}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {!isStudent && (
              <div className={activeSection === "company" ? "block" : "hidden"}>
                <h2 className="text-xl font-medium mb-6">Информации за компанија</h2>
                <div className="space-y-4 max-w-2xl">
                  <FormField control={form.control} name="company_name" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Име на компанија</FormLabel>
                      <FormControl><Input {...field} className="bg-background border-border" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="company_description" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Опис</FormLabel>
                      <FormControl><Textarea {...field} className="bg-background border-border h-32 resize-none" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="industry" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Индустрија</FormLabel>
                      <FormControl><Input {...field} className="bg-background border-border" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField control={form.control} name="size_range" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Големина на компанија</FormLabel>
                        <Select value={field.value || ""} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className="bg-background border-border"><SelectValue placeholder="Избери" /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {SIZE_OPTIONS.map((option) => (
                              <SelectItem key={option} value={option}>{option}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="location" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Локација</FormLabel>
                        <FormControl><Input {...field} className="bg-background border-border" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <FormField control={form.control} name="company_website" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Веб-страница на компанија</FormLabel>
                      <FormControl><Input {...field} className="bg-background border-border" placeholder="https://" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>
            )}

            <div className={activeSection === "links" ? "block" : "hidden"}>
              <h2 className="text-xl font-medium mb-6">Надворешни линкови</h2>
              <div className="space-y-4 max-w-2xl">
                <FormField control={form.control} name="github_url" render={({ field }) => (
                  <FormItem>
                    <FormLabel>GitHub</FormLabel>
                    <FormControl><Input {...field} className="bg-background border-border" placeholder="https://github.com/..." /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="linkedin_url" render={({ field }) => (
                  <FormItem>
                    <FormLabel>LinkedIn</FormLabel>
                    <FormControl><Input {...field} className="bg-background border-border" placeholder="https://linkedin.com/in/..." /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="portfolio_url" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Портфолио</FormLabel>
                    <FormControl><Input {...field} className="bg-background border-border" placeholder="https://..." /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="website_url" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Лична веб-страница</FormLabel>
                    <FormControl><Input {...field} className="bg-background border-border" placeholder="https://..." /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </div>

            {isStudent && (
              <div className={activeSection === "documents" ? "block" : "hidden"}>
                <h2 className="text-xl font-medium mb-6">Документи</h2>
                <div className="max-w-2xl rounded-xl border border-border bg-surface p-6 text-sm text-foreground-muted">
                  Прикачувањето CV се управува одделно и ќе се појави тука.
                </div>
              </div>
            )}

            <div className="fixed bottom-0 right-0 left-0 lg:left-80 p-4 bg-background/90 backdrop-blur border-t border-border z-20 flex justify-end px-4 lg:px-12">
              <div className="w-full max-w-2xl flex justify-end gap-3">
                <Button type="button" variant="outline" className="bg-surface hover:bg-surface-raised border-border" onClick={() => window.history.back()}>
                  Откажи
                </Button>
                <Button type="submit" disabled={saving} className="bg-accent hover:bg-accent-hover text-background font-medium px-8">
                  {saving ? "Се зачувува..." : "Зачувај профил"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
