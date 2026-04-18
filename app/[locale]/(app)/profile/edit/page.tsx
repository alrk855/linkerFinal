"use client";

import { useState } from "react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FileUp, Link as LinkIcon, Github, Linkedin, Globe } from "lucide-react";

const profileSchema = z.object({
  full_name: z.string().min(2, "Full name is required"),
  username: z.string(),
  bio: z.string().max(200, "Bio max 200 characters").optional(),
  phone: z.string().optional(),
  
  // Student fields
  faculty: z.string().optional(),
  year_of_study: z.string().optional(),
  degree_type: z.string().optional(),
  graduation_year: z.string().optional(),
  experience_level: z.string().optional(),
  focus_area: z.string().optional(),
  
  // Company fields
  company_name: z.string().optional(),
  company_description: z.string().optional(),
  industry: z.string().optional(),
  size_range: z.string().optional(),
  location: z.string().optional(),

  // Links
  github_url: z.string().url().optional().or(z.literal("")),
  linkedin_url: z.string().url().optional().or(z.literal("")),
  portfolio_url: z.string().url().optional().or(z.literal("")),
  website_url: z.string().url().optional().or(z.literal("")),
});

export default function ProfileEditPage() {
  const { user, isLoading } = useAuth();
  const [activeSection, setActiveSection] = useState("basic");
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: user?.full_name || "",
      username: user?.username || "",
      bio: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof profileSchema>) => {
    setLoading(true);
    try {
      // Mock API call to PATCH /api/profile/me
      const res = await fetch("/api/profile/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) throw new Error("Failed to save profile");

      toast.success("Profile saved successfully.");
    } catch (e) {
      toast.error("Failed to save profile.");
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || !user) {
    return <div className="p-8">Loading...</div>;
  }

  const isStudent = user.role === "student";

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto px-4 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
      
      {/* Left Sidebar */}
      <div className="w-full lg:w-80 shrink-0">
        <div className="sticky top-24">
          <ProfileSidebar 
            activeSection={activeSection} 
            onSectionSelect={setActiveSection} 
          />
        </div>
      </div>

      {/* Right Content */}
      <div className="flex-1 flex flex-col min-w-0 pb-24">
        <PageHeader title="Edit Profile" description="Update your information here." className="pt-0 mt-0" />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Basic Information */}
            <div className={activeSection === "basic" ? "block" : "hidden"}>
              <h2 className="text-xl font-medium mb-6">Basic Information</h2>
              <div className="space-y-4 max-w-2xl">
                <FormField control={form.control} name="full_name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full name</FormLabel>
                    <FormControl><Input {...field} className="bg-background border-border" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="username" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl><Input {...field} disabled className="bg-surface-raised border-border text-foreground-muted" /></FormControl>
                    <p className="text-xs text-foreground-faint">Change username in account settings.</p>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="bio" render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center mb-1">
                      <FormLabel className="m-0">Bio</FormLabel>
                      <span className="text-xs text-foreground-faint">{field.value?.length || 0} / 200</span>
                    </div>
                    <FormControl>
                      <Textarea {...field} className="bg-background border-border resize-none h-24" placeholder="Tell us a bit about yourself..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone number</FormLabel>
                    <FormControl><Input {...field} type="tel" className="bg-background border-border" placeholder="+389..." /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </div>

            {/* Academic Details (Student) */}
            {isStudent && (
              <div className={activeSection === "academic" ? "block animate-in fade-in" : "hidden"}>
                <h2 className="text-xl font-medium mb-6">Academic Details</h2>
                <div className="space-y-6 max-w-2xl">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormItem>
                      <FormLabel>University</FormLabel>
                      <Input value="UKIM" disabled className="bg-surface-raised border-border text-foreground-muted" />
                    </FormItem>
                    <FormField control={form.control} name="faculty" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Faculty</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-background border-border"><SelectValue placeholder="Select faculty" /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="finki">FINKI</SelectItem>
                            <SelectItem value="feit">FEIT</SelectItem>
                            <SelectItem value="mashinski">Mechanical Engineering</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <FormField control={form.control} name="degree_type" render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Degree type</FormLabel>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-4">
                          <FormItem className="flex items-center space-x-2 space-y-0 bg-surface border border-border px-4 py-3 rounded-md w-full">
                            <FormControl><RadioGroupItem value="bachelor" /></FormControl>
                            <FormLabel className="font-normal cursor-pointer w-full">Bachelor</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0 bg-surface border border-border px-4 py-3 rounded-md w-full">
                            <FormControl><RadioGroupItem value="master" /></FormControl>
                            <FormLabel className="font-normal cursor-pointer w-full">Master</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="experience_level" render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Experience level</FormLabel>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {[
                            { val: "none", title: "No experience", desc: "Looking for first internship." },
                            { val: "junior", title: "Junior", desc: "0-2 years of experience." },
                            { val: "mid", title: "Mid-level", desc: "2-4 years of experience." },
                            { val: "senior", title: "Senior", desc: "4+ years of experience." }
                          ].map(lvl => (
                            <FormItem key={lvl.val} className="flex flex-col items-start bg-surface border border-border p-4 rounded-lg hover:border-accent group transition-colors">
                              <div className="flex items-center gap-2 mb-1">
                                <FormControl><RadioGroupItem value={lvl.val} /></FormControl>
                                <FormLabel className="font-medium cursor-pointer">{lvl.title}</FormLabel>
                              </div>
                              <span className="text-xs text-foreground-muted ml-6">{lvl.desc}</span>
                            </FormItem>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>
            )}

            {/* Company Info (Company) */}
            {!isStudent && (
              <div className={activeSection === "company" ? "block animate-in fade-in" : "hidden"}>
                <h2 className="text-xl font-medium mb-6">Company Information</h2>
                <div className="space-y-4 max-w-2xl">
                  <FormField control={form.control} name="company_name" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company name</FormLabel>
                      <FormControl><Input {...field} className="bg-background border-border" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="company_description" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl><Textarea {...field} className="bg-background border-border h-32" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>
            )}

            {/* Links */}
            <div className={activeSection === "links" ? "block animate-in fade-in" : "hidden"}>
              <h2 className="text-xl font-medium mb-6">External Links</h2>
              <div className="space-y-4 max-w-2xl">
                <FormField control={form.control} name="github_url" render={({ field }) => (
                  <FormItem>
                    <FormLabel>GitHub</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Github className="absolute left-3 top-2.5 h-4 w-4 text-foreground-muted" />
                        <Input {...field} className="pl-9 bg-background border-border" placeholder="https://github.com/..." />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="linkedin_url" render={({ field }) => (
                  <FormItem>
                    <FormLabel>LinkedIn</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Linkedin className="absolute left-3 top-2.5 h-4 w-4 text-foreground-muted" />
                        <Input {...field} className="pl-9 bg-background border-border" placeholder="https://linkedin.com/in/..." />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="portfolio_url" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Portfolio</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Globe className="absolute left-3 top-2.5 h-4 w-4 text-foreground-muted" />
                        <Input {...field} className="pl-9 bg-background border-border" placeholder="https://..." />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </div>

            {/* Documents */}
            {isStudent && (
              <div className={activeSection === "documents" ? "block animate-in fade-in" : "hidden"}>
                <h2 className="text-xl font-medium mb-6">Documents</h2>
                <div className="max-w-2xl">
                  <div className="border-2 border-dashed border-border hover:border-accent-subtle rounded-xl p-12 flex flex-col items-center justify-center text-center transition-colors bg-surface/50">
                    <FileUp size={32} className="text-foreground-muted mb-4" />
                    <h4 className="font-medium text-foreground mb-1">Upload your CV</h4>
                    <p className="text-sm text-foreground-muted mb-4">PDF files only, max 10MB.</p>
                    <Button type="button" variant="outline" className="bg-surface hover:bg-surface-raised border-border">Browse files</Button>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom sticky bar */}
            <div className="fixed bottom-0 right-0 left-0 lg:left-80 p-4 bg-background/90 backdrop-blur border-t border-border z-20 flex justify-end px-4 lg:px-12">
              <div className="w-full max-w-2xl flex justify-end gap-3">
                <Button type="button" variant="outline" className="bg-surface hover:bg-surface-raised border-border">
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="bg-accent hover:bg-accent-hover text-background font-medium px-8">
                  {loading ? "..." : "Save Profile"}
                </Button>
              </div>
            </div>

          </form>
        </Form>
      </div>
    </div>
  );
}
