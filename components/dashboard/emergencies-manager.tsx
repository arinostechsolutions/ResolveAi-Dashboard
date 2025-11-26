"use client";

import React, { useState, useEffect } from "react";
import { useCity } from "@/context/city-context";
import { useAuth } from "@/context/auth-context";
import { useEmergencyContacts, useDeleteEmergencyContact, type EmergencyContact } from "@/hooks/use-emergencies";
import { useMobileConfig, useUpdateMobileConfig } from "@/hooks/use-mobile-config";
import { useCityMenu, useUpdateCityMenu, type MenuItem } from "@/hooks/use-city-menu";
import {
  Loader2,
  Plus,
  Edit,
  Trash2,
  Phone,
  MapPin,
  Settings,
  Heart,
  HeartOff,
  AlertCircle,
  X,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { MenuFormModal } from "./emergencies/modals/menu-form-modal";
import { EnableModuleConfirmModal } from "./emergencies/modals/enable-module-confirm-modal";
import { DisableModuleConfirmModal } from "./emergencies/modals/disable-module-confirm-modal";
import { EmergencyContactFormModal } from "./emergencies/modals/emergency-contact-form-modal";

const getTypeLabel = (type: EmergencyContact["type"]): string => {
  const labels: Record<EmergencyContact["type"], string> = {
    policia: "Polícia",
    bombeiro: "Bombeiro",
    defesa_civil: "Defesa Civil",
    disk_denuncia: "Disk Denúncia",
    violencia_mulher: "Violência contra Mulher",
    samu: "SAMU",
    outro: "Outro",
  };
  return labels[type] || type;
};

const getTypeColor = (type: EmergencyContact["type"]): string => {
  const colors: Record<EmergencyContact["type"], string> = {
    policia: "bg-blue-500/10 text-blue-300 border-blue-500/50",
    bombeiro: "bg-red-500/10 text-red-300 border-red-500/50",
    defesa_civil: "bg-orange-500/10 text-orange-300 border-orange-500/50",
    disk_denuncia: "bg-purple-500/10 text-purple-300 border-purple-500/50",
    violencia_mulher: "bg-pink-500/10 text-pink-300 border-pink-500/50",
    samu: "bg-emerald-500/10 text-emerald-300 border-emerald-500/50",
    outro: "bg-slate-500/10 text-slate-300 border-slate-500/50",
  };
  return colors[type] || "bg-slate-500/10 text-slate-300 border-slate-500/50";
};

export function EmergenciesManager() {
  const { cityId } = useCity();
  const { admin } = useAuth();
  
  // Estados para configuração do módulo
  const [showMenuFormModal, setShowMenuFormModal] = useState(false);
  const [showEnableConfirmModal, setShowEnableConfirmModal] = useState(false);
  const [showDisableConfirmModal, setShowDisableConfirmModal] = useState(false);
  const [showContactFormModal, setShowContactFormModal] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  
  // Hooks
  const { data: contacts, isLoading } = useEmergencyContacts(cityId);
  const { data: mobileConfig } = useMobileConfig(cityId);
  const updateMobileConfigMutation = useUpdateMobileConfig();
  const { data: menuData } = useCityMenu(cityId);
  const updateMenuMutation = useUpdateCityMenu();
  const deleteContact = useDeleteEmergencyContact();
  
  const isModuleEnabled = mobileConfig?.showEmergencies || false;
  const emergenciesMenuItem = menuData?.find((item) => item.id === "emergencies");
  
  // Verificar se apenas super admin ou prefeito podem habilitar
  const canToggleModule = admin?.isSuperAdmin || admin?.isMayor;

  // Handler para salvar menu item
  const handleSaveMenuItem = async (menuItem: Omit<MenuItem, "id">) => {
    if (!cityId || !menuData) return;
    
    const newMenuItem: MenuItem = {
      id: "emergencies",
      ...menuItem,
    };
    
    // Verificar se já existe item "emergencies" no menu
    const existingIndex = menuData.findIndex((item) => item.id === "emergencies");
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
        payload: { showEmergencies: true },
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
        payload: { showEmergencies: false },
      });
      setShowDisableConfirmModal(false);
    } catch (error) {
      console.error("Erro ao desabilitar módulo:", error);
    }
  };

  // Handler para criar/editar contato
  const handleOpenContactForm = (contact?: EmergencyContact) => {
    setEditingContact(contact || null);
    setShowContactFormModal(true);
  };

  const handleCloseContactForm = () => {
    setEditingContact(null);
    setShowContactFormModal(false);
  };

  // Handler para deletar contato
  const handleDeleteContact = async (contact: EmergencyContact) => {
    if (!cityId) return;
    
    if (!confirm(`Tem certeza que deseja excluir "${contact.name}"?`)) {
      return;
    }

    try {
      await deleteContact.mutateAsync({ id: contact._id, cityId });
    } catch (error) {
      // Erro já tratado no hook
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
        <p className="text-slate-400">Selecione uma cidade para gerenciar telefones de emergência.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-200">
          Gerenciar Telefones de Emergência
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Cadastre e gerencie telefones de emergência e serviços públicos para o aplicativo mobile
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
                Configuração do Módulo de Emergências
              </h3>
              <p className="text-sm text-slate-400">
                {isModuleEnabled
                  ? "Módulo habilitado - aparece no app mobile"
                  : "Módulo desabilitado - não aparece no app mobile"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {!emergenciesMenuItem && (
              <button
                onClick={() => setShowMenuFormModal(true)}
                className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 transition-colors"
              >
                Criar Item do Menu
              </button>
            )}
            {emergenciesMenuItem && canToggleModule && (
              <button
                onClick={() => handleToggleModule(!isModuleEnabled)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  isModuleEnabled
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-emerald-500 hover:bg-emerald-600 text-white"
                }`}
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
            {emergenciesMenuItem && (
              <button
                onClick={() => setShowMenuFormModal(true)}
                className="flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-600 transition-colors"
              >
                Editar Item do Menu
              </button>
            )}
          </div>
        </div>
        
        {emergenciesMenuItem && (
          <div className="mt-4 p-4 rounded-lg bg-slate-900/50 border border-slate-600">
            <h4 className="text-sm font-medium text-slate-300 mb-2">Item do Menu Atual:</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-400">Label:</span>
                <span className="ml-2 text-slate-200">{emergenciesMenuItem.label}</span>
              </div>
              <div>
                <span className="text-slate-400">Cor:</span>
                <span
                  className="ml-2 inline-block w-6 h-6 rounded border border-slate-600"
                  style={{ backgroundColor: emergenciesMenuItem.bgColor }}
                />
                <span className="ml-2 text-slate-200">{emergenciesMenuItem.bgColor}</span>
              </div>
              <div>
                <span className="text-slate-400">Ícone:</span>
                <span className="ml-2 text-slate-200">{emergenciesMenuItem.iconName}</span>
              </div>
              {emergenciesMenuItem.description && (
                <div className="col-span-2">
                  <span className="text-slate-400">Descrição:</span>
                  <span className="ml-2 text-slate-200">{emergenciesMenuItem.description}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Lista de Telefones */}
      <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-200">
              Telefones de Emergência
            </h3>
            <p className="text-sm text-slate-400">
              {contacts?.length || 0} {contacts?.length === 1 ? "telefone cadastrado" : "telefones cadastrados"}
            </p>
          </div>
          <button
            onClick={() => handleOpenContactForm()}
            className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 transition-colors"
          >
            <Plus className="size-4" />
            Adicionar Telefone
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-8 animate-spin text-emerald-400" />
          </div>
        ) : !contacts || contacts.length === 0 ? (
          <div className="text-center py-12">
            <Phone className="size-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">Nenhum telefone de emergência cadastrado</p>
            <button
              onClick={() => handleOpenContactForm()}
              className="mt-4 text-emerald-400 hover:text-emerald-300 text-sm font-medium"
            >
              Adicionar o primeiro telefone
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {contacts
              .filter((c) => c.isActive)
              .sort((a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name))
              .map((contact) => (
                <div
                  key={contact._id}
                  className="rounded-lg border border-slate-600 bg-slate-700/50 p-4 hover:bg-slate-700 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-base font-semibold text-slate-200">{contact.name}</h4>
                        <span className={`px-2 py-1 rounded text-xs font-medium border ${getTypeColor(contact.type)}`}>
                          {getTypeLabel(contact.type)}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-300">
                        <div className="flex items-center gap-2">
                          <Phone className="size-4" />
                          <span>{contact.phone}</span>
                        </div>
                        {contact.alternativePhone && (
                          <div className="flex items-center gap-2">
                            <Phone className="size-4" />
                            <span>{contact.alternativePhone}</span>
                          </div>
                        )}
                        {contact.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="size-4" />
                            <span className="text-slate-400">{contact.location.address}</span>
                          </div>
                        )}
                      </div>
                      {contact.description && (
                        <p className="mt-2 text-sm text-slate-400">{contact.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleOpenContactForm(contact)}
                        className="rounded-lg p-2 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                        title="Editar"
                      >
                        <Edit className="size-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteContact(contact)}
                        className="rounded-lg p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showMenuFormModal && (
        <MenuFormModal
          existingItem={emergenciesMenuItem}
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

      {showContactFormModal && (
        <EmergencyContactFormModal
          isOpen={showContactFormModal}
          onClose={handleCloseContactForm}
          contact={editingContact}
        />
      )}
    </div>
  );
}


