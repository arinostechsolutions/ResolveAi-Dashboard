"use client";

import { useState } from "react";
import { useActivityLogs, ActivityLog } from "@/hooks/use-activity-logs";
import { formatStatusLabel } from "@/lib/utils";
import {
  Clock,
  User,
  Building2,
  FileText,
  Settings,
  LogIn,
  Trash2,
  Edit,
  Plus,
  Shield,
  Calendar,
  Filter,
} from "lucide-react";

const ACTION_TYPE_LABELS: Record<string, string> = {
  login: "Login",
  logout: "Logout",
  report_status_update: "Alteração de Status",
  admin_create: "Criação de Admin",
  admin_update: "Edição de Admin",
  admin_delete: "Deleção de Admin",
  secretaria_create: "Criação de Secretaria",
  secretaria_update: "Edição de Secretaria",
  secretaria_delete: "Deleção de Secretaria",
  report_delete: "Deleção de Irregularidade",
  user_ban: "Banimento de Usuário",
  content_report_resolve: "Resolução de Denúncia",
};

const ACTION_TYPE_ICONS: Record<string, any> = {
  login: LogIn,
  logout: LogIn,
  report_status_update: Edit,
  admin_create: Plus,
  admin_update: Edit,
  admin_delete: Trash2,
  secretaria_create: Plus,
  secretaria_update: Edit,
  secretaria_delete: Trash2,
  report_delete: Trash2,
  user_ban: Shield,
  content_report_resolve: FileText,
};

const ACTION_TYPE_COLORS: Record<string, string> = {
  login: "text-emerald-400",
  logout: "text-slate-400",
  report_status_update: "text-blue-400",
  admin_create: "text-green-400",
  admin_update: "text-yellow-400",
  admin_delete: "text-red-400",
  secretaria_create: "text-green-400",
  secretaria_update: "text-yellow-400",
  secretaria_delete: "text-red-400",
  report_delete: "text-red-400",
  user_ban: "text-red-400",
  content_report_resolve: "text-blue-400",
};

type ActivityLogsListProps = {
  cityId?: string;
  adminId?: string;
  actionType?: string;
  startDate?: string;
  endDate?: string;
  secretariaId?: string;
};

export function ActivityLogsList({
  cityId,
  adminId,
  actionType,
  startDate,
  endDate,
  secretariaId,
}: ActivityLogsListProps) {
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, error } = useActivityLogs({
    cityId,
    adminId,
    actionType,
    startDate,
    endDate,
    secretariaId,
    page,
    limit,
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getActionIcon = (actionType: string) => {
    const Icon = ACTION_TYPE_ICONS[actionType] || FileText;
    return Icon;
  };

  const getActionColor = (actionType: string) => {
    return ACTION_TYPE_COLORS[actionType] || "text-slate-400";
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-3xl border border-slate-800 bg-slate-900/60 text-slate-400">
        <Clock className="size-6 animate-spin mr-2" />
        Carregando histórico...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-3xl border border-slate-800 bg-slate-900/60 text-red-400">
        <p className="text-sm font-medium">Erro ao carregar histórico</p>
        <p className="mt-2 text-xs text-slate-500">
          Tente recarregar a página.
        </p>
      </div>
    );
  }

  if (!data || data.logs.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-3xl border border-slate-800 bg-slate-900/60 text-slate-400">
        <Clock className="size-12 mb-4 text-slate-500" />
        <p className="text-sm font-medium text-slate-300">
          Nenhum registro encontrado
        </p>
        <p className="mt-2 text-xs text-slate-500">
          Não há atividades registradas no período selecionado.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {data.logs.map((log) => {
          const ActionIcon = getActionIcon(log.actionType);
          const actionColor = getActionColor(log.actionType);

          return (
            <div
              key={log._id}
              className="rounded-xl border border-slate-800 bg-slate-900/60 p-4"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 ${actionColor}`}
                >
                  <ActionIcon className="size-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-semibold text-white">
                          {ACTION_TYPE_LABELS[log.actionType] || log.actionType}
                        </h4>
                        {log.isSuperAdmin && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-300">
                            <Shield className="size-3" />
                            Super Admin
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-300 mb-2">
                        {log.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                        <div className="flex items-center gap-1">
                          <User className="size-3" />
                          <span>{log.adminName}</span>
                        </div>
                        {log.secretaria && (
                          <div className="flex items-center gap-1">
                            <Building2 className="size-3" />
                            <span>{log.secretaria}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Clock className="size-3" />
                          <span>{formatDate(log.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Paginação */}
      {data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="text-sm text-slate-400">
            Página {data.pagination.page} de {data.pagination.totalPages} (
            {data.pagination.total} registros)
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-300 transition hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!data.pagination.hasMore}
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-300 transition hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Próxima
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

