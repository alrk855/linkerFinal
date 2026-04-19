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
  full_name: z.string().min(2, "Full name required"),
  bio: z.string().max(200).optional(),
  faculty: z.string().optional(),
  degree_type: z.string().optional(),
  year_of_study: z.string().optional(),
  experience_level: z.string().optional(),
  focus_area: z.string().optional(),
  github_url: z.string().url().optional().or(z.literal("")),
  linkedin_url: z.string().url().optional().or(z.literal("")),
  portfolio_url: z.string().url().optional().or(z.literal("")),
});

const companySchema = z.object({
  full_name: z.string().min(2, "Contact name required"),
  company_name: z.string().min(2, "Company name required"),
  company_description: z.string().max(400).optional(),
  industry: z.string().optional(),
  size_range: z.string().optional(),
  location: z.string().optional(),
  website_url: z.string().url().optional().or(z.literal("")),
});

const STUDENT_STEPS = ["Welcome", "Academic", "Focus & Skills", "Links"];
const COMPANY_STEPS = ["Welcome", "Company Info", "Presence"];

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
      experience_level: "none",
      focus_area: "",
      github_url: "",
      linkedin_url: "",
      portfolio_url: "",
      company_name: "",
      company_description: "",
      industry: "",
      size_range: "",
      location: "",
      website_url: "",
    },
  });

  useEffect(() => {
    if (user?.full_name) {
      form.setValue("full_name", user.full_name);
    }
  }, [user]);

  const saveAndFinish = async (values: any) => {
    setSaving(true);
    try {
      const res = await fetch("/api/profile/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("Failed to save");
      toast.success("Profile saved! Welcome to Linker.");
      router.push("/dashboard");
    } catch {
      toast.error("Could not save profile. You can update it later.");
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
            Student identity verified!
          </div>
        )}
        <h1 className="text-3xl font-semibold tracking-tight text-foreground mb-2">
          {step === 0 ? "Welcome to Linker" : `Set up your ${isStudent ? "student" : "company"} profile`}
        </h1>
        <p className="text-foreground-muted">
          {step === 0
            ? isStudent
              ? "Let's get your profile ready so companies can discover you."
              : "Complete your company profile while we review your account."
            : "This takes about 2 minutes. You can always edit later."}
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
                <FormField control={form.control} name="full_name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Full name" className="bg-background border-border h-11" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="bio" render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center mb-1">
                      <FormLabel className="m-0">Short bio</FormLabel>
                      <span className="text-xs text-foreground-faint">{field.value?.length || 0} / 200</span>
                    </div>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder={isStudent
                          ? "e.g. 3rd year FINKI student passionate about frontend development..."
                          : "e.g. We build tools for developers. Based in Skopje."
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
                      <FormLabel>Faculty</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-background border-border">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="finki">FINKI</SelectItem>
                          <SelectItem value="feit">FEIT</SelectItem>
                          <SelectItem value="mashinski">Mechanical Eng.</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="year_of_study" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-background border-border">
                            <SelectValue placeholder="Year" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {["1", "2", "3", "4", "5"].map(y => (
                            <SelectItem key={y} value={y}>Year {y}</SelectItem>
                          ))}
                          <SelectItem value="graduated">Graduated</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="degree_type" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Degree type</FormLabel>
                    <FormControl>
                      <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-3">
                        {[
                          { val: "bachelor", label: "Bachelor" },
                          { val: "master", label: "Master" },
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
                    <FormLabel>Primary focus area</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-background border-border">
                          <SelectValue placeholder="Select your focus" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {["Frontend", "Backend", "Fullstack", "Mobile", "DevOps", "Data", "Security", "Other"].map(f => (
                          <SelectItem key={f} value={f}>{f}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )} />

                <FormField control={form.control} name="experience_level" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Experience level</FormLabel>
                    <FormControl>
                      <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-2 gap-3">
                        {[
                          { val: "none", label: "No experience", desc: "Looking for first role" },
                          { val: "junior", label: "Junior", desc: "0–2 years" },
                          { val: "mid", label: "Mid-level", desc: "2–4 years" },
                          { val: "senior", label: "Senior", desc: "4+ years" },
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
                <p className="text-sm text-foreground-muted">Add your profiles so companies can learn more about you (optional).</p>
                {[
                  { name: "github_url", label: "GitHub", placeholder: "https://github.com/you" },
                  { name: "linkedin_url", label: "LinkedIn", placeholder: "https://linkedin.com/in/you" },
                  { name: "portfolio_url", label: "Portfolio", placeholder: "https://yoursite.com" },
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
                    <FormLabel>Company name</FormLabel>
                    <FormControl><Input {...field} className="bg-background border-border h-11" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="company_description" render={({ field }) => (
                  <FormItem>
                    <FormLabel>What does your company do?</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Brief description..." className="bg-background border-border h-28 resize-none" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="industry" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Industry</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-background border-border"><SelectValue placeholder="Select" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {["Technology", "Finance", "Healthcare", "Education", "Retail", "Media", "Other"].map(i => (
                            <SelectItem key={i} value={i.toLowerCase()}>{i}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="size_range" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company size</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-background border-border"><SelectValue placeholder="Size" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {["1–10", "11–50", "51–200", "201–500", "500+"].map(s => (
                            <SelectItem key={s} value={s}>{s} employees</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="location" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. Skopje, Hybrid" className="bg-background border-border" />
                    </FormControl>
                  </FormItem>
                )} />
              </div>
            )}

            {/* ── STEP 2 (Company): Links ── */}
            {!isStudent && step === 2 && (
              <div className="space-y-4">
                <p className="text-sm text-foreground-muted">Help students learn about your company.</p>
                <FormField control={form.control} name="website_url" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company website</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://yourcompany.com" className="bg-background border-border" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="linkedin_url" render={({ field }) => (
                  <FormItem>
                    <FormLabel>LinkedIn page</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://linkedin.com/company/..." className="bg-background border-border" />
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
              Skip for now
            </button>
            <div className="flex gap-3">
              {step > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(s => s - 1)}
                  className="bg-surface border-border"
                >
                  Back
                </Button>
              )}
              {isLast ? (
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-accent hover:bg-accent-hover text-white font-medium px-8 gap-2"
                >
                  <Sparkles size={16} />
                  {saving ? "Saving..." : "Finish setup"}
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={next}
                  className="bg-accent hover:bg-accent-hover text-white font-medium px-8 gap-2"
                >
                  Continue <ArrowRight size={16} />
                </Button>
              )}
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
