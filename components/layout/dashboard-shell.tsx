"use client";

import { ReactNode, useEffect, useState } from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { CitySelect } from "../selects/city-select";
import { CityProvider } from "@/context/city-context";
import { useAuth } from "@/context/auth-context";
import { Loader2 } from "lucide-react";
import { DEFAULT_CITY_ID } from "@/lib/constants";

type DashboardShellProps = {
  children: ReactNode;
};

export function DashboardShell({ children }: DashboardShellProps) {
  const { loading, admin } = useAuth();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setHasMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  if (!hasMounted) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-300">
        <Loader2 className="size-6 animate-spin" />
        <span className="ml-3 text-sm">Carregando painel...</span>
      </div>
    );
  }

  if (!admin) {
    return null;
  }

  const cityKey =
    admin.allowedCities && admin.allowedCities.length > 0
      ? admin.allowedCities.join("|")
      : "super";
  const initialCity =
    admin.allowedCities && admin.allowedCities.length > 0
      ? admin.allowedCities[0]
      : DEFAULT_CITY_ID;

  return (
    <CityProvider key={cityKey} initialCity={initialCity}>
      <div className="flex min-h-screen w-full">
        <div className="hidden lg:flex lg:w-64 xl:w-72">
          <Sidebar />
        </div>
        <div className="flex min-h-screen flex-1 flex-col bg-slate-950">
          <Topbar citySelect={<CitySelect />} />
          <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </div>
    </CityProvider>
  );
}

