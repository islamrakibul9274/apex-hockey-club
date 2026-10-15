"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  phone?: string;
  membershipPlan?: string;
  notificationsEnabled?: boolean;
  preferences?: {
    matchAlerts: boolean;
    trainingReminders: boolean;
    gearDrops: boolean;
  };
  address?: {
    street?: string;
    city?: string;
    zip?: string;
    country?: string;
  };
}

/** Distinguishes "you typed the wrong thing" from "the server is unreachable". */
export type AuthResult =
  | { ok: true }
  | { ok: false; message: string; fields?: Record<string, string> };

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<AuthResult>;
  register: (input: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }) => Promise<AuthResult>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<AuthResult>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "same-origin" });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user ?? null);
      } else {
        // 401 simply means signed out. Not an error worth surfacing.
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const login = useCallback(
    async (email: string, password: string, remember = false): Promise<AuthResult> => {
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({ email, password, remember }),
        });

        const data = await res.json().catch(() => ({}));

        if (res.ok && data.success) {
          setUser(data.user);
          return { ok: true };
        }

        return {
          ok: false,
          message: data?.error ?? "We could not sign you in. Please try again.",
          fields: data?.fields,
        };
      } catch {
        // Previously this collapsed into the same "invalid credentials"
        // message as a wrong password, so a dropped connection looked like a
        // typing mistake. Network failures now say so.
        return {
          ok: false,
          message: "We could not reach the server. Check your connection and try again.",
        };
      }
    },
    []
  );

  const register = useCallback(
    async (input: { name: string; email: string; password: string; phone?: string }): Promise<AuthResult> => {
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify(input),
        });

        const data = await res.json().catch(() => ({}));

        if (res.ok && data.success) {
          setUser(data.user);
          return { ok: true };
        }

        return {
          ok: false,
          message: data?.error ?? "We could not create your account. Please try again.",
          fields: data?.fields,
        };
      } catch {
        return {
          ok: false,
          message: "We could not reach the server. Check your connection and try again.",
        };
      }
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
    } catch {
      // Even if the request fails the local session must be dropped, otherwise
      // the UI keeps showing a signed-in user that is no longer signed in.
    } finally {
      setUser(null);
      router.push("/");
      router.refresh();
    }
  }, [router]);

  const updateProfile = useCallback(
    async (data: Partial<UserProfile>): Promise<AuthResult> => {
      try {
        const res = await fetch("/api/auth/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify(data),
        });

        const json = await res.json().catch(() => ({}));

        if (res.ok && json.success) {
          setUser((prev) => (prev ? { ...prev, ...json.user } : json.user));
          return { ok: true };
        }

        if (res.status === 401) {
          // Session expired mid-edit — drop it rather than pretend it saved.
          setUser(null);
          router.push("/auth/signin");
          return { ok: false, message: "Your session expired. Please sign in again." };
        }

        return {
          ok: false,
          message: json?.error ?? "We could not save your changes. Please try again.",
          fields: json?.fields,
        };
      } catch {
        return { ok: false, message: "We could not reach the server. Your changes were not saved." };
      }
    },
    [router]
  );

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, updateProfile, refresh }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}