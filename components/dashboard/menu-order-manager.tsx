"use client";

import { useState, useEffect } from "react";
import { useCity } from "@/context/city-context";
import { useAuth } from "@/context/auth-context";
import { useCityMenu, useUpdateCityMenu, type MenuItem } from "@/hooks/use-city-menu";
import { Loader2, GripVertical, Save, ArrowUp, ArrowDown, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";

export function MenuOrderManager() {
  const { cityId } = useCity();
  const { admin } = useAuth();
  const { data: menuData, isLoading } = useCityMenu(cityId);
  const updateMenuMutation = useUpdateCityMenu();
  
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  const isSuperAdmin = admin?.isSuperAdmin ?? false;

  // Sincronizar menuItems quando menuData mudar (apenas se não houver mudanças locais)
  useEffect(() => {
    if (menuData && !hasChanges) {
      setMenuItems([...menuData]);
    }
  }, [menuData, hasChanges]);

  if (!isSuperAdmin) {
    return (
      <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-6 text-center">
        <AlertCircle className="mx-auto mb-4 size-12 text-red-400" />
        <p className="text-red-400 font-medium">
          Acesso negado. Apenas super administradores podem acessar esta funcionalidade.
        </p>
      </div>
    );
  }

  if (!cityId) {
    return (
      <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6 text-center">
        <p className="text-slate-400">Selecione uma cidade para gerenciar a ordem do menu.</p>
      </div>
    );
  }

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    
    const newItems = [...menuItems];
    [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
    setMenuItems(newItems);
    setHasChanges(true);
  };

  const handleMoveDown = (index: number) => {
    if (index === menuItems.length - 1) return;
    
    const newItems = [...menuItems];
    [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
    setMenuItems(newItems);
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!cityId) return;

    try {
      await updateMenuMutation.mutateAsync({
        cityId,
        menu: menuItems,
      });
      setHasChanges(false);
      toast.success("Ordem do menu salva com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar ordem do menu:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  if (!menuData || menuData.length === 0) {
    return (
      <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6 text-center">
        <p className="text-slate-400">Nenhum item de menu encontrado para esta cidade.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-200">Gerenciar Ordem do Menu Mobile</h1>
        <p className="mt-1 text-sm text-slate-400">
          Organize a ordem dos botões do menu no aplicativo mobile arrastando os itens ou usando os botões de seta.
        </p>
      </div>

      <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-200">
            Itens do Menu ({menuItems.length})
          </h3>
          {hasChanges && (
            <button
              onClick={handleSave}
              disabled={updateMenuMutation.isPending}
              className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {updateMenuMutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="size-4" />
                  Salvar Ordem
                </>
              )}
            </button>
          )}
        </div>

        <div className="space-y-2">
          {menuItems.map((item, index) => (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-900/50 p-4 hover:bg-slate-900/70 transition-colors"
            >
              <div className="flex items-center gap-2 text-slate-400">
                <GripVertical className="size-5" />
                <span className="text-sm font-medium w-8 text-center">{index + 1}</span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div
                    className="size-8 rounded flex items-center justify-center text-white font-semibold text-sm"
                    style={{ backgroundColor: item.bgColor }}
                  >
                    {item.label.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-slate-200 truncate">{item.label}</h4>
                    {item.description && (
                      <p className="text-sm text-slate-400 truncate">{item.description}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0}
                  className="p-2 rounded-lg border border-slate-600 bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Mover para cima"
                >
                  <ArrowUp className="size-4" />
                </button>
                <button
                  onClick={() => handleMoveDown(index)}
                  disabled={index === menuItems.length - 1}
                  className="p-2 rounded-lg border border-slate-600 bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Mover para baixo"
                >
                  <ArrowDown className="size-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {hasChanges && (
          <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
            <AlertCircle className="size-5 text-amber-400 mt-0.5" />
            <p className="text-sm text-amber-300">
              Você tem alterações não salvas. Clique em "Salvar Ordem" para aplicar as mudanças.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

