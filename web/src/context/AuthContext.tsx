import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { AuthSession, AuthUser } from "../types/auth";

interface AuthContextValue {
  session: AuthSession | null;
  user: AuthUser | null;
  token: string | null;
  isAdmin: boolean;
  hasPermission: (permission: string) => boolean;
  login: (session: AuthSession) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = "shk_session";

const loadSession = (): AuthSession | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
};

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [session, setSession] = useState<AuthSession | null>(() => loadSession());

  const login = useCallback((payload: AuthSession) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage errors (private mode, blocked storage).
    }
    setSession(payload);
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage errors.
    }
    setSession(null);
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    session,
    user: session?.user ?? null,
    token: session?.token ?? null,
    isAdmin:
      session?.user.roles?.includes("SuperAdmin") ||
      session?.user.roles?.includes("Admin") ||
      false,
    hasPermission: (permission: string) => {
      const hasPerm = session?.user.permissions?.includes(permission) ?? false;
      const isSuper = session?.user.roles?.includes("SuperAdmin") ?? false;
      return hasPerm || isSuper;
    },
    login,
    logout
  }), [session, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
};
