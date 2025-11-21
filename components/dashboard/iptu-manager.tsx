"use client";

import React, { useState, useEffect } from "react";
import { useCity } from "@/context/city-context";
import { useAuth } from "@/context/auth-context";
import { useIptuConfig, useUpdateIptuConfig } from "@/hooks/use-iptu";
import { useCityMenu, useUpdateCityMenu, type MenuItem } from "@/hooks/use-city-menu";
import {
  Loader2,
  Save,
  Settings,
  Link as LinkIcon,
  Heart,
  HeartOff,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { MenuFormModal } from "./iptu/modals/menu-form-modal";
import { EnableModuleConfirmModal } from "./iptu/modals/enable-module-confirm-modal";
import { DisableModuleConfirmModal } from "./iptu/modals/disable-module-confirm-modal";

export function IptuManager() {
  const { cityId } = useCity();
  const { admin } = useAuth();
  
  // Estados para configuração do módulo
  const [showMenuFormModal, setShowMenuFormModal] = useState(false);
  const [showEnableConfirmModal, setShowEnableConfirmModal] = useState(false);
  const [showDisableConfirmModal, setShowDisableConfirmModal] = useState(false);
  const [paymentURL, setPaymentURL] = useState("");
  
  // Hooks
  const { data: iptuConfig, isLoading } = useIptuConfig(cityId);
  const updateIptuConfigMutation = useUpdateIptuConfig();
  const { data: menuData } = useCityMenu(cityId);
  const updateMenuMutation = useUpdateCityMenu();
  
  // Preencher URL quando carregar
  useEffect(() => {
    if (iptuConfig?.paymentURL) {
      setPaymentURL(iptuConfig.paymentURL);
    }
  }, [iptuConfig?.paymentURL]);
  
  const isModuleEnabled = iptuConfig?.enabled || false;
  const iptuMenuItem = menuData?.find((item) => item.id === "iptu");
  
  // Verificar se apenas super admin ou prefeito podem habilitar
  const canToggleModule = admin?.isSuperAdmin || admin?.isMayor;

  // Handler para salvar menu item
  const handleSaveMenuItem = async (menuItem: Omit<MenuItem, "id">) => {
    if (!cityId || !menuData) return;
    
    const newMenuItem: MenuItem = {
      id: "iptu",
      ...menuItem,
    };
    
    // Verificar se já existe item "iptu" no menu
    const existingIndex = menuData.findIndex((item) => item.id === "iptu");
    const updatedMenu = existingIndex >= 0
      ? menuData.map((item, index) => index === existingIndex ? newMenuItem : item)
      : [...menuData, newMenuItem];
    
    try {
      await updateMenuMutation.mutateAsync({ cityId, menu: updatedMenu });
      setShowMenuFormModal(false);
    } catch (error) {
      console.error("Erro ao salvar item do menu:", error);
    }
  };

  // Handler para habilitar/desabilitar módulo
  const handleToggleModule = async (enabled: boolean) => {
    if (!cityId) return;
    
    if (enabled && !paymentURL.trim()) {
      toast.error("Configure o link de pagamento antes de habilitar o módulo.");
      return;
    }
    
    if (enabled) {
      setShowEnableConfirmModal(true);
    } else {
      setShowDisableConfirmModal(true);
    }
  };

  // Handler para confirmar habilitação
  const handleConfirmEnable = async () => {
    if (!cityId) return;
    
    try {
      await updateIptuConfigMutation.mutateAsync({
        cityId,
        payload: { enabled: true },
      });
      setShowEnableConfirmModal(false);
    } catch (error) {
      console.error("Erro ao habilitar módulo:", error);
    }
  };

  // Handler para confirmar desabilitação
  const handleConfirmDisable = async () => {
    if (!cityId) return;
    
    try {
      await updateIptuConfigMutation.mutateAsync({
        cityId,
        payload: { enabled: false },
      });
      setShowDisableConfirmModal(false);
    } catch (error) {
      console.error("Erro ao desabilitar módulo:", error);
    }
  };

  // Handler para salvar URL
  const handleSaveURL = async () => {
    if (!cityId) return;
    
    if (!paymentURL.trim()) {
      toast.error("O link de pagamento é obrigatório.");
      return;
    }

    // Validar URL
    try {
      new URL(paymentURL);
    } catch {
      toast.error("Por favor, insira uma URL válida.");
      return;
    }

    try {
      await updateIptuConfigMutation.mutateAsync({
        cityId,
        payload: { paymentURL: paymentURL.trim() },
      });
    } catch (error) {
      console.error("Erro ao salvar URL:", error);
    }
  };

  // Verificar permissões
  const hasPermission =
    admin?.isMayor ||
    admin?.isSuperAdmin ||
    (admin?.secretaria && !admin?.isMayor && !admin?.isSuperAdmin);

  if (!hasPermission) {
    return (
      <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-6 text-center">
        <p className="text-red-400 font-medium">
          Acesso negado. Apenas administradores podem acessar esta funcionalidade.
        </p>
      </div>
    );
  }

  if (!cityId) {
    return (
      <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6 text-center">
        <p className="text-slate-400">Selecione uma cidade para gerenciar IPTU.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-200">
          Gerenciar Pagamento de IPTU
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Configure o link de pagamento de IPTU e habilite o módulo no aplicativo mobile
        </p>
      </div>

      {/* Configuração do Link */}
      <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="rounded-lg bg-blue-500/10 p-2">
            <LinkIcon className="size-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-200">
              Link de Pagamento
            </h3>
            <p className="text-sm text-slate-400">
              URL para onde os usuários serão direcionados ao clicar em IPTU
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              URL de Pagamento *
            </label>
            <input
              type="url"
              value={paymentURL}
              onChange={(e) => setPaymentURL(e.target.value)}
              placeholder="https://exemplo.com/pagamento-iptu"
              className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-slate-200 placeholder-slate-500"
            />
            <p className="mt-1 text-xs text-slate-500">
              Exemplo: https://www.sefaz.gov.br/pagamento-iptu
            </p>
          </div>

          <button
            onClick={handleSaveURL}
            disabled={updateIptuConfigMutation.isPending}
            className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updateIptuConfigMutation.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="size-4" />
                Salvar Link
              </>
            )}
          </button>
        </div>
      </div>

      {/* Configuração do Módulo */}
      <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/10 p-2">
              <Settings className="size-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-200">
                Configuração do Módulo de IPTU
              </h3>
              <p className="text-sm text-slate-400">
                {isModuleEnabled
                  ? "Módulo habilitado - aparece no app mobile"
                  : "Módulo desabilitado - não aparece no app mobile"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {!iptuMenuItem && (
              <button
                onClick={() => setShowMenuFormModal(true)}
                className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 transition-colors"
              >
                Criar Item do Menu
              </button>
            )}
            {iptuMenuItem && canToggleModule && (
              <button
                onClick={() => handleToggleModule(!isModuleEnabled)}
                disabled={!paymentURL.trim() && !isModuleEnabled}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  isModuleEnabled
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-emerald-500 hover:bg-emerald-600 text-white"
                } ${
                  !paymentURL.trim() && !isModuleEnabled
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                title={
                  !paymentURL.trim() && !isModuleEnabled
                    ? "Configure o link de pagamento antes de habilitar"
                    : ""
                }
              >
                {isModuleEnabled ? (
                  <>
                    <HeartOff className="size-4" />
                    Desabilitar Módulo
                  </>
                ) : (
                  <>
                    <Heart className="size-4" />
                    Habilitar Módulo
                  </>
                )}
              </button>
            )}
            {iptuMenuItem && (
              <button
                onClick={() => setShowMenuFormModal(true)}
                className="flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-600 transition-colors"
              >
                Editar Item do Menu
              </button>
            )}
          </div>
        </div>
        
        {iptuMenuItem && (
          <div className="mt-4 p-4 rounded-lg bg-slate-900/50 border border-slate-600">
            <h4 className="text-sm font-medium text-slate-300 mb-2">Item do Menu Atual:</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-400">Label:</span>
                <span className="ml-2 text-slate-200">{iptuMenuItem.label}</span>
              </div>
              <div>
                <span className="text-slate-400">Cor:</span>
                <span
                  className="ml-2 inline-block w-6 h-6 rounded border border-slate-600"
                  style={{ backgroundColor: iptuMenuItem.bgColor }}
                />
                <span className="ml-2 text-slate-200">{iptuMenuItem.bgColor}</span>
              </div>
              <div>
                <span className="text-slate-400">Ícone:</span>
                <span className="ml-2 text-slate-200">{iptuMenuItem.iconName}</span>
              </div>
              {iptuMenuItem.description && (
                <div className="col-span-2">
                  <span className="text-slate-400">Descrição:</span>
                  <span className="ml-2 text-slate-200">{iptuMenuItem.description}</span>
                </div>
              )}
            </div>
          </div>
        )}
        
        {!paymentURL.trim() && !isModuleEnabled && (
          <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
            <AlertCircle className="size-5 text-amber-400 mt-0.5" />
            <p className="text-sm text-amber-300">
              Para habilitar o módulo, você precisa configurar o link de pagamento acima.
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      {showMenuFormModal && (
        <MenuFormModal
          existingItem={iptuMenuItem}
          onSave={handleSaveMenuItem}
          onCancel={() => setShowMenuFormModal(false)}
        />
      )}

      {showEnableConfirmModal && (
        <EnableModuleConfirmModal
          onConfirm={handleConfirmEnable}
          onCancel={() => setShowEnableConfirmModal(false)}
        />
      )}

      {showDisableConfirmModal && (
        <DisableModuleConfirmModal
          onConfirm={handleConfirmDisable}
          onCancel={() => setShowDisableConfirmModal(false)}
        />
      )}
    </div>
  );
}

