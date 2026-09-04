"use client";
// context/AuthContext.tsx - Global Authentication State Manager

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

const AUTH_KEY = "enmar_customer";

export interface AuthUser {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  role?: string;
  city?: string;
  address?: string;
  postalCode?: string;
  avatar?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isStaff: boolean;
  isLoaded: boolean; // true once localStorage has been read
  login: (user: AuthUser) => void;
  logout: () => Promise<void>;
  updateUser: (partial: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STAFF_ROLES = ["SUPER_ADMIN", "ADMIN", "MANAGER", "MODERATOR"];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Hydrate from localStorage on mount & verify session
  useEffect(() => {
    let currentUser: AuthUser | null = null;
    try {
      const raw = localStorage.getItem(AUTH_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AuthUser;
        if (parsed && parsed.id) {
          currentUser = parsed;
          setUser(parsed);
        }
      }
    } catch (e) {
      localStorage.removeItem(AUTH_KEY);
    } finally {
      setIsLoaded(true);
    }

    // Verify session with server in background
    fetch("/api/auth/me")
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        if (data && data.authenticated && data.user) {
          setUser(data.user);
          try {
            localStorage.setItem(AUTH_KEY, JSON.stringify(data.user));
          } catch (e) {}
        } else if (!data?.authenticated && currentUser) {
          // If server says unauthenticated (e.g. cookie expired), clear local state
          // Note: only if server explicitly returned 401
        }
      })
      .catch(() => {});
  }, []);

  const login = useCallback((newUser: AuthUser) => {
    try {
      localStorage.setItem(AUTH_KEY, JSON.stringify(newUser));
    } catch (e) {}
    setUser(newUser);
  }, []);

  const logout = useCallback(async () => {
    // Call API to clear server-side cookie
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {}

    // Clear all local auth state
    try {
      localStorage.removeItem(AUTH_KEY);
      localStorage.removeItem("enmar_admin_email");
    } catch (e) {}

    setUser(null);
  }, []);

  const updateUser = useCallback((partial: Partial<AuthUser>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...partial };
      try {
        localStorage.setItem(AUTH_KEY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  }, []);

  const isAuthenticated = Boolean(user && user.id);
  const isStaff = Boolean(user?.role && STAFF_ROLES.includes(user.role));

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isStaff,
        isLoaded,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}
