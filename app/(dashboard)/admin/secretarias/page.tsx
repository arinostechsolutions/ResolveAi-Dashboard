"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useCity } from "@/context/city-context";
import { useSecretariaFilter } from "@/context/secretaria-context";
import { useSecretarias, useReportTypes, Secretaria } from "@/hooks/use-secretarias";
import { SecretariasList } from "@/components/admin/secretarias-list";
import { CreateSecretariaForm } from "@/components/admin/create-secretaria-form";
import { EditSecretariaForm } from "@/components/admin/edit-secretaria-form";
import { CreateAdminForm } from "@/components/admin/create-admin-form";
import { AdminsList } from "@/components/admin/admins-list";
import { EditAdminForm } from "@/components/admin/edit-admin-form";
import { ActivityLogsList } from "@/components/admin/activity-logs-list";
import { CreateMayorForm } from "@/components/admin/create-mayor-form";
import { CitySelect } from "@/components/selects/city-select";
import { DashboardFilters, DashboardDateRange } from "@/components/dashboard/dashboard-filters";
import { Plus, Building2, ShieldAlert, Users, History, Crown } from "lucide-react";
import { AdminUser, useAdminUsers } from "@/hooks/use-admin-users";

export default function SecretariasPage() {
  const router = useRouter();
  const { admin } = useAuth();
  const { cityId } = useCity();
  const { secretariaId: globalSecretariaId } = useSecretariaFilter();
  const isSuperAdmin = admin?.isSuperAdmin ?? false;
  const isMayor = admin?.isMayor ?? false;
  const hasFullAccess = isSuperAdmin || isMayor;

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingSecretaria, setEditingSecretaria] = useState<Secretaria | null>(null);
  const [creatingAdminFor, setCreatingAdminFor] = useState<Secretaria | null>(null);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [showAdmins, setShowAdmins] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [creatingMayor, setCreatingMayor] = useState(false);
  const [selectedAdminId, setSelectedAdminId] = useState<string | undefined>();
  const [selectedActionType, setSelectedActionType] = useState<string | undefined>();
  const [selectedSecretariaId, setSelectedSecretariaId] = useState<string | undefined>();
  const [historyDateRange, setHistoryDateRange] = useState<DashboardDateRange>({});
  
  // Usar o filtro global se não houver um específico selecionado na página
  const effectiveSecretariaId = selectedSecretariaId !== undefined ? selectedSecretariaId : globalSecretariaId || undefined;

  const { data: secretariasData, isLoading: isLoadingSecretarias } = useSecretarias(cityId);
  const { data: reportTypesData, isLoading: isLoadingReportTypes } = useReportTypes(cityId);
  const { data: adminsData, isLoading: isLoadingAdmins } = useAdminUsers(cityId);

  // Filtrar administradores baseado na secretaria selecionada
  const filteredAdmins = adminsData?.admins.filter((admin) => {
    if (!selectedSecretariaId) return true; // Se não há secretaria selecionada, mostrar todos
    // Mostrar apenas admins que pertencem à secretaria selecionada
    return admin.secretaria === selectedSecretariaId;
  }) || [];

  // Redirecionar se não for super admin nem prefeito
  if (typeof window !== "undefined" && !hasFullAccess) {
    router.replace("/dashboard");
    return null;
  }

  if (!hasFullAccess) {
    return null;
  }

  const handleCreateSuccess = () => {
    setShowCreateForm(false);
  };

  const handleEditSuccess = () => {
    setEditingSecretaria(null);
  };

  const handleCreateAdminSuccess = () => {
    setCreatingAdminFor(null);
  };

  const handleEditAdminSuccess = () => {
    setEditingAdmin(null);
  };

  const handleCreateMayorSuccess = () => {
    setCreatingMayor(false);
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      <header className="mb-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-white">
              Gerenciamento de Secretarias
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-400">
              Configure secretarias e crie administradores para cada uma delas.
            </p>
          </div>
          <div className="shrink-0">
            <CitySelect />
          </div>
        </div>
      </header>

      {/* Tabs */}
      {cityId && (
        <div className="flex gap-1 sm:gap-2 border-b border-slate-800 overflow-x-auto">
          <button
            onClick={() => {
              setShowAdmins(false);
              setShowHistory(false);
              setEditingSecretaria(null);
              setCreatingAdminFor(null);
              setEditingAdmin(null);
            }}
            className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition whitespace-nowrap ${
              !showAdmins && !showHistory
                ? "border-b-2 border-emerald-500 text-emerald-300"
                : "text-slate-400 hover:text-slate-300"
            }`}
          >
            Secretarias
          </button>
          <button
            onClick={() => {
              setShowAdmins(true);
              setShowHistory(false);
              setEditingSecretaria(null);
              setCreatingAdminFor(null);
              setEditingAdmin(null);
            }}
            className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition whitespace-nowrap ${
              showAdmins && !showHistory
                ? "border-b-2 border-emerald-500 text-emerald-300"
                : "text-slate-400 hover:text-slate-300"
            }`}
          >
            Administradores
          </button>
          <button
            onClick={() => {
              setShowAdmins(false);
              setShowHistory(true);
              setEditingSecretaria(null);
              setCreatingAdminFor(null);
              setEditingAdmin(null);
            }}
            className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition whitespace-nowrap ${
              showHistory
                ? "border-b-2 border-emerald-500 text-emerald-300"
                : "text-slate-400 hover:text-slate-300"
            }`}
          >
            Histórico
          </button>
        </div>
      )}

      {!cityId ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-3xl border border-slate-800 bg-slate-900/60 text-slate-400">
          <ShieldAlert className="size-12 mb-4 text-slate-500" />
          <p className="text-sm font-medium text-slate-300">
            Selecione uma cidade
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Escolha uma cidade para gerenciar suas secretarias.
          </p>
        </div>
      ) : showHistory ? (
        <>
          <div className="mb-6">
            <h2 className="mb-4 text-lg font-semibold text-white">
              Histórico de Atividades
            </h2>
            <DashboardFilters 
              currentRange={historyDateRange} 
              onApply={setHistoryDateRange} 
            />
          </div>
          <div className="mb-4 flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2">
            {isMayor && secretariasData?.secretarias && (
              <select
                value={selectedSecretariaId || ""}
                onChange={(e) => {
                  const newSecretariaId = e.target.value || undefined;
                  setSelectedSecretariaId(newSecretariaId);
                  // Limpar seleção de administrador quando mudar a secretaria
                  // para evitar mostrar um admin que não pertence à nova secretaria
                  setSelectedAdminId(undefined);
                }}
                className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs sm:text-sm text-slate-100 outline-none transition focus:border-emerald-400"
              >
                <option value="">Todas as secretarias</option>
                {secretariasData.secretarias.map((secretaria) => (
                  <option key={secretaria.id} value={secretaria.id}>
                    {secretaria.label}
                  </option>
                ))}
              </select>
            )}
            <select
              value={selectedAdminId || ""}
              onChange={(e) => setSelectedAdminId(e.target.value || undefined)}
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs sm:text-sm text-slate-100 outline-none transition focus:border-emerald-400"
            >
              <option value="">Todos os administradores</option>
              {filteredAdmins.map((admin) => (
                <option key={admin.userId} value={admin.userId}>
                  {admin.name}
                </option>
              ))}
            </select>
            <select
              value={selectedActionType || ""}
              onChange={(e) => setSelectedActionType(e.target.value || undefined)}
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs sm:text-sm text-slate-100 outline-none transition focus:border-emerald-400"
            >
              <option value="">Todas as ações</option>
              <option value="login">Login</option>
              <option value="report_status_update">Alteração de Status</option>
              <option value="admin_create">Criação de Admin</option>
              <option value="admin_update">Edição de Admin</option>
              <option value="admin_delete">Deleção de Admin</option>
              <option value="secretaria_create">Criação de Secretaria</option>
              <option value="secretaria_update">Edição de Secretaria</option>
              <option value="secretaria_delete">Deleção de Secretaria</option>
            </select>
          </div>
          <ActivityLogsList
            cityId={cityId}
            adminId={selectedAdminId}
            actionType={selectedActionType}
            secretariaId={effectiveSecretariaId}
            startDate={historyDateRange.startDate}
            endDate={historyDateRange.endDate}
          />
        </>
      ) : showAdmins ? (
        <>
          {creatingMayor ? (
            <CreateMayorForm
              cityId={cityId}
              onSuccess={handleCreateMayorSuccess}
              onCancel={() => setCreatingMayor(false)}
            />
          ) : editingAdmin ? (
            <EditAdminForm
              admin={editingAdmin}
              cityId={cityId}
              onSuccess={handleEditAdminSuccess}
              onCancel={() => setEditingAdmin(null)}
            />
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">
                  Administradores da Cidade
                </h2>
                {isSuperAdmin && !isMayor && (
                  <button
                    onClick={() => setCreatingMayor(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-medium text-amber-950 transition hover:bg-amber-400"
                  >
                    <Crown className="size-4" />
                    Criar Prefeito
                  </button>
                )}
              </div>

              {isLoadingAdmins ? (
                <div className="flex h-64 items-center justify-center rounded-3xl border border-slate-800 bg-slate-900/60 text-slate-400">
                  Carregando administradores...
                </div>
              ) : adminsData && secretariasData ? (
                <AdminsList
                  admins={adminsData.admins}
                  secretarias={secretariasData.secretarias}
                  onEdit={setEditingAdmin}
                />
              ) : (
                <div className="flex h-64 flex-col items-center justify-center rounded-3xl border border-slate-800 bg-slate-900/60 text-slate-400">
                  <Users className="size-12 mb-4 text-slate-500" />
                  <p className="text-sm font-medium text-slate-300">
                    Erro ao carregar dados
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    Tente recarregar a página.
                  </p>
                </div>
              )}
            </>
          )}
        </>
      ) : (
        <>
          {showCreateForm ? (
            <CreateSecretariaForm
              cityId={cityId}
              onSuccess={handleCreateSuccess}
              onCancel={() => setShowCreateForm(false)}
            />
          ) : editingSecretaria ? (
            <EditSecretariaForm
              secretaria={editingSecretaria}
              cityId={cityId}
              onSuccess={handleEditSuccess}
              onCancel={() => setEditingSecretaria(null)}
            />
          ) : creatingAdminFor ? (
            <CreateAdminForm
              secretaria={creatingAdminFor}
              cityId={cityId}
              onSuccess={handleCreateAdminSuccess}
              onCancel={() => setCreatingAdminFor(null)}
            />
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">
                  Secretarias da Cidade
                </h2>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-emerald-950 transition hover:bg-emerald-400"
                >
                  <Plus className="size-4" />
                  Adicionar Secretaria
                </button>
              </div>

              {isLoadingSecretarias || isLoadingReportTypes ? (
                <div className="flex h-64 items-center justify-center rounded-3xl border border-slate-800 bg-slate-900/60 text-slate-400">
                  Carregando secretarias...
                </div>
              ) : secretariasData && reportTypesData ? (
                <SecretariasList
                  secretarias={secretariasData.secretarias}
                  reportTypes={reportTypesData.reportTypes}
                  onEdit={setEditingSecretaria}
                  onCreateAdmin={setCreatingAdminFor}
                  cityId={cityId}
                />
              ) : (
                <div className="flex h-64 flex-col items-center justify-center rounded-3xl border border-slate-800 bg-slate-900/60 text-slate-400">
                  <Building2 className="size-12 mb-4 text-slate-500" />
                  <p className="text-sm font-medium text-slate-300">
                    Erro ao carregar dados
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    Tente recarregar a página.
                  </p>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

