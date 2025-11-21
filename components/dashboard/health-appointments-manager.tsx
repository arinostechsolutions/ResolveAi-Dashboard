"use client";

import { useState } from "react";
import { useCity } from "@/context/city-context";
import { useAuth } from "@/context/auth-context";
import { useHealthServices } from "@/hooks/use-health-appointments";
import { useMobileConfig, useUpdateMobileConfig } from "@/hooks/use-mobile-config";
import { useCityMenu, useUpdateCityMenu, type MenuItem } from "@/hooks/use-city-menu";
import {
  Building2,
  Stethoscope,
  Microscope,
  Heart,
  HeartOff,
  Settings,
  AlertCircle,
  Plus,
  Edit,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { HealthServicesTab } from "./health-appointments/tabs/health-services-tab";
import { SpecialtiesTab } from "./health-appointments/tabs/specialties-tab";
import { ExamsTab } from "./health-appointments/tabs/exams-tab";
import { CreateModuleConfirmModal } from "./health-appointments/modals/create-module-confirm-modal";
import { MenuFormModal } from "./health-appointments/modals/menu-form-modal";
import { EnableModuleConfirmModal } from "./health-appointments/modals/enable-module-confirm-modal";
import { DisableModuleConfirmModal } from "./health-appointments/modals/disable-module-confirm-modal";

export function HealthAppointmentsManager() {
  const { cityId } = useCity();
  const { admin } = useAuth();
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<"services" | "specialties" | "exams">("services");
  
  // Estados para configuração do módulo
  const [showCreateModuleModal, setShowCreateModuleModal] = useState(false);
  const [showMenuFormModal, setShowMenuFormModal] = useState(false);
  const [showEnableConfirmModal, setShowEnableConfirmModal] = useState(false);
  const [showDisableConfirmModal, setShowDisableConfirmModal] = useState(false);
  
  // Hooks para configuração mobile e menu
  const { data: mobileConfigData } = useMobileConfig(cityId);
  const updateMobileConfigMutation = useUpdateMobileConfig();
  const { data: menuData } = useCityMenu(cityId);
  const updateMenuMutation = useUpdateCityMenu();
  
  // Buscar dados de saúde
  const { data: healthServicesData } = useHealthServices(cityId);
  
  // Verificar se há conteúdo cadastrado
  const hasHealthContent = Boolean(
    healthServicesData?.healthServices &&
    healthServicesData.healthServices.length > 0 &&
    healthServicesData.healthServices.some(
      (service) =>
        (service.availableSpecialties?.length || 0) > 0 ||
        (service.availableExams?.length || 0) > 0
    )
  );
  
  const isModuleEnabled = mobileConfigData?.showHealthAppointments || false;
  const healthMenuItem = menuData?.find((item) => item.id === "health");
  
  // Verificar se apenas super admin ou prefeito podem habilitar
  const canToggleModule = admin?.isSuperAdmin || admin?.isMayor;

  // Handler para criar módulo (apenas estrutura, não habilita)
  const handleCreateModule = () => {
    setShowCreateModuleModal(true);
  };

  // Handler para confirmar criação do módulo
  const handleConfirmCreateModule = () => {
    setShowCreateModuleModal(false);
    setShowMenuFormModal(true);
  };

  // Handler para salvar menu item
  const handleSaveMenuItem = async (menuItem: Omit<MenuItem, "id">) => {
    if (!cityId || !menuData) return;
    
    const newMenuItem: MenuItem = {
      id: "health",
      ...menuItem,
    };
    
    // Verificar se já existe item "health" no menu
    const existingIndex = menuData.findIndex((item) => item.id === "health");
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
    
    if (enabled && !hasHealthContent) {
      toast.error("Cadastre pelo menos um hospital com especialidade ou exame antes de habilitar o módulo.");
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
      await updateMobileConfigMutation.mutateAsync({
        cityId,
        payload: { showHealthAppointments: true },
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
      await updateMobileConfigMutation.mutateAsync({
        cityId,
        payload: { showHealthAppointments: false },
      });
      setShowDisableConfirmModal(false);
    } catch (error) {
      console.error("Erro ao desabilitar módulo:", error);
    }
  };

  // Quando selecionar uma unidade, mudar para a aba de especialidades
  const handleSelectService = (serviceId: string | null) => {
    setSelectedServiceId(serviceId);
    if (serviceId) {
      setActiveTab("specialties");
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
        <p className="text-slate-400">Selecione uma cidade para gerenciar agendamentos de saúde.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-200">
          Gerenciar Saúde do Município
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Cadastre unidades de saúde, especialidades médicas e exames disponíveis para agendamento
        </p>
      </div>

      {/* Configuração do Módulo */}
      <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-500/10 p-2">
              <Settings className="size-5 text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-200">
                Configuração do Módulo de Saúde
              </h3>
              <p className="text-sm text-slate-400">
                {isModuleEnabled
                  ? "Módulo habilitado - aparece no app mobile"
                  : "Módulo desabilitado - não aparece no app mobile"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {!healthMenuItem && (
              <button
                onClick={handleCreateModule}
                className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 transition-colors"
              >
                <Plus className="size-4" />
                Criar Módulo de Saúde
              </button>
            )}
            {healthMenuItem && canToggleModule && (
              <button
                onClick={() => handleToggleModule(!isModuleEnabled)}
                disabled={!hasHealthContent && !isModuleEnabled}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  isModuleEnabled
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-emerald-500 hover:bg-emerald-600 text-white"
                } ${
                  !hasHealthContent && !isModuleEnabled
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                title={
                  !hasHealthContent && !isModuleEnabled
                    ? "Cadastre pelo menos um hospital com especialidade ou exame antes de habilitar"
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
            {healthMenuItem && (
              <button
                onClick={() => setShowMenuFormModal(true)}
                className="flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-600 transition-colors"
              >
                <Edit className="size-4" />
                Editar Item do Menu
              </button>
            )}
          </div>
        </div>
        
        {healthMenuItem && (
          <div className="mt-4 p-4 rounded-lg bg-slate-900/50 border border-slate-600">
            <h4 className="text-sm font-medium text-slate-300 mb-2">Item do Menu Atual:</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-400">Label:</span>
                <span className="ml-2 text-slate-200">{healthMenuItem.label}</span>
              </div>
              <div>
                <span className="text-slate-400">Cor:</span>
                <span
                  className="ml-2 inline-block w-6 h-6 rounded border border-slate-600"
                  style={{ backgroundColor: healthMenuItem.bgColor }}
                />
                <span className="ml-2 text-slate-200">{healthMenuItem.bgColor}</span>
              </div>
              <div>
                <span className="text-slate-400">Ícone:</span>
                <span className="ml-2 text-slate-200">{healthMenuItem.iconName}</span>
              </div>
              {healthMenuItem.description && (
                <div className="col-span-2">
                  <span className="text-slate-400">Descrição:</span>
                  <span className="ml-2 text-slate-200">{healthMenuItem.description}</span>
                </div>
              )}
            </div>
          </div>
        )}
        
        {!hasHealthContent && !isModuleEnabled && (
          <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
            <AlertCircle className="size-5 text-amber-400 mt-0.5" />
            <p className="text-sm text-amber-300">
              Para habilitar o módulo, você precisa cadastrar pelo menos um hospital com especialidade ou exame.
            </p>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-700">
        <button
          onClick={() => {
            setActiveTab("services");
            setSelectedServiceId(null);
          }}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "services"
              ? "border-b-2 border-emerald-500 text-emerald-400"
              : "text-slate-400 hover:text-slate-300"
          }`}
        >
          <Building2 className="inline-block size-4 mr-2" />
          Unidades de Saúde
        </button>
        <button
          onClick={() => selectedServiceId && setActiveTab("specialties")}
          disabled={!selectedServiceId}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "specialties"
              ? "border-b-2 border-emerald-500 text-emerald-400"
              : "text-slate-400 hover:text-slate-300"
          } ${!selectedServiceId ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <Stethoscope className="inline-block size-4 mr-2" />
          Especialidades
          {selectedServiceId && (
            <span className="ml-2 text-xs opacity-75">(Unidade selecionada)</span>
          )}
        </button>
        <button
          onClick={() => selectedServiceId && setActiveTab("exams")}
          disabled={!selectedServiceId}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "exams"
              ? "border-b-2 border-emerald-500 text-emerald-400"
              : "text-slate-400 hover:text-slate-300"
          } ${!selectedServiceId ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <Microscope className="inline-block size-4 mr-2" />
          Exames
          {selectedServiceId && (
            <span className="ml-2 text-xs opacity-75">(Unidade selecionada)</span>
          )}
        </button>
      </div>

      {/* Selected Service Info */}
      {selectedServiceId && activeTab !== "services" && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3">
          <p className="text-sm text-emerald-400">
            <Building2 className="inline-block size-4 mr-2" />
            Gerenciando: <strong>{selectedServiceId}</strong>
            <button
              onClick={() => {
                setSelectedServiceId(null);
                setActiveTab("services");
              }}
              className="ml-4 text-xs underline hover:text-emerald-300"
            >
              Voltar para lista de unidades
            </button>
          </p>
        </div>
      )}

      {/* Content */}
      {activeTab === "services" && (
        <HealthServicesTab
          cityId={cityId}
          onSelectService={handleSelectService}
          selectedServiceId={selectedServiceId}
        />
      )}
      {activeTab === "specialties" && selectedServiceId && (
        <SpecialtiesTab cityId={cityId} serviceId={selectedServiceId} />
      )}
      {activeTab === "exams" && selectedServiceId && (
        <ExamsTab cityId={cityId} serviceId={selectedServiceId} />
      )}

      {/* Modals */}
      {showCreateModuleModal && (
        <CreateModuleConfirmModal
          onConfirm={handleConfirmCreateModule}
          onCancel={() => setShowCreateModuleModal(false)}
        />
      )}

      {showMenuFormModal && (
        <MenuFormModal
          existingItem={healthMenuItem}
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
