"use client";

import { useState } from "react";
import { Pencil, Trash2, Mail, Phone, Building2, Shield, Crown } from "lucide-react";
import { AdminUser, useDeleteAdminUser } from "@/hooks/use-admin-users";
import { Secretaria } from "@/hooks/use-secretarias";

type AdminsListProps = {
  admins: AdminUser[];
  secretarias: Secretaria[];
  onEdit: (admin: AdminUser) => void;
};

export function AdminsList({ admins, secretarias, onEdit }: AdminsListProps) {
  const deleteMutation = useDeleteAdminUser();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (admin: AdminUser) => {
    if (
      !confirm(
        `Tem certeza que deseja deletar o administrador "${admin.name}"?`
      )
    ) {
      return;
    }

    setDeletingId(admin.userId);
    try {
      await deleteMutation.mutateAsync(admin.userId);
    } catch (error) {
      // Erro já é tratado no hook
    } finally {
      setDeletingId(null);
    }
  };

  const getSecretariaLabel = (secretariaId: string | null) => {
    if (!secretariaId) return null;
    return secretarias.find((s) => s.id === secretariaId)?.label || secretariaId;
  };

  if (admins.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8 text-center">
        <p className="text-slate-400">Nenhum administrador encontrado.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {admins.map((admin) => (
        <div
          key={admin.userId}
          className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-white">
                  {admin.name}
                </h3>
                {admin.isMayor && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-1 text-xs font-medium text-amber-300">
                    <Crown className="size-3" />
                    Prefeito
                  </span>
                )}
                {admin.isSuperAdmin && !admin.isMayor && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-1 text-xs font-medium text-amber-300">
                    <Shield className="size-3" />
                    Super Admin
                  </span>
                )}
                {admin.secretaria && !admin.isMayor && !admin.isSuperAdmin && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/20 px-2 py-1 text-xs font-medium text-blue-300">
                    <Building2 className="size-3" />
                    {getSecretariaLabel(admin.secretaria)}
                  </span>
                )}
              </div>
              <div className="mt-2 space-y-1">
                {admin.email && (
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Mail className="size-4" />
                    <span>{admin.email}</span>
                  </div>
                )}
                {admin.cpf && (
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <span>CPF: {admin.cpf}</span>
                  </div>
                )}
                {admin.phone && (
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Phone className="size-4" />
                    <span>{admin.phone}</span>
                  </div>
                )}
                {admin.adminCities.length > 0 && (
                  <div className="text-sm text-slate-400">
                    Cidades: {admin.adminCities.join(", ")}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onEdit(admin)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/50 px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-slate-600 hover:bg-slate-800"
              >
                <Pencil className="size-3" />
                Editar
              </button>
              {!admin.isSuperAdmin && !admin.isMayor && (
                <button
                  onClick={() => handleDelete(admin)}
                  disabled={deletingId === admin.userId}
                  className="inline-flex items-center gap-2 rounded-xl border border-red-500/50 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-300 transition hover:border-red-400 hover:bg-red-500/20 disabled:opacity-50"
                >
                  <Trash2 className="size-3" />
                  {deletingId === admin.userId ? "Deletando..." : "Deletar"}
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

