"use client";

import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";

const signInSchema = z.object({
  identifier: z.string().min(3, "Too short"),
  password: z.string().min(1, "Password is required"),
});

export default function SignInPage() {
  const t = useTranslations("Auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const oauthError = searchParams.get("error");
  const oauthReason = searchParams.get("reason");

  useEffect(() => {
    if (!oauthError) return;

    const fallbackMessage = "Sign-in failed. Please try again.";
    const knownMessages: Record<string, string> = {
      missing_code: "Sign-in callback was incomplete.",
      exchange_exception: "OAuth session exchange failed.",
      oauth_exchange_failed: "OAuth provider rejected the callback.",
      oauth_init_failed: "Unable to start OAuth sign-in.",
    };

    const base = knownMessages[oauthError] || fallbackMessage;
    const detail = oauthReason ? ` ${oauthReason}` : "";
    toast.error(`${base}${detail}`.trim());
  }, [oauthError, oauthReason]);

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof signInSchema>) {
    setLoading(true);
    try {
      // Typically we'd call /api/auth/signin here, however I'll stub it
      // Let's assume there is a fetch here to the backend agent's api routes
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error?.message || "Invalid credentials");
      }

      toast.success("Signed in successfully.");
      // Hard refresh to ensure cookies from the response are picked up
      // before navigating to the protected route
      router.refresh();
      window.location.href = "/profile/edit";
    } catch (error) {
      toast.error("Failed to sign in. Please check your credentials.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-sm bg-surface border-border shadow-md rounded-xl">
        <CardHeader className="space-y-1 pb-6">
          <CardTitle className="text-2xl font-semibold tracking-tight text-center">
            {t("signin")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="identifier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("email_username")}</FormLabel>
                    <FormControl>
                      <Input placeholder="name@example.com" {...field} className="bg-background border-border focus-visible:ring-accent" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>{t("password")}</FormLabel>
                      <Link href="/auth/reset" className="text-xs font-medium text-accent hover:text-accent-hover transition-colors">
                        {t("forgot_pass")}
                      </Link>
                    </div>
                    <FormControl>
                      <Input type="password" {...field} className="bg-background border-border focus-visible:ring-accent" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={loading} className="w-full bg-accent hover:bg-accent-hover text-background font-medium mt-2">
                {loading ? "..." : t("signin")}
              </Button>
            </form>
          </Form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-surface px-2 text-foreground-muted">{t("or") || "or"}</span>
            </div>
          </div>

          <Button variant="outline" type="button" className="w-full bg-surface hover:bg-surface-raised border border-border text-foreground transition-colors" onClick={() => {
              // Trigger google auth
              window.location.href = "/api/auth/google";
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
          <Link href="/auth/signup" className="text-sm text-foreground-muted hover:text-foreground transition-colors underline underline-offset-4">
            {t("dont_have_account")}
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
