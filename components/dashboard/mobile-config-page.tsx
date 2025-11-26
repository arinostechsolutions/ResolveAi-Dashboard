"use client";

import { useState, useEffect } from "react";
import { useCity } from "@/context/city-context";
import { useAuth } from "@/context/auth-context";
import { Loader2, Smartphone, Wifi, WifiOff, Map, MapPin, Building2 } from "lucide-react";
import { toast } from "react-hot-toast";
import apiClient from "@/lib/api-client";
import { ServiceUnavailable } from "../errors/service-unavailable";

type MobileConfig = {
  showFeed: boolean;
  showMap: boolean;
  showSmartCity?: boolean;
};

export function MobileConfigPage() {
  const { cityId } = useCity();
  const { admin } = useAuth();
  const [config, setConfig] = useState<MobileConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cityNotFound, setCityNotFound] = useState(false);
  const [waitingForCity, setWaitingForCity] = useState(true);

  // Permitir que todos os admins vejam a página (prefeitos, secretarias e super admins)
  const canView = admin?.isMayor || admin?.isSuperAdmin || (admin?.secretaria && !admin?.isSuperAdmin && !admin?.isMayor);
  // Prefeitos e super admins podem alterar showFeed e showMap
  const canEditConfig = (admin?.isSuperAdmin || admin?.isMayor) ?? false;

  useEffect(() => {
    if (!canView) {
      setLoading(false);
      setWaitingForCity(false);
      return;
    }

    // Aguardar até que cityId seja válido (não undefined, null, ou vazio)
    if (!cityId || cityId.trim() === "") {
      setWaitingForCity(true);
      setLoading(true);
      return;
    }

    // Se chegou aqui, cityId é válido
    setWaitingForCity(false);
    fetchConfig();
  }, [cityId, canView]);

  const fetchConfig = async () => {
    // Validação adicional: não fazer requisição se cityId não for válido
    if (!cityId || cityId.trim() === "") {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setCityNotFound(false);
      const response = await apiClient.get<MobileConfig>(
        `/api/cities/mobile-config/${cityId}`
      );
      setConfig(response.data);
    } catch (error: any) {
      console.error("Erro ao buscar configuração mobile:", error);
      
      // Verificar se é erro 404 (cidade não encontrada)
      if (error?.response?.status === 404) {
        setCityNotFound(true);
        return;
      }
      
      toast.error("Erro ao carregar configuração mobile");
      // Valores padrão em caso de erro
      setConfig({ showFeed: true, showMap: true, showSmartCity: false });
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = async (field: "showFeed" | "showMap" | "showSmartCity", value: boolean) => {
    if (!canEditConfig || !cityId || saving) return;

    try {
      setSaving(true);
      const payload: Partial<MobileConfig> = {
        [field]: value,
      };

      const response = await apiClient.put<{ message: string; mobileConfig: MobileConfig }>(
        `/api/cities/mobile-config/${cityId}`,
        payload
      );

      setConfig(response.data.mobileConfig);
      toast.success("Configuração atualizada com sucesso!");
    } catch (error: any) {
      console.error("Erro ao atualizar configuração mobile:", error);
      toast.error(error?.response?.data?.message || "Erro ao atualizar configuração");
      // Reverter mudança em caso de erro
      await fetchConfig();
    } finally {
      setSaving(false);
    }
  };

  if (!canView) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-200">Configuração Mobile</h1>
          <p className="mt-1 text-sm text-slate-400">
            Gerencie as configurações do aplicativo mobile
          </p>
        </div>
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-6 text-center">
          <p className="text-red-400 font-medium">
            Acesso negado. Apenas administradores podem acessar esta página.
          </p>
        </div>
      </div>
    );
  }

  if (cityNotFound) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-200">Configuração Mobile</h1>
          <p className="mt-1 text-sm text-slate-400">
            Gerencie as configurações do aplicativo mobile
          </p>
        </div>
        <ServiceUnavailable
          message="Cidade não encontrada ou serviço indisponível no momento"
          onRetry={fetchConfig}
          showHomeButton={false}
        />
      </div>
    );
  }

  // Mostrar loading enquanto aguarda cidade válida ou carrega dados
  if (waitingForCity || loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-200">Configuração Mobile</h1>
          <p className="mt-1 text-sm text-slate-400">
            Gerencie as configurações do aplicativo mobile
          </p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-8 animate-spin text-emerald-400" />
          {waitingForCity && (
            <span className="ml-3 text-sm text-slate-400">Aguardando seleção de cidade...</span>
          )}
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-200">Configuração Mobile</h1>
          <p className="mt-1 text-sm text-slate-400">
            Gerencie as configurações do aplicativo mobile
          </p>
        </div>
        <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6 text-center">
          <p className="text-slate-400">Não foi possível carregar a configuração.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-200">Configuração Mobile</h1>
        <p className="mt-1 text-sm text-slate-400">
          Gerencie quais funcionalidades estarão disponíveis no aplicativo mobile
        </p>
      </div>

      {/* Cards de Configuração */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Feed */}
        <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-emerald-500/10 p-3">
                <Smartphone className="size-6 text-emerald-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-200">Feed de Sugestões</h3>
                <p className="mt-1 text-sm text-slate-400">
                  Exibir o feed de sugestões de melhorias no aplicativo mobile
                </p>
              </div>
            </div>
            <ToggleSwitch
              enabled={config.showFeed}
              onToggle={(enabled) => updateConfig("showFeed", enabled)}
              disabled={saving || !canEditConfig}
            />
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
            {config.showFeed ? (
              <>
                <Wifi className="size-4" />
                <span>Feed habilitado</span>
              </>
            ) : (
              <>
                <WifiOff className="size-4" />
                <span>Feed desabilitado</span>
              </>
            )}
          </div>
        </div>

        {/* Mapa */}
        <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-blue-500/10 p-3">
                <Map className="size-6 text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-200">Mapa de Sugestões</h3>
                <p className="mt-1 text-sm text-slate-400">
                  Exibir o mapa de sugestões de melhorias no aplicativo mobile
                </p>
              </div>
            </div>
            <ToggleSwitch
              enabled={config.showMap}
              onToggle={(enabled) => updateConfig("showMap", enabled)}
              disabled={saving || !canEditConfig}
            />
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
            {config.showMap ? (
              <>
                <MapPin className="size-4" />
                <span>Mapa habilitado</span>
              </>
            ) : (
              <>
                <MapPin className="size-4 opacity-50" />
                <span>Mapa desabilitado</span>
              </>
            )}
          </div>
        </div>

        {/* Cidade Inteligente */}
        <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-purple-500/10 p-3">
                <Building2 className="size-6 text-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-200">Cidade Inteligente</h3>
                <p className="mt-1 text-sm text-slate-400">
                  Exibir mapa interativo com pontos de interesse (interdições, eventos, unidades de saúde)
                </p>
              </div>
            </div>
            <ToggleSwitch
              enabled={config.showSmartCity ?? false}
              onToggle={(enabled) => updateConfig("showSmartCity", enabled)}
              disabled={saving || !canEditConfig}
            />
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
            {config.showSmartCity ? (
              <>
                <Building2 className="size-4" />
                <span>Cidade Inteligente habilitada</span>
              </>
            ) : (
              <>
                <Building2 className="size-4 opacity-50" />
                <span>Cidade Inteligente desabilitada</span>
              </>
            )}
          </div>
        </div>

      </div>

      {/* Informação adicional */}
      <div className="rounded-lg border border-slate-700 bg-slate-800/30 p-4">
        <p className="text-sm text-slate-400">
          <strong className="text-slate-300">Nota:</strong> As alterações serão aplicadas imediatamente no aplicativo mobile. 
          Os usuários precisarão atualizar o aplicativo para ver as mudanças.
          {!canEditConfig && (
            <span className="block mt-2 text-amber-400">
              ⚠️ Apenas super administradores e prefeitos podem alterar as configurações de Feed e Mapa.
            </span>
          )}
        </p>
      </div>
    </div>
  );
}

type ToggleSwitchProps = {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  disabled?: boolean;
};

function ToggleSwitch({ enabled, onToggle, disabled }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onToggle(!enabled)}
      disabled={disabled}
      className={`
        relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900
        ${enabled ? "bg-emerald-500" : "bg-slate-600"}
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
      `}
      aria-label={enabled ? "Desabilitar" : "Habilitar"}
    >
      <span
        className={`
          inline-block h-5 w-5 transform rounded-full bg-white transition-transform
          ${enabled ? "translate-x-6" : "translate-x-1"}
        `}
      />
    </button>
  );
}

