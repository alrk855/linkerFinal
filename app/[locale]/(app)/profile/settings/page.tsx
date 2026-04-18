"use client";

import { useAuth } from "@/providers/auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function AccountSettingsPage() {
  const { user, isLoading, signOut } = useAuth();

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
            <Label htmlFor="account-email">Email</Label>
            <Input id="account-email" value={user.email} readOnly className="bg-surface-raised border-border text-foreground-muted" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="account-role">Role</Label>
            <Input id="account-role" value={user.role} readOnly className="bg-surface-raised border-border text-foreground-muted" />
          </div>
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
