"use client";

import { useTranslations } from "next-intl";
import { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Building2, GraduationCap } from "lucide-react";

// Schemas
const studentSchema = z.object({
  fullName: z.string().min(2, "Full name required"),
  username: z.string().min(3, "Username must be at least 3 characters").regex(/^[a-zA-Z0-9_]+$/, "Alphanumeric and underscores only"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const companySchema = z.object({
  companyName: z.string().min(2, "Company name required"),
  contactName: z.string().min(2, "Contact name required"),
  username: z.string().min(3, "Username must be at least 3 characters").regex(/^[a-zA-Z0-9_]+$/, "Alphanumeric and underscores only"),
  email: z.string().email("Invalid email address"),
  website: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

function SignupFormContent() {
  const t = useTranslations("Auth");
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const queryRole = searchParams.get("role");
  const [role, setRole] = useState<"student" | "company" | null>(
    queryRole === "student" || queryRole === "company" ? queryRole : null
  );

  const formSchema = role === "student" ? studentSchema : companySchema;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: role === "student" ? {
      fullName: "", username: "", email: "", password: "", confirmPassword: ""
    } : {
      companyName: "", contactName: "", username: "", email: "", website: "", password: "", confirmPassword: ""
    },
  });

  const onSubmit = async (values: any) => {
    try {
      // Mocking submission to /api/auth/signup
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, role }),
      });
      if (!res.ok) throw new Error("Failed to sign up");
      toast.success("Account created successfully");
      
      // Post-signup redirection
      if (role === "student") {
        router.push("/auth/verify-student");
      } else {
        router.push("/dashboard");
      }
    } catch {
      toast.error("Signup failed");
    }
  };

  return (
    <Card className="w-full max-w-md bg-surface border-border shadow-md rounded-xl my-12">
      <CardHeader className="space-y-1 pb-6 text-center">
        <CardTitle className="text-2xl font-semibold tracking-tight text-foreground">
          {t("join_linker")}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {/* Step 1: Role Selection */}
        {!role ? (
          <div className="space-y-4">
            <button
              onClick={() => setRole("student")}
              className="w-full text-left p-4 rounded-xl border border-border hover:border-accent hover:bg-surface-raised transition-all flex items-start gap-4"
            >
              <div className="bg-background border border-border p-3 rounded-lg shrink-0">
                <GraduationCap className="text-foreground" size={24} />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-lg">{t("i_am_student")}</span>
                <span className="text-sm text-foreground-muted">{t("i_am_student_desc")}</span>
              </div>
            </button>
            <button
              onClick={() => setRole("company")}
              className="w-full text-left p-4 rounded-xl border border-border hover:border-accent hover:bg-surface-raised transition-all flex items-start gap-4"
            >
              <div className="bg-background border border-border p-3 rounded-lg shrink-0">
                <Building2 className="text-foreground" size={24} />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-lg">{t("i_am_company")}</span>
                <span className="text-sm text-foreground-muted">{t("i_am_company_desc")}</span>
              </div>
            </button>
          </div>
        ) : (
          /* Step 2: Form Rendering */
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              
              {/* Common Student fields */}
              {role === "student" && (
                <FormField control={form.control} name="fullName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("full_name")}</FormLabel>
                    <FormControl><Input {...field} className="bg-background text-foreground border-border" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              )}
              
              {/* Common Company fields */}
              {role === "company" && (
                <>
                  <FormField control={form.control} name="companyName" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("company_name")}</FormLabel>
                      <FormControl><Input {...field} className="bg-background border-border" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="contactName" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("your_name")}</FormLabel>
                      <FormControl><Input {...field} className="bg-background border-border" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </>
              )}

              {/* Shared specific fields */}
              <FormField control={form.control} name="username" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("username")}</FormLabel>
                  <FormControl><Input {...field} className="bg-background font-mono border-border" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>{role === "company" ? t("official_email") : t("email")}</FormLabel>
                  <FormControl><Input {...field} type="email" className="bg-background border-border" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {role === "company" && (
                <FormField control={form.control} name="website" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("website")} (Optional)</FormLabel>
                    <FormControl><Input {...field} type="url" placeholder="https://" className="bg-background border-border" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              )}

              {/* Passwords */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField control={form.control} name="password" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("password")}</FormLabel>
                    <FormControl><Input type="password" {...field} className="bg-background border-border" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("confirm_password")}</FormLabel>
                    <FormControl><Input type="password" {...field} className="bg-background border-border" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="pt-2 flex gap-3">
                <Button type="button" variant="outline" className="w-full bg-surface" onClick={() => setRole(null)}>
                  Back
                </Button>
                <Button type="submit" className="w-full bg-accent hover:bg-accent-hover text-background">
                  {t("continue")}
                </Button>
              </div>
            </form>
          </Form>
        )}

        {/* OAuth Buttons shown dynamically */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-surface px-2 text-foreground-muted">{t("or") || "or"}</span>
          </div>
        </div>
        <Button variant="outline" type="button" className="w-full border-border bg-surface hover:bg-surface-raised text-foreground transition-colors" onClick={() => {
            window.location.href = `/api/auth/google${role ? `?role=${role}` : ""}`;
        }}>
          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          {t("continue_with_google")}
        </Button>
      </CardContent>
      <CardFooter className="flex justify-center pb-6 border-t border-border-subtle pt-6">
        <Link href="/auth/signin" className="text-sm text-foreground-muted hover:text-foreground transition-colors underline underline-offset-4">
          Already registered? Sign in
        </Link>
      </CardFooter>
    </Card>
  );
}

export default function SignUpPage() {
  return (
    <div className="flex-1 flex items-center justify-center bg-background px-4">
      <Suspense fallback={<div className="flex-1 flex items-center justify-center p-12"><div className="w-8 h-8 rounded-full border-2 border-accent border-r-transparent animate-spin"/></div>}>
        <SignupFormContent />
      </Suspense>
    </div>
  );
}
