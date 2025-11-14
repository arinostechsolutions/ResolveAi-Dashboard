"use client";

import { Building2 } from "lucide-react";
import { useSecretariaFilter } from "@/context/secretaria-context";
import { useSecretarias } from "@/hooks/use-secretarias";
import { useCity } from "@/context/city-context";
import { useAuth } from "@/context/auth-context";

export function SecretariaSelect() {
  const { admin } = useAuth();
  const { cityId } = useCity();
  const { secretariaId, setSecretariaId } = useSecretariaFilter();
  const isMayor = admin?.isMayor && !admin?.isSuperAdmin;
  
  const { data: secretariasData, isLoading } = useSecretarias(
    isMayor ? cityId : undefined
  );

  // Não mostrar para não-prefeitos
  if (!isMayor || !secretariasData?.secretarias) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 min-w-0">
      <Building2 className="size-4 text-emerald-300 shrink-0" />
      <select
        value={secretariaId || ""}
        onChange={(e) => setSecretariaId(e.target.value || null)}
        className="rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30 min-w-0 max-w-[200px] sm:max-w-none"
      >
        <option value="">Todas as secretarias</option>
        {secretariasData.secretarias.map((secretaria) => (
          <option key={secretaria.id} value={secretaria.id}>
            {secretaria.label}
          </option>
        ))}
      </select>
    </div>
  );
}

