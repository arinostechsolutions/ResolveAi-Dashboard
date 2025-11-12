"use client";

import { useMemo } from "react";
import { useCity } from "@/context/city-context";
import { useAuth } from "@/context/auth-context";
import { useCities } from "@/hooks/use-cities";

type Option = { value: string; label: string };

const FALLBACK_CITIES: Option[] = [
  { value: "campinas", label: "Campinas" },
  { value: "piracicaba", label: "Piracicaba" },
  { value: "araruama-rj", label: "Araruama (RJ)" },
];

export function CitySelect() {
  const { cityId, setCityId } = useCity();
  const { admin } = useAuth();
  const isSuperAdmin = admin?.isSuperAdmin ?? false;
  const allowedCities = useMemo(
    () => admin?.allowedCities ?? [],
    [admin],
  );

  const { data: citiesData } = useCities(isSuperAdmin);

  const options = useMemo<Option[]>(() => {
    if (isSuperAdmin) {
      if (citiesData && citiesData.length > 0) {
        return citiesData.map((city) => ({
          value: city.id,
          label: city.label ?? city.id,
        }));
      }
      return FALLBACK_CITIES;
    }

    if (allowedCities.length > 0) {
      return allowedCities.map((city) => ({
        value: city,
        label: city.replace(/-/g, " ").toUpperCase(),
      }));
    }

    return FALLBACK_CITIES;
  }, [allowedCities, citiesData, isSuperAdmin]);

  return (
    <label className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-200">
      <span className="text-xs uppercase tracking-wide text-emerald-300">
        Prefeitura
      </span>
      <select
        className="bg-transparent text-sm font-medium text-white outline-none"
        value={cityId}
        onChange={(event) => setCityId(event.target.value)}
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

