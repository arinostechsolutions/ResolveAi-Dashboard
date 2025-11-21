"use client";

import { useState } from "react";
import { useCity } from "@/context/city-context";
import { useAuth } from "@/context/auth-context";
import { useEvents, useCreateEvent, useUpdateEvent, useDeleteEvent, type Event } from "@/hooks/use-events";
import { useMobileConfig, useUpdateMobileConfig } from "@/hooks/use-mobile-config";
import { useCityMenu, useUpdateCityMenu, type MenuItem } from "@/hooks/use-city-menu";
import {
  Loader2,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Calendar,
  MapPin,
  Image as ImageIcon,
  Users,
  Settings,
  Heart,
  HeartOff,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { CreateModuleConfirmModal } from "./events/modals/create-module-confirm-modal";
import { MenuFormModal } from "./events/modals/menu-form-modal";
import { EnableModuleConfirmModal } from "./events/modals/enable-module-confirm-modal";
import { DisableModuleConfirmModal } from "./events/modals/disable-module-confirm-modal";
import { EventFormModal } from "./events/modals/event-form-modal";
import { EventsList } from "./events/events-list";

export function EventsManager() {
  const { cityId } = useCity();
  const { admin } = useAuth();
  
  // Estados para configuração do módulo
  const [showCreateModuleModal, setShowCreateModuleModal] = useState(false);
  const [showMenuFormModal, setShowMenuFormModal] = useState(false);
  const [showEnableConfirmModal, setShowEnableConfirmModal] = useState(false);
  const [showDisableConfirmModal, setShowDisableConfirmModal] = useState(false);
  const [showEventFormModal, setShowEventFormModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  
  // Hooks para configuração mobile e menu
  const { data: mobileConfigData } = useMobileConfig(cityId);
  const updateMobileConfigMutation = useUpdateMobileConfig();
  const { data: menuData } = useCityMenu(cityId);
  const updateMenuMutation = useUpdateCityMenu();
  
  // Buscar eventos
  const { data: eventsData, isLoading } = useEvents(cityId);
  
  // Verificar se há eventos cadastrados
  const hasEvents = Boolean(
    eventsData?.events && eventsData.events.length > 0
  );
  
  const isModuleEnabled = mobileConfigData?.showEvents || false;
  const eventsMenuItem = menuData?.find((item) => item.id === "events");
  
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
      id: "events",
      ...menuItem,
    };
    
    // Verificar se já existe item "events" no menu
    const existingIndex = menuData.findIndex((item) => item.id === "events");
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
    
    if (enabled && !hasEvents) {
      toast.error("Cadastre pelo menos um evento antes de habilitar o módulo.");
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
        payload: { showEvents: true },
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
        payload: { showEvents: false },
      });
      setShowDisableConfirmModal(false);
    } catch (error) {
      console.error("Erro ao desabilitar módulo:", error);
    }
  };

  // Handler para criar evento
  const handleCreateEvent = () => {
    setEditingEvent(null);
    setShowEventFormModal(true);
  };

  // Handler para editar evento
  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setShowEventFormModal(true);
  };

  // Handler para deletar evento
  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm("Tem certeza que deseja deletar este evento?")) {
      return;
    }

    const deleteMutation = useDeleteEvent();
    deleteMutation.mutate(eventId);
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
        <p className="text-slate-400">Selecione uma cidade para gerenciar eventos.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-200">
          Gerenciar Eventos do Município
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Cadastre e gerencie eventos da cidade com imagens, localização, patrocinadores e programação
        </p>
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
                Configuração do Módulo de Eventos
              </h3>
              <p className="text-sm text-slate-400">
                {isModuleEnabled
                  ? "Módulo habilitado - aparece no app mobile"
                  : "Módulo desabilitado - não aparece no app mobile"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {!eventsMenuItem && (
              <button
                onClick={handleCreateModule}
                className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 transition-colors"
              >
                <Plus className="size-4" />
                Criar Módulo de Eventos
              </button>
            )}
            {eventsMenuItem && canToggleModule && (
              <button
                onClick={() => handleToggleModule(!isModuleEnabled)}
                disabled={!hasEvents && !isModuleEnabled}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  isModuleEnabled
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-emerald-500 hover:bg-emerald-600 text-white"
                } ${
                  !hasEvents && !isModuleEnabled
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                title={
                  !hasEvents && !isModuleEnabled
                    ? "Cadastre pelo menos um evento antes de habilitar"
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
            {eventsMenuItem && (
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
        
        {eventsMenuItem && (
          <div className="mt-4 p-4 rounded-lg bg-slate-900/50 border border-slate-600">
            <h4 className="text-sm font-medium text-slate-300 mb-2">Item do Menu Atual:</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-400">Label:</span>
                <span className="ml-2 text-slate-200">{eventsMenuItem.label}</span>
              </div>
              <div>
                <span className="text-slate-400">Cor:</span>
                <span
                  className="ml-2 inline-block w-6 h-6 rounded border border-slate-600"
                  style={{ backgroundColor: eventsMenuItem.bgColor }}
                />
                <span className="ml-2 text-slate-200">{eventsMenuItem.bgColor}</span>
              </div>
              <div>
                <span className="text-slate-400">Ícone:</span>
                <span className="ml-2 text-slate-200">{eventsMenuItem.iconName}</span>
              </div>
              {eventsMenuItem.description && (
                <div className="col-span-2">
                  <span className="text-slate-400">Descrição:</span>
                  <span className="ml-2 text-slate-200">{eventsMenuItem.description}</span>
                </div>
              )}
            </div>
          </div>
        )}
        
        {!hasEvents && !isModuleEnabled && (
          <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
            <AlertCircle className="size-5 text-amber-400 mt-0.5" />
            <p className="text-sm text-amber-300">
              Para habilitar o módulo, você precisa cadastrar pelo menos um evento.
            </p>
          </div>
        )}
      </div>

      {/* Lista de Eventos */}
      <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-200">
            Eventos ({eventsData?.events.length || 0})
          </h3>
          <button
            onClick={handleCreateEvent}
            className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600"
          >
            <Plus className="size-4" />
            Criar Evento
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-8 animate-spin text-emerald-400" />
          </div>
        ) : (
          <EventsList
            events={eventsData?.events || []}
            onEdit={handleEditEvent}
            onDelete={handleDeleteEvent}
          />
        )}
      </div>

      {/* Modals */}
      {showCreateModuleModal && (
        <CreateModuleConfirmModal
          onConfirm={handleConfirmCreateModule}
          onCancel={() => setShowCreateModuleModal(false)}
        />
      )}

      {showMenuFormModal && (
        <MenuFormModal
          existingItem={eventsMenuItem}
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

      {showEventFormModal && (
        <EventFormModal
          isOpen={showEventFormModal}
          onClose={() => {
            setShowEventFormModal(false);
            setEditingEvent(null);
          }}
          event={editingEvent}
          cityId={cityId!}
        />
      )}
    </div>
  );
}

