"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Mail } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function WaitlistPage() {
  const t = useTranslations("Auth");

  return (
    <div className="flex-1 flex items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-sm bg-surface border-border shadow-md rounded-xl text-center">
        <CardHeader className="pb-4">
          <div className="w-12 h-12 bg-surface-raised rounded-lg flex items-center justify-center mb-4 mx-auto text-foreground">
            <Mail size={24} />
          </div>
          <CardTitle className="text-2xl font-semibold tracking-tight">You're on the list</CardTitle>
          <CardDescription className="text-foreground-muted mt-2 text-base leading-relaxed">
            {t("waitlist_msg")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full mt-4 bg-surface-raised hover:bg-surface-raised/80 text-foreground transition-colors">
            <Link href="/">Return to home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
