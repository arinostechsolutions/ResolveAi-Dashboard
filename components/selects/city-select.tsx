"use client";

import { useMemo } from "react";
import { useCity } from "@/context/city-context";
import { useAuth } from "@/context/auth-context";
import { useCities } from "@/hooks/use-cities";
import { Loader2 } from "lucide-react";

type Option = { value: string; label: string };

export function CitySelect() {
  const { cityId, setCityId } = useCity();
  const { admin } = useAuth();
  const isSuperAdmin = admin?.isSuperAdmin ?? false;
  const allowedCities = useMemo(
    () => admin?.allowedCities ?? [],
    [admin],
  );

  const { data: citiesData, isLoading } = useCities(true); // Sempre buscar todas as cidades para ter os labels

  const options = useMemo<Option[]>(() => {
    if (isSuperAdmin) {
      if (citiesData && citiesData.length > 0) {
        return citiesData.map((city) => ({
          value: city.id,
          label: city.label ?? city.id,
        }));
      }
      // Se não há cidades ainda, retornar array vazio (será preenchido quando carregar)
      return [];
    }

    // Para não-super-admins, usar allowedCities e buscar labels do banco
    if (allowedCities.length > 0 && citiesData && citiesData.length > 0) {
      // Mapear allowedCities para labels do banco quando disponível
      return allowedCities.map((cityId) => {
        const cityFromDb = citiesData.find((c) => c.id === cityId);
        return {
          value: cityId,
          label: cityFromDb?.label ?? cityId.replace(/-/g, " ").toUpperCase(),
        };
      });
    }

    // Se não há allowedCities, retornar array vazio
    return [];
  }, [allowedCities, citiesData, isSuperAdmin]);

  // Mostrar loading enquanto busca cidades
  if (isLoading) {
    return (
      <label className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-200">
        <span className="text-xs uppercase tracking-wide text-emerald-300">
          Prefeitura
        </span>
        <Loader2 className="size-4 animate-spin text-slate-400" />
      </label>
    );
  }

  // Se não há opções disponíveis, mostrar mensagem
  if (options.length === 0) {
    return (
      <label className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-200">
        <span className="text-xs uppercase tracking-wide text-emerald-300">
          Prefeitura
        </span>
        <span className="text-xs text-slate-400">Nenhuma cidade disponível</span>
      </label>
    );
  }

  return (
    <label className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-200">
      <span className="text-xs uppercase tracking-wide text-emerald-300">
        Prefeitura
      </span>
      <select
        className="bg-transparent text-sm font-medium text-white outline-none"
        value={cityId || ""}
        onChange={(event) => setCityId(event.target.value || undefined)}
      >
        {options.map((city) => (
          <option key={city.value} value={city.value} className="text-slate-900">
            {city.label}
          </option>
        ))}
      </select>
    </label>
  );
}

