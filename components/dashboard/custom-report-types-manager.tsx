"use client";

import { useState, useEffect, useRef } from "react";
import { useCity } from "@/context/city-context";
import { useAuth } from "@/context/auth-context";
import {
  Loader2,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Crown,
  Shield,
  AlertTriangle,
} from "lucide-react";
import { ServiceUnavailable } from "../errors/service-unavailable";
import { toast } from "react-hot-toast";
import apiClient from "@/lib/api-client";

type ReportType = {
  id: string;
  label: string;
  secretaria?: string;
  isCustom?: boolean;
  allowedSecretarias?: string[];
  isActive?: boolean;
  createdBy?: {
    adminId: string;
    adminName: string;
    role: string;
  };
  createdAt?: string;
  updatedAt?: string;
};

type Secretaria = {
  id: string;
  label: string;
};

export function CustomReportTypesManager() {
  const { cityId } = useCity();
  const { admin } = useAuth();
  const [types, setTypes] = useState<ReportType[]>([]);
  const [secretarias, setSecretarias] = useState<Secretaria[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [waitingForCity, setWaitingForCity] = useState(true);
  const [actionModal, setActionModal] = useState<{
    isOpen: boolean;
    action: "deactivate" | "activate" | "delete";
    typeId?: string;
    multiple?: boolean;
  }>({ isOpen: false, action: "deactivate" });

  // Permitir que secretarias vejam o componente e tenham acesso completo ao CRUD
  const hasPermission = admin?.isMayor || admin?.isSuperAdmin || (admin?.secretaria && !admin?.isMayor && !admin?.isSuperAdmin);
  const isSuperAdmin = admin?.isSuperAdmin ?? false;
  const isMayor = admin?.isMayor ?? false;
  const isSecretaria = !isSuperAdmin && !isMayor && !!admin?.secretaria;
  // secretaria pode ser string ou objeto com id
  const secretariaId = typeof admin?.secretaria === 'string' 
    ? admin.secretaria 
    : (admin?.secretaria as any)?.id || admin?.secretaria;

  useEffect(() => {
    // Aguardar até que cityId seja válido (não undefined, null, ou vazio)
    if (!cityId || cityId.trim() === "") {
      setWaitingForCity(true);
      setLoading(true);
      return;
    }

    // Se chegou aqui, cityId é válido
    setWaitingForCity(false);
    fetchData();
  }, [cityId]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.report-types-dropdown')) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [dropdownOpen]);

  const [cityNotFound, setCityNotFound] = useState(false);

  const fetchData = async () => {
    // Validação adicional: não fazer requisição se cityId não for válido
    if (!cityId || cityId.trim() === "") {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setCityNotFound(false);
      const [typesResponse, cityResponse] = await Promise.all([
        apiClient.get<ReportType[]>(`/api/cities/report-types/${cityId}`),
        apiClient.get<any>(`/api/cities/getCityById/${cityId}`),
      ]);

      setTypes(typesResponse.data);
      setSecretarias(cityResponse.data?.secretarias || []);
    } catch (error: any) {
      console.error("Erro ao buscar dados:", error);
      
      // Verificar se é erro 404 (cidade não encontrada)
      if (error?.response?.status === 404) {
        setCityNotFound(true);
        return;
      }
      
      toast.error("Erro ao carregar tipos de sugestões");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (label: string, allowedSecretarias: string[]) => {
    if (!cityId) return;

    // Se for secretaria, garantir que só envia sua própria secretaria
    let finalAllowedSecretarias = allowedSecretarias;
    if (isSecretaria && secretariaId) {
      finalAllowedSecretarias = [secretariaId];
    }

    try {
      const response = await apiClient.post<{
        message: string;
        reportType: ReportType;
      }>(`/api/cities/report-types/${cityId}`, {
        label,
        allowedSecretarias: finalAllowedSecretarias,
      });

      setTypes((prev) => [...prev, response.data.reportType]);
      toast.success("Tipo criado com sucesso!");
      setIsCreating(false);
    } catch (error: any) {
      console.error("Erro ao criar tipo:", error);
      toast.error(
        error?.response?.data?.message || "Erro ao criar tipo"
      );
    }
  };

  const handleUpdate = async (
    typeId: string,
    label: string,
    allowedSecretarias: string[]
  ) => {
    if (!cityId) return;

    try {
      const response = await apiClient.put<{
        message: string;
        reportType: ReportType;
      }>(`/api/cities/report-types/${cityId}/${typeId}`, {
        label,
        allowedSecretarias,
      });

      setTypes((prev) =>
        prev.map((t) => (t.id === typeId ? response.data.reportType : t))
      );
      toast.success("Tipo atualizado com sucesso!");
      setEditingId(null);
    } catch (error: any) {
      console.error("Erro ao atualizar tipo:", error);
      toast.error(
        error?.response?.data?.message || "Erro ao atualizar tipo"
      );
    }
  };

  const handleToggleStatus = async (typeId: string, isActive: boolean) => {
    if (!cityId) return;

    try {
      const response = await apiClient.patch<{
        message: string;
        reportType: ReportType;
      }>(`/api/cities/report-types/${cityId}/${typeId}/status`, {
        isActive,
      });

      setTypes((prev) =>
        prev.map((t) => (t.id === typeId ? response.data.reportType : t))
      );
      setSelectedIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(typeId);
        return newSet;
      });
      toast.success(
        isActive ? "Tipo reativado com sucesso!" : "Tipo desativado com sucesso!"
      );
      setActionModal({ isOpen: false, action: "deactivate" });
    } catch (error: any) {
      console.error("Erro ao alterar status do tipo:", error);
      toast.error(
        error?.response?.data?.message || "Erro ao alterar status do tipo"
      );
    }
  };

  const handleDelete = async (typeId: string) => {
    if (!cityId) return;

    try {
      setIsDeleting(true);
      await apiClient.delete(`/api/cities/report-types/${cityId}/${typeId}`);

      setTypes((prev) => prev.filter((t) => t.id !== typeId));
      setSelectedIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(typeId);
        return newSet;
      });
      toast.success("Tipo deletado com sucesso!");
      setActionModal({ isOpen: false, action: "delete" });
    } catch (error: any) {
      console.error("Erro ao deletar tipo:", error);
      toast.error(
        error?.response?.data?.message || "Erro ao deletar tipo"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeactivateMultiple = async () => {
    if (!cityId || selectedIds.size === 0) return;

    try {
      setIsDeleting(true);
      const response = await apiClient.post<{
        message: string;
        deactivatedCount: number;
        errors?: string[];
      }>(`/api/cities/report-types/${cityId}/deactivate-multiple`, {
        typeIds: Array.from(selectedIds),
      });

      if (response.data.errors && response.data.errors.length > 0) {
        toast.error(
          `${response.data.deactivatedCount} desativado(s), mas houve erros: ${response.data.errors.join(", ")}`
        );
      } else {
        toast.success(`${response.data.deactivatedCount} tipo(s) desativado(s) com sucesso!`);
      }

      setSelectedIds(new Set());
      setActionModal({ isOpen: false, action: "deactivate" });
      await fetchData();
    } catch (error: any) {
      console.error("Erro ao desativar tipos:", error);
      toast.error(
        error?.response?.data?.message || "Erro ao desativar tipos"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleActivateMultiple = async () => {
    if (!cityId || selectedIds.size === 0) return;

    try {
      setIsDeleting(true);
      const response = await apiClient.post<{
        message: string;
        activatedCount: number;
        errors?: string[];
      }>(`/api/cities/report-types/${cityId}/activate-multiple`, {
        typeIds: Array.from(selectedIds),
      });

      if (response.data.errors && response.data.errors.length > 0) {
        toast.error(
          `${response.data.activatedCount} ativado(s), mas houve erros: ${response.data.errors.join(", ")}`
        );
      } else {
        toast.success(`${response.data.activatedCount} tipo(s) ativado(s) com sucesso!`);
      }

      setSelectedIds(new Set());
      setActionModal({ isOpen: false, action: "activate" });
      await fetchData();
    } catch (error: any) {
      console.error("Erro ao ativar tipos:", error);
      toast.error(
        error?.response?.data?.message || "Erro ao ativar tipos"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleSelection = (typeId: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(typeId)) {
      newSelected.delete(typeId);
    } else {
      newSelected.add(typeId);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = (includeInactive: boolean = false) => {
    // Se includeInactive for true, seleciona todos (ativos e inativos) que podem ser alterados
    // Se false, seleciona apenas os ativos que podem ser desativados
    const selectableTypes = includeInactive
      ? types.filter((t) => (canDeactivate(t) && t.isActive !== false) || (canActivate(t) && t.isActive === false))
      : types.filter((t) => canDeactivate(t) && t.isActive !== false);
    
    if (selectedIds.size === selectableTypes.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(selectableTypes.map((t) => t.id)));
    }
  };

  const canEdit = (type: ReportType): boolean => {
    // Super Admin: pode editar TODOS os tipos (padrão + personalizados, criados por qualquer admin)
    if (isSuperAdmin) return true;
    // Prefeitos podem editar todos os tipos personalizados
    if (isMayor && type.isCustom) return true;
    // Secretarias só podem editar tipos que criaram ou que estão associados à sua secretaria
    if (isSecretaria && secretariaId && type.isCustom) {
      if (type.createdBy?.adminId === admin?.userId) return true;
      if (type.allowedSecretarias?.includes(secretariaId)) return true;
    }
    return false;
  };

  const canDeactivate = (type: ReportType): boolean => {
    // Super Admin: pode desativar TODOS os tipos (padrão + personalizados, criados por qualquer admin)
    if (isSuperAdmin) return true;
    // Prefeitos podem desativar TODOS os tipos (padrão + personalizados)
    if (isMayor) return true;
    // Secretarias só podem desativar tipos personalizados que criaram OU que estão associados à sua secretaria
    // Secretarias NÃO podem desativar tipos padrão
    if (isSecretaria && secretariaId && type.isCustom) {
      // Se criou, pode desativar
      if (type.createdBy?.adminId === admin?.userId) return true;
      // Se está em allowedSecretarias e é da sua secretaria, pode desativar
      if (type.allowedSecretarias?.includes(secretariaId)) return true;
    }
    return false;
  };

  const canActivate = (type: ReportType): boolean => {
    // Super Admin: pode ativar TODOS os tipos (padrão + personalizados, criados por qualquer admin)
    if (isSuperAdmin) return true;
    // Prefeitos podem ativar TODOS os tipos (padrão + personalizados)
    if (isMayor) return true;
    // Secretarias só podem ativar tipos personalizados que criaram OU que estão associados à sua secretaria
    // Secretarias NÃO podem ativar tipos padrão
    if (isSecretaria && secretariaId && type.isCustom) {
      // Se criou, pode ativar
      if (type.createdBy?.adminId === admin?.userId) return true;
      // Se está em allowedSecretarias e é da sua secretaria, pode ativar
      if (type.allowedSecretarias?.includes(secretariaId)) return true;
    }
    return false;
  };

  const canDelete = (type: ReportType): boolean => {
    // Super Admin: pode deletar TODOS os tipos (padrão + personalizados)
    if (isSuperAdmin) return true;
    // Prefeitos podem deletar TODOS os tipos (padrão + personalizados)
    // Isso inclui tipos padrão do sistema
    if (isMayor) return true;
    // Secretarias só podem deletar tipos personalizados que criaram
    // Secretarias NÃO podem deletar tipos padrão
    if (isSecretaria && type.isCustom && type.createdBy?.adminId === admin?.userId) {
      return true;
    }
    return false;
  };

  const getSelectedTypesLabels = (): string => {
    if (selectedIds.size === 0) return "Nenhum selecionado";
    if (selectedIds.size === 1) {
      const type = types.find((t) => selectedIds.has(t.id));
      return type?.label || "1 tipo selecionado";
    }
    return `${selectedIds.size} tipos selecionados`;
  };

  if (cityNotFound) {
    return (
      <ServiceUnavailable
        message="Cidade não encontrada ou serviço indisponível no momento"
        onRetry={fetchData}
        showHomeButton={false}
      />
    );
  }

  // Mostrar loading enquanto aguarda cidade válida ou carrega dados
  if (waitingForCity || loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-8 animate-spin text-emerald-400" />
        {waitingForCity && (
          <span className="ml-3 text-sm text-slate-400">Aguardando seleção de cidade...</span>
        )}
      </div>
    );
  }

  const deactivatableTypes = types.filter((t) => canDeactivate(t) && t.isActive !== false);
  const activatableTypes = types.filter((t) => canActivate(t) && t.isActive === false);
  const editableTypes = types.filter((t) => canEdit(t));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-200">
            Tipos de Sugestões de Melhorias
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Gerencie todos os tipos de sugestões disponíveis (padrão e personalizados) - Estas sugestões de melhoria irão aparecer para o usuário no aplicativo mobile.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {selectedIds.size > 0 && (() => {
            const selectedTypes = types.filter((t) => selectedIds.has(t.id));
            const activeCount = selectedTypes.filter((t) => t.isActive !== false).length;
            const inactiveCount = selectedTypes.filter((t) => t.isActive === false).length;

            return (
              <>
                {activeCount > 0 && (
                  <button
                    onClick={() => setActionModal({ isOpen: true, action: "deactivate", multiple: true })}
                    className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-600"
                  >
                    <AlertTriangle className="size-4" />
                    Desativar {activeCount} {activeCount === 1 ? "Tipo" : "Tipos"}
                  </button>
                )}
                {inactiveCount > 0 && (
                  <button
                    onClick={() => setActionModal({ isOpen: true, action: "activate", multiple: true })}
                    className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
                  >
                    <CheckCircle2 className="size-4" />
                    Ativar {inactiveCount} {inactiveCount === 1 ? "Tipo" : "Tipos"}
                  </button>
                )}
              </>
            );
          })()}
          {hasPermission && !isCreating && (
            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
            >
              <Plus className="size-4" />
              Criar Tipo
            </button>
          )}
        </div>
      </div>

      {/* Formulário de Criação */}
      {isCreating && (
        <TypeForm
          secretarias={secretarias}
          onSave={(label, allowedSecretarias) => {
            handleCreate(label, allowedSecretarias);
          }}
          onCancel={() => setIsCreating(false)}
        />
      )}

      {/* Dropdown de Seleção */}
      {types.length > 0 && (
        <div className="space-y-4">
          <div className="relative report-types-dropdown">
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full flex items-center justify-between rounded-lg border border-slate-600 bg-slate-900 px-4 py-3 text-left text-slate-200 hover:border-slate-500 transition-colors"
            >
              <span className="text-sm">
                {getSelectedTypesLabels()}
              </span>
              <ChevronDown
                className={`size-5 text-slate-400 transition-transform ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {dropdownOpen && (
              <div className="absolute z-10 mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 shadow-xl max-h-96 overflow-y-auto">
                <div className="p-2">
                  {/* Header com selecionar todos */}
                  {(deactivatableTypes.length > 0 || activatableTypes.length > 0) && (
                    <div className="mb-2 border-b border-slate-700 pb-2 space-y-1">
                      {deactivatableTypes.length > 0 && (
                        <button
                          onClick={() => toggleSelectAll(false)}
                          className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          {selectedIds.size === deactivatableTypes.length &&
                          selectedIds.size > 0 &&
                          Array.from(selectedIds).every((id) =>
                            deactivatableTypes.some((t) => t.id === id)
                          )
                            ? "Desmarcar Todos (Ativos)"
                            : "Selecionar Todos Ativos"}
                        </button>
                      )}
                      {activatableTypes.length > 0 && (
                        <button
                          onClick={() => toggleSelectAll(true)}
                          className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          Selecionar Todos (Ativos + Inativos)
                        </button>
                      )}
                    </div>
                  )}

                  {/* Lista de tipos */}
                  <div className="space-y-1">
                    {types.map((type) => {
                      const isSelected = selectedIds.has(type.id);
                      const canDeactivateType = canDeactivate(type) && type.isActive !== false;
                      const canActivateType = canActivate(type) && type.isActive === false;
                      const canEditType = canEdit(type);
                      const canDeleteType = canDelete(type);

                      return (
                        <div
                          key={type.id}
                          className={`flex items-center gap-3 rounded-lg p-3 transition-colors ${
                            isSelected
                              ? "bg-emerald-500/20 border border-emerald-500/50"
                              : type.isActive === false
                              ? "bg-slate-800/30 opacity-75"
                              : "hover:bg-slate-800"
                          }`}
                        >
                          {/* Checkbox para seleção (ativos e inativos) */}
                          {(canDeactivateType || canActivateType) && (
                            <button
                              onClick={() => toggleSelection(type.id)}
                              className="text-emerald-400 hover:text-emerald-300"
                            >
                              {isSelected ? (
                                <CheckCircle2 className="size-5" />
                              ) : (
                                <div className="size-5 rounded border-2 border-slate-600" />
                              )}
                            </button>
                          )}
                          {!canDeactivateType && !canActivateType && <div className="size-5" />}

                          {/* Ícone do tipo */}
                          <div className="flex-shrink-0">
                            {type.isCustom ? (
                              <Crown className="size-4 text-emerald-400" />
                            ) : (
                              <Shield className="size-4 text-blue-400" />
                            )}
                          </div>

                          {/* Label */}
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${
                              type.isActive === false ? "text-slate-500 line-through" : "text-slate-200"
                            }`}>
                              {type.label}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              {type.isCustom ? (
                                <span className="text-xs text-emerald-400">Personalizado</span>
                              ) : (
                                <span className="text-xs text-blue-400">Padrão</span>
                              )}
                              {type.isActive === false ? (
                                <span className="text-xs text-amber-400 font-medium">● Inativo</span>
                              ) : (
                                <span className="text-xs text-emerald-400 font-medium">● Ativo</span>
                              )}
                            </div>
                          </div>

                          {/* Botões de ação */}
                          <div className="flex items-center gap-2">
                            {canEditType && (
                              <button
                                onClick={() => {
                                  setEditingId(type.id);
                                  setDropdownOpen(false);
                                }}
                                className="rounded-lg border border-slate-600 bg-slate-800 p-2 text-slate-300 transition-colors hover:bg-slate-700"
                                title="Editar"
                              >
                                <Edit className="size-4" />
                              </button>
                            )}
                            {canDeactivateType && (
                              <button
                                onClick={() => {
                                  setActionModal({ isOpen: true, action: "deactivate", typeId: type.id, multiple: false });
                                }}
                                className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-2 text-amber-400 transition-colors hover:bg-amber-500/20"
                                title="Desativar"
                              >
                                <AlertTriangle className="size-4" />
                              </button>
                            )}
                            {canActivateType && (
                              <button
                                onClick={() => {
                                  handleToggleStatus(type.id, true);
                                }}
                                className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2 text-emerald-400 transition-colors hover:bg-emerald-500/20"
                                title="Reativar"
                              >
                                <CheckCircle2 className="size-4" />
                              </button>
                            )}
                            {canDeleteType && (
                              <button
                                onClick={() => {
                                  setActionModal({ isOpen: true, action: "delete", typeId: type.id, multiple: false });
                                }}
                                className="rounded-lg border border-red-500/30 bg-red-500/10 p-2 text-red-400 transition-colors hover:bg-red-500/20"
                                title="Deletar"
                              >
                                <Trash2 className="size-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Indicador de seleção (apenas para 1 tipo selecionado) */}
          {selectedIds.size === 1 && (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3">
              <p className="text-sm text-emerald-400">
                <strong>1 tipo selecionado:</strong>{" "}
                {types.find((t) => selectedIds.has(t.id))?.label}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Formulário de Edição */}
      {editingId && (
        <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-200">Editar Tipo</h3>
            <button
              onClick={() => setEditingId(null)}
              className="text-slate-400 hover:text-slate-200"
            >
              <X className="size-5" />
            </button>
          </div>
          <TypeForm
            secretarias={secretarias}
            type={types.find((t) => t.id === editingId)}
            onSave={(label, allowedSecretarias) => {
              if (editingId) {
                handleUpdate(editingId, label, allowedSecretarias);
              }
            }}
            onCancel={() => setEditingId(null)}
          />
        </div>
      )}

      {/* Empty State */}
      {types.length === 0 && !isCreating && (
        <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-8 text-center">
          <AlertCircle className="mx-auto size-12 text-slate-500" />
          <p className="mt-4 text-slate-400">
            Nenhum tipo de sugestão cadastrado ainda.
          </p>
          {hasPermission && (
            <p className="mt-2 text-sm text-slate-500">
              Clique em "Criar Tipo" para começar.
            </p>
          )}
        </div>
      )}

      {/* Modal de Confirmação de Ativação/Desativação */}
      {actionModal.isOpen && (
        <StatusConfirmationModal
          isOpen={actionModal.isOpen}
          action={actionModal.action}
          typeId={actionModal.typeId}
          multiple={actionModal.multiple}
          types={types}
          selectedIds={selectedIds}
          isDeleting={isDeleting}
          onConfirm={() => {
            if (actionModal.multiple) {
              if (actionModal.action === "deactivate") {
                handleDeactivateMultiple();
              } else {
                handleActivateMultiple();
              }
            } else if (actionModal.typeId) {
              if (actionModal.action === "delete") {
                handleDelete(actionModal.typeId);
              } else {
                handleToggleStatus(actionModal.typeId, actionModal.action === "activate");
              }
            }
          }}
          onCancel={() => setActionModal({ isOpen: false, action: "deactivate" })}
        />
      )}
    </div>
  );
}

type TypeFormProps = {
  secretarias: Secretaria[];
  type?: ReportType;
  onSave: (label: string, allowedSecretarias: string[]) => void;
  onCancel: () => void;
};

function TypeForm({ secretarias, type, onSave, onCancel }: TypeFormProps) {
  const { admin } = useAuth();
  const isSecretaria = !admin?.isSuperAdmin && !admin?.isMayor && !!admin?.secretaria;
  const secretariaId = typeof admin?.secretaria === 'string' 
    ? admin.secretaria 
    : (admin?.secretaria as any)?.id || admin?.secretaria;
  
  const [label, setLabel] = useState(type?.label || "");
  // Se for secretaria criando novo tipo, já começar com sua secretaria selecionada
  const initialSecretarias = isSecretaria && !type 
    ? [secretariaId].filter(Boolean)
    : (type?.allowedSecretarias || []);
  const [selectedSecretarias, setSelectedSecretarias] = useState<string[]>(initialSecretarias);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) {
      toast.error("O nome do tipo é obrigatório");
      return;
    }
    onSave(label.trim(), selectedSecretarias);
  };

  const toggleSecretaria = (secretariaId: string) => {
    setSelectedSecretarias((prev) =>
      prev.includes(secretariaId)
        ? prev.filter((id) => id !== secretariaId)
        : [...prev, secretariaId]
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Nome do Tipo *
        </label>
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Ex: Coleta irregular de lixo na cidade"
          className="w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-2 text-slate-200 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
          required
        />
      </div>

      {type?.isCustom !== false && (
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Secretarias Permitidas
          </label>
          {isSecretaria ? (
            <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-3">
              <p className="text-sm text-slate-400">
                Este tipo será automaticamente associado à sua secretaria ({secretarias.find(s => s.id === secretariaId)?.label || 'Sua Secretaria'}).
              </p>
            </div>
          ) : (
            <>
              <p className="mb-3 text-xs text-slate-500">
                Selecione quais secretarias podem usar este tipo ao criar sugestões.
                Deixe vazio para permitir todas.
              </p>
              {secretarias.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Nenhuma secretaria cadastrada nesta cidade.
                </p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {secretarias.map((secretaria) => (
                    <label
                      key={secretaria.id}
                      className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-900/50 p-3 cursor-pointer hover:bg-slate-900 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedSecretarias.includes(secretaria.id)}
                        onChange={() => toggleSecretaria(secretaria.id)}
                        className="rounded border-slate-600 text-emerald-500 focus:ring-emerald-500"
                      />
                      <span className="text-sm text-slate-300">
                        {secretaria.label}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      <div className="flex items-center gap-3 pt-4">
        <button
          type="submit"
          className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
        >
          <Save className="size-4" />
          {type ? "Salvar Alterações" : "Criar Tipo"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-700"
        >
          <X className="size-4" />
          Cancelar
        </button>
      </div>
    </form>
  );
}

type StatusConfirmationModalProps = {
  isOpen: boolean;
  action: "deactivate" | "activate" | "delete";
  typeId?: string;
  multiple?: boolean;
  types: ReportType[];
  selectedIds: Set<string>;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

function StatusConfirmationModal({
  isOpen,
  action,
  typeId,
  multiple,
  types,
  selectedIds,
  isDeleting,
  onConfirm,
  onCancel,
}: StatusConfirmationModalProps) {
  if (!isOpen) return null;

  const typesToChange = multiple
    ? types.filter((t) => selectedIds.has(t.id))
    : typeId
    ? [types.find((t) => t.id === typeId)].filter(Boolean) as ReportType[]
    : [];

  const isActivating = action === "activate";
  const isDeletingAction = action === "delete";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-lg border border-slate-700 bg-slate-900 shadow-xl">
        {/* Header */}
        <div className="flex items-center gap-4 border-b border-slate-700 p-6">
          <div className={`flex size-12 items-center justify-center rounded-full ${
            isDeletingAction ? "bg-red-500/20" : isActivating ? "bg-emerald-500/20" : "bg-amber-500/20"
          }`}>
            {isDeletingAction ? (
              <Trash2 className="size-6 text-red-400" />
            ) : isActivating ? (
              <CheckCircle2 className="size-6 text-emerald-400" />
            ) : (
              <AlertTriangle className="size-6 text-amber-400" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-200">
              {isDeletingAction ? "Confirmar Exclusão" : `Confirmar ${isActivating ? "Ativação" : "Desativação"}`}
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              {isDeletingAction
                ? "Esta ação não pode ser desfeita"
                : isActivating
                ? "O tipo será exibido no aplicativo mobile"
                : "O tipo será ocultado do aplicativo mobile"}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="mb-4 text-sm text-slate-300">
            {multiple
              ? `Tem certeza que deseja ${isDeletingAction ? "deletar" : isActivating ? "ativar" : "desativar"} ${typesToChange.length} tipo(s)?`
              : `Tem certeza que deseja ${isDeletingAction ? "deletar" : isActivating ? "ativar" : "desativar"} o tipo "${typesToChange[0]?.label}"?`}
          </p>

          {typesToChange.length > 0 && (
            <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg border border-slate-700 bg-slate-800/50 p-4">
              {typesToChange.map((type) => (
                <div
                  key={type.id}
                  className="flex items-center gap-3 rounded-lg bg-slate-900/50 p-3"
                >
                  {type.isCustom ? (
                    <Crown className="size-4 text-emerald-400" />
                  ) : (
                    <Shield className="size-4 text-blue-400" />
                  )}
                  <span className="flex-1 text-sm font-medium text-slate-200">
                    {type.label}
                  </span>
                  {type.isCustom ? (
                    <span className="text-xs text-emerald-400">Personalizado</span>
                  ) : (
                    <span className="text-xs text-blue-400">Padrão</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {!isDeletingAction && (
            <div className={`mt-4 rounded-lg border p-3 ${
              isActivating
                ? "border-emerald-500/30 bg-emerald-500/10"
                : "border-amber-500/30 bg-amber-500/10"
            }`}>
              <p className={`text-xs ${
                isActivating ? "text-emerald-400" : "text-amber-400"
              }`}>
                <strong className="font-semibold">Atenção:</strong>{" "}
                {isActivating
                  ? "Os tipos ativados aparecerão novamente no aplicativo mobile para novos reports."
                  : "Os tipos desativados não aparecerão mais no aplicativo mobile para novos reports, mas você pode reativá-los a qualquer momento. Os reports já criados continuarão existindo normalmente."}
              </p>
            </div>
          )}
          {isDeletingAction && (
            <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3">
              <p className="text-xs text-red-400">
                <strong className="font-semibold">Atenção:</strong>{" "}
                Esta ação é permanente e não pode ser desfeita. O tipo será completamente removido do sistema e não poderá ser recuperado.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-700 p-6">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-700 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50 ${
              isDeletingAction
                ? "bg-red-500 hover:bg-red-600"
                : isActivating
                ? "bg-emerald-500 hover:bg-emerald-600"
                : "bg-amber-500 hover:bg-amber-600"
            }`}
          >
            {isDeleting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                {isDeletingAction ? "Deletando..." : isActivating ? "Ativando..." : "Desativando..."}
              </>
            ) : (
              <>
                {isDeletingAction ? (
                  <Trash2 className="size-4" />
                ) : isActivating ? (
                  <CheckCircle2 className="size-4" />
                ) : (
                  <AlertTriangle className="size-4" />
                )}
                Sim, {isDeletingAction ? "Deletar" : isActivating ? "Ativar" : "Desativar"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
