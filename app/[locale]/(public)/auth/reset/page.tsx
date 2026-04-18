"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { createBrowserClient } from "@supabase/ssr";

const resetSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export default function ResetPasswordPage() {
  const t = useTranslations("Auth");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof resetSchema>>({
    resolver: zodResolver(resetSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: z.infer<typeof resetSchema>) {
    setLoading(true);
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: `${window.location.origin}/auth/signin`,
      });
      if (error) throw error;
      setSubmitted(true);
    } catch {
      toast.error(t("error"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-sm bg-surface border-border shadow-md rounded-xl">
        <CardHeader className="space-y-1 pb-6">
          <CardTitle className="text-2xl font-semibold tracking-tight text-center">
            {t("reset_password")}
          </CardTitle>
          <CardDescription className="text-center text-foreground-muted">
            {submitted ? t("reset_email_sent") : t("reset_password_desc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!submitted ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("email")}</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="name@example.com"
                          {...field}
                          className="bg-background border-border focus-visible:ring-accent"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-accent hover:bg-accent-hover text-background font-medium mt-2"
                >
                  {loading ? "..." : t("send_reset_link")}
                </Button>
              </form>
            </Form>
          ) : (
            <Button asChild variant="outline" className="w-full border-border">
              <Link href="/auth/signin">{t("back_to_signin")}</Link>
            </Button>
          )}

          {!submitted && (
            <div className="mt-6 text-center">
              <Link
                href="/auth/signin"
                className="text-sm text-foreground-muted hover:text-foreground transition-colors underline underline-offset-4"
              >
                {t("back_to_signin")}
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
