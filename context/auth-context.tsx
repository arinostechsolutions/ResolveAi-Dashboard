"use client";

import { ReactNode, createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { setAuthToken, setLogoutCallback } from "@/lib/api-client";

type AdminPayload = {
  userId: string;
  name: string;
  email?: string;
  cpf?: string;
  allowedCities?: string[];
  isSuperAdmin?: boolean;
  isMayor?: boolean;
  secretaria?: string | null;
  lastLoginAt?: string;
};

type AuthContextValue = {
  admin: AdminPayload | null;
  token: string | null;
  loading: boolean;
  login: (token: string, admin: AdminPayload, remember?: boolean) => void;
  updateAdmin: (adminData: Partial<AdminPayload>) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_COOKIE_KEY = "resolveai_admin_token";
const ADMIN_STORAGE_KEY = "resolveai_admin_data";

export function AuthProvider({ children }: { children: ReactNode }) {
  const isBrowser = typeof window !== "undefined";

  const [token, setToken] = useState<string | null>(() => {
    if (!isBrowser) return null;
    return Cookies.get(TOKEN_COOKIE_KEY) ?? null;
  });

  const [admin, setAdmin] = useState<AdminPayload | null>(() => {
    if (!isBrowser) return null;

    const storedAdmin = localStorage.getItem(ADMIN_STORAGE_KEY);
    if (storedAdmin) {
      try {
        return JSON.parse(storedAdmin) as AdminPayload;
      } catch (error) {
        console.warn("Não foi possível ler os dados do administrador armazenados.", error);
        localStorage.removeItem(ADMIN_STORAGE_KEY);
      }
    }

    const storedToken = Cookies.get(TOKEN_COOKIE_KEY);
    if (storedToken) {
      try {
        const decoded = jwtDecode<AdminPayload>(storedToken);
        return {
          userId: decoded.userId,
          name: decoded.name,
          email: decoded.email,
          cpf: decoded.cpf,
          allowedCities: decoded.allowedCities ?? [],
          isSuperAdmin: decoded.isSuperAdmin ?? false,
          isMayor: decoded.isMayor ?? false,
          secretaria: decoded.secretaria ?? null,
          lastLoginAt: decoded.lastLoginAt,
        };
      } catch (error) {
        console.warn("Token inválido armazenado.", error);
        Cookies.remove(TOKEN_COOKIE_KEY);
      }
    }

    return null;
  });

  useEffect(() => {
    if (!isBrowser) return;
    setAuthToken(token ?? null);
  }, [isBrowser, token]);

  const logout = useCallback(() => {
    setToken(null);
    setAdmin(null);
    setAuthToken(null);
    Cookies.remove(TOKEN_COOKIE_KEY);
    localStorage.removeItem(ADMIN_STORAGE_KEY);
  }, []);

  useEffect(() => {
    if (!isBrowser) return;
    
    // Registrar função de logout no api-client para ser chamada em caso de 401
    setLogoutCallback(logout);
    
    // Limpar callback quando componente desmontar
    return () => {
      setLogoutCallback(null);
    };
  }, [isBrowser, logout]);

  const login = (newToken: string, adminData: AdminPayload, remember = true) => {
    setToken(newToken);
    setAdmin(adminData);
    setAuthToken(newToken);
    const cookieOptions = {
      sameSite: "strict" as const,
      secure: process.env.NODE_ENV === "production",
      expires: remember ? 7 : undefined,
    };
    Cookies.set(TOKEN_COOKIE_KEY, newToken, cookieOptions);
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(adminData));
  };

  const updateAdmin = useCallback((adminData: Partial<AdminPayload>) => {
    if (!admin) return;
    const updatedAdmin = { ...admin, ...adminData };
    setAdmin(updatedAdmin);
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(updatedAdmin));
  }, [admin]);

  const value = useMemo<AuthContextValue>(
    () => ({
      admin,
      token,
      loading: false,
      login,
      updateAdmin,
      logout,
    }),
    [admin, token, updateAdmin],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return context;
}


