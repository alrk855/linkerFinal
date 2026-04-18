"use client";

import { createContext, useContext } from "react";
import useSWR from "swr";

interface AuthUser {
  id: string;
  email: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  role: "student" | "company" | "admin" | "guest";
  is_verified_student: boolean;
  profile_completeness: number;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  role: string;
  signOut: () => Promise<void>;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data, error, mutate } = useSWR("/api/auth/session", fetcher, {
    revalidateOnFocus: true,
  });

  const isLoading = !data && !error;
  
  const signOut = async () => {
    await fetch("/api/auth/signout", { method: "POST" });
    mutate({ user: null, role: "guest" });
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider
      value={{
        user: data?.user || null,
        isLoading,
        role: data?.role || "guest",
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
