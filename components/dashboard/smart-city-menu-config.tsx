"use client";

import { useState, useEffect } from "react";
import { useCity } from "@/context/city-context";
import { useAuth } from "@/context/auth-context";
import { useCityMenu, useUpdateCityMenu, type MenuItem } from "@/hooks/use-city-menu";
import { Settings, Edit, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { MenuFormModal } from "./smart-city/modals/menu-form-modal";

export function SmartCityMenuConfig() {
  const { cityId } = useCity();
  const { admin } = useAuth();
  const { data: menuData, isLoading } = useCityMenu(cityId);
  const updateMenuMutation = useUpdateCityMenu();

  const smartCityMenuItem = menuData?.find(
    (item) => item.id === "smartCity" || item.id === "cidade-inteligente"
  );

  const [showMenuFormModal, setShowMenuFormModal] = useState(false);

  const hasPermission =
    admin?.isMayor ||
    admin?.isSuperAdmin ||
    (admin?.secretaria && !admin?.isSuperAdmin && !admin?.isMayor);

  const handleSaveMenuItem = async (menuItem: Omit<MenuItem, "id">) => {
    if (!cityId || !menuData) return;

    const newMenuItem: MenuItem = {
      id: "smartCity",
      ...menuItem,
    };

    // Verificar se já existe item "smartCity" no menu
    const existingIndex = menuData.findIndex(
      (item) => item.id === "smartCity" || item.id === "cidade-inteligente"
    );
    const updatedMenu =
      existingIndex >= 0
        ? menuData.map((item, index) =>
            index === existingIndex ? newMenuItem : item
          )
        : [...menuData, newMenuItem];

    try {
      await updateMenuMutation.mutateAsync({ cityId, menu: updatedMenu });
      setShowMenuFormModal(false);
      toast.success("Item do menu atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar item do menu:", error);
    }
  };

  if (!hasPermission) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="size-5 animate-spin text-emerald-400" />
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-4 shadow-lg shadow-slate-900/30 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-purple-500/10 p-2">
            <Settings className="size-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-200">
              Personalização do Menu
            </h3>
            <p className="text-xs text-slate-400">
              Configure como o item "Cidade Inteligente" aparece no menu do mobile
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowMenuFormModal(true)}
          className="inline-flex items-center gap-2 rounded-xl border border-purple-500/50 bg-purple-500/10 px-3 py-2 text-xs font-medium text-purple-300 transition hover:border-purple-400 hover:bg-purple-500/20"
        >
          <Edit className="size-3" />
          {smartCityMenuItem ? "Editar" : "Configurar"}
        </button>
      </div>

      {smartCityMenuItem ? (
        <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-300">Label:</span>
            <span className="text-sm text-slate-200">{smartCityMenuItem.label}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-300">Cor:</span>
            <div className="flex items-center gap-2">
              <div
                className="size-6 rounded border border-slate-700"
                style={{ backgroundColor: smartCityMenuItem.bgColor }}
              />
              <span className="text-sm text-slate-200">
                {smartCityMenuItem.bgColor}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-300">Ícone:</span>
            <span className="text-sm text-slate-200">
              {smartCityMenuItem.iconName}
            </span>
          </div>
          {smartCityMenuItem.description && (
            <div className="flex items-start justify-between">
              <span className="text-sm font-medium text-slate-300">Descrição:</span>
              <span className="text-sm text-slate-200 text-right max-w-[60%]">
                {smartCityMenuItem.description}
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 text-center">
          <p className="text-sm text-slate-400">
            Nenhum item de menu configurado. Clique em "Configurar" para criar.
          </p>
        </div>
      )}

      {showMenuFormModal && (
        <MenuFormModal
          existingItem={smartCityMenuItem}
          onSave={handleSaveMenuItem}
          onCancel={() => setShowMenuFormModal(false)}
        />
      )}
    </div>
  );
}


