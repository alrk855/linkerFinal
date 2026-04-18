"use client";

import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProfileRedirect() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.replace(`/profile/${user.username}`);
      } else {
        router.replace(`/auth/signin`);
      }
    }
  }, [user, isLoading, router]);

  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-accent border-r-transparent animate-spin" />
    </div>
  );
}
