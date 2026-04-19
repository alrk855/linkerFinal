"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function AccountSettingsPage() {
  const { user, isLoading, signOut } = useAuth();
  const [ukimEmail, setUkimEmail] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadProfileConnectionInfo() {
      if (!user) {
        return;
      }

      try {
        const res = await fetch("/api/profile/me");
        if (!res.ok) {
          return;
        }

        const data = await res.json();
        if (!cancelled) {
          setUkimEmail(data?.profile?.ukim_email ?? null);
        }
      } catch {
        // Keep this non-blocking, settings page should still render without this field.
      }
    }

    loadProfileConnectionInfo();

    return () => {
      cancelled = true;
    };
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-8 h-8 rounded-full border-2 border-accent border-r-transparent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center px-4 py-10 text-foreground-muted">
        You need to sign in to view account settings.
      </div>
    );
  }

  return (
    <div className="flex-1 w-full max-w-3xl mx-auto px-4 lg:px-8 py-8 md:py-12 flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Account Settings</h1>
        <p className="text-sm text-foreground-muted mt-2">
          Manage your account identity, security, and session preferences.
        </p>
      </div>

      <Card className="bg-surface border-border">
        <CardHeader>
          <CardTitle>Account Identity</CardTitle>
          <CardDescription>Your core account information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="account-username">Username</Label>
            <Input id="account-username" value={user.username} readOnly className="bg-surface-raised border-border text-foreground-muted" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="account-primary">Primary Account</Label>
            <Input id="account-primary" value={user.email} readOnly className="bg-surface-raised border-border text-foreground-muted" />
          </div>
          {user.role === "student" ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="account-ms-status">Microsoft Student Verification</Label>
                <Input
                  id="account-ms-status"
                  value={user.is_verified_student ? "Verified" : "Not verified"}
                  readOnly
                  className="bg-surface-raised border-border text-foreground-muted"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="account-ms-email">Connected Microsoft Email</Label>
                <Input
                  id="account-ms-email"
                  value={ukimEmail || "Not connected"}
                  readOnly
                  className="bg-surface-raised border-border text-foreground-muted"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                className="bg-background border-border"
                onClick={() => {
                  window.location.href = "/auth/verify-student";
                }}
              >
                {ukimEmail ? "Reconnect Microsoft Account" : "Connect Microsoft Account"}
              </Button>
            </>
          ) : (
            <p className="text-sm text-foreground-muted">
              Microsoft student verification is available for student accounts only.
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="bg-surface border-border">
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>Password and sign-in security options.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-3">
          <Button
            type="button"
            variant="outline"
            className="bg-background border-border"
            onClick={() => {
              window.location.href = "/auth/reset";
            }}
          >
            Reset Password
          </Button>
          <Button
            type="button"
            variant="outline"
            className="bg-background border-border"
            onClick={() => {
              toast.info("More security settings are coming soon.");
            }}
          >
            Two-Factor Authentication
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-surface border-border">
        <CardHeader>
          <CardTitle>Session</CardTitle>
          <CardDescription>Sign out from the current session.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            type="button"
            variant="destructive"
            className="font-medium"
            onClick={async () => {
              await signOut();
            }}
          >
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
