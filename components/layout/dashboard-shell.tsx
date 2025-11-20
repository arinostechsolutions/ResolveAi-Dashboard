"use client";

import { ReactNode, useEffect, useState } from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { CitySelect } from "../selects/city-select";
import { CityProvider } from "@/context/city-context";
import { SecretariaProvider } from "@/context/secretaria-context";
import { SidebarProvider } from "@/context/sidebar-context";
import { useAuth } from "@/context/auth-context";
import { Loader2 } from "lucide-react";
import { useCities } from "@/hooks/use-cities";

type DashboardShellProps = {
  children: ReactNode;
};

export function DashboardShell({ children }: DashboardShellProps) {
  const { loading, admin } = useAuth();
  const [hasMounted, setHasMounted] = useState(false);
  const isSuperAdmin = admin?.isSuperAdmin ?? false;
  
  // Buscar cidades do banco para super admins
  const { data: citiesData, isLoading: citiesLoading } = useCities(isSuperAdmin);

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

  // Determinar cidade inicial
  let initialCity: string | undefined = undefined;
  
  if (admin.allowedCities && admin.allowedCities.length > 0) {
    // Para não-super-admins, usar a primeira cidade permitida
    initialCity = admin.allowedCities[0];
  } else if (isSuperAdmin && citiesData && citiesData.length > 0) {
    // Para super admins, usar a primeira cidade do banco de dados
    initialCity = citiesData[0].id;
  }

  // Se ainda está carregando cidades e é super admin, mostrar loading
  if (isSuperAdmin && citiesLoading && !initialCity) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-300">
        <Loader2 className="size-6 animate-spin" />
        <span className="ml-3 text-sm">Carregando cidades...</span>
      </div>
    );
  }

  const cityKey =
    admin.allowedCities && admin.allowedCities.length > 0
      ? admin.allowedCities.join("|")
      : isSuperAdmin && citiesData
      ? citiesData.map((c) => c.id).join("|")
      : "default";

  return (
    <CityProvider key={cityKey} initialCity={initialCity}>
      <SecretariaProvider>
        <SidebarProvider>
          <div className="flex h-full w-full overflow-x-hidden">
            <div className="hidden lg:flex">
              <Sidebar />
            </div>
            <div className="flex h-full flex-1 flex-col bg-slate-950 overflow-hidden">
              <Topbar citySelect={<CitySelect />} />
              <main className="flex-1 px-3 py-4 sm:px-4 sm:py-6 lg:px-8 overflow-y-auto overflow-x-hidden">
                {children}
              </main>
              <footer className="border-t border-slate-800 bg-slate-900/60 px-3 py-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-center">
                  <p className="text-xs text-slate-400">
                    Desenvolvido por{" "}
                    <span className="font-semibold text-emerald-400">ArinosTech Solutions</span>
                  </p>
                </div>
              </footer>
            </div>
          </div>
        </SidebarProvider>
      </SecretariaProvider>
    </CityProvider>
  );
}

