"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { toast } from "react-hot-toast";
import { useAuth } from "@/context/auth-context";

export type AdminUser = {
  userId: string;
  name: string;
  email: string | null;
  cpf: string | null;
  phone: string | null;
  adminCities: string[];
  secretaria: string | null;
  isSuperAdmin: boolean;
  isMayor?: boolean;
  createdAt: string;
  birthDate?: string;
  address?: {
    bairro: string;
    rua?: string;
    numero?: string;
    complemento?: string;
  };
};

type AdminUsersResponse = {
  admins: AdminUser[];
  total: number;
};

type AdminUserResponse = {
  admin: AdminUser;
};

type UpdateAdminPayload = {
  name?: string;
  email?: string;
  cpf?: string;
  phone?: string;
  birthDate?: string;
  address?: {
    bairro?: string;
    rua?: string;
    numero?: string;
    complemento?: string;
  };
  adminCities?: string[];
  secretaria?: string | null;
  password?: string;
};

async function fetchAdminUsers(
  cityId?: string,
  secretaria?: string
): Promise<AdminUsersResponse> {
  const params: Record<string, string> = {};
  if (cityId) params.cityId = cityId;
  if (secretaria) params.secretaria = secretaria;

  const response = await apiClient.get<AdminUsersResponse>("/api/admin/users/admins", {
    params,
  });
  return response.data;
}

async function fetchAdminUser(userId: string): Promise<AdminUserResponse> {
  const response = await apiClient.get<AdminUserResponse>(`/api/admin/users/${userId}`);
  return response.data;
}

async function updateAdminUser(
  userId: string,
  payload: UpdateAdminPayload
): Promise<AdminUserResponse> {
  const response = await apiClient.put<AdminUserResponse>(
    `/api/admin/users/${userId}`,
    payload
  );
  return response.data;
}

async function deleteAdminUser(userId: string): Promise<void> {
  await apiClient.delete(`/api/admin/users/${userId}`);
}

export function useAdminUsers(cityId?: string, secretaria?: string) {
  return useQuery({
    queryKey: ["adminUsers", cityId, secretaria],
    queryFn: () => fetchAdminUsers(cityId, secretaria),
  });
}

export function useAdminUser(userId: string | undefined) {
  return useQuery({
    queryKey: ["adminUser", userId],
    queryFn: () => fetchAdminUser(userId!),
    enabled: Boolean(userId),
  });
}

export function useUpdateAdminUser() {
  const queryClient = useQueryClient();
  const { admin, updateAdmin } = useAuth();

  return useMutation({
    mutationFn: ({
      userId,
      payload,
    }: {
      userId: string;
      payload: UpdateAdminPayload;
    }) => updateAdminUser(userId, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      queryClient.invalidateQueries({ queryKey: ["adminUser", variables.userId] });
      queryClient.invalidateQueries({ queryKey: ["secretarias"] });
      
      // Se o usuário editado for o próprio usuário logado, atualizar o contexto de autenticação
      if (admin?.userId === variables.userId) {
        updateAdmin({
          name: data.admin.name,
          email: data.admin.email ?? admin.email ?? undefined,
          cpf: data.admin.cpf ?? admin.cpf ?? undefined,
          secretaria: data.admin.secretaria ?? admin.secretaria ?? null,
          isMayor: data.admin.isMayor ?? admin.isMayor ?? false,
        });
      }
      
      toast.success("Administrador atualizado com sucesso!");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Erro ao atualizar administrador.";
      toast.error(message);
    },
  });
}

export function useDeleteAdminUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => deleteAdminUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      queryClient.invalidateQueries({ queryKey: ["secretarias"] });
      toast.success("Administrador deletado com sucesso!");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Erro ao deletar administrador.";
      toast.error(message);
    },
  });
}

