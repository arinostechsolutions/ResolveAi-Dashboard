"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { toast } from "react-hot-toast";

export type Secretaria = {
  id: string;
  label: string;
  reportTypes: string[];
  createdAt: string;
  adminCount: number;
};

export type ReportType = {
  id: string;
  label: string;
  secretaria: string | null;
};

type SecretariasResponse = {
  cityId: string;
  secretarias: Secretaria[];
};

type ReportTypesResponse = {
  cityId: string;
  reportTypes: ReportType[];
};

type CreateSecretariaPayload = {
  id: string;
  label: string;
  reportTypes?: string[];
};

type UpdateSecretariaPayload = {
  label?: string;
  reportTypes?: string[];
};

async function fetchSecretarias(cityId: string): Promise<SecretariasResponse> {
  const response = await apiClient.get<SecretariasResponse>(
    `/api/admin/cities/${cityId}/secretarias`
  );
  return response.data;
}

async function fetchReportTypes(cityId: string): Promise<ReportTypesResponse> {
  const response = await apiClient.get<ReportTypesResponse>(
    `/api/admin/cities/${cityId}/reportTypes`
  );
  return response.data;
}

async function createSecretaria(
  cityId: string,
  payload: CreateSecretariaPayload
): Promise<Secretaria> {
  const response = await apiClient.post<{ secretaria: Secretaria }>(
    `/api/admin/cities/${cityId}/secretarias`,
    payload
  );
  return response.data.secretaria;
}

async function updateSecretaria(
  cityId: string,
  secretariaId: string,
  payload: UpdateSecretariaPayload
): Promise<Secretaria> {
  const response = await apiClient.put<{ secretaria: Secretaria }>(
    `/api/admin/cities/${cityId}/secretarias/${secretariaId}`,
    payload
  );
  return response.data.secretaria;
}

async function deleteSecretaria(
  cityId: string,
  secretariaId: string
): Promise<void> {
  await apiClient.delete(
    `/api/admin/cities/${cityId}/secretarias/${secretariaId}`
  );
}

export function useSecretarias(cityId: string | undefined) {
  return useQuery({
    queryKey: ["secretarias", cityId],
    queryFn: () => fetchSecretarias(cityId!),
    enabled: Boolean(cityId),
  });
}

export function useReportTypes(cityId: string | undefined) {
  return useQuery({
    queryKey: ["reportTypes", cityId],
    queryFn: () => fetchReportTypes(cityId!),
    enabled: Boolean(cityId),
  });
}

export function useCreateSecretaria() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      cityId,
      payload,
    }: {
      cityId: string;
      payload: CreateSecretariaPayload;
    }) => createSecretaria(cityId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["secretarias", variables.cityId] });
      queryClient.invalidateQueries({ queryKey: ["reportTypes", variables.cityId] });
      toast.success("Secretaria criada com sucesso!");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Erro ao criar secretaria.";
      toast.error(message);
    },
  });
}

export function useUpdateSecretaria() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      cityId,
      secretariaId,
      payload,
    }: {
      cityId: string;
      secretariaId: string;
      payload: UpdateSecretariaPayload;
    }) => updateSecretaria(cityId, secretariaId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["secretarias", variables.cityId] });
      queryClient.invalidateQueries({ queryKey: ["reportTypes", variables.cityId] });
      toast.success("Secretaria atualizada com sucesso!");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Erro ao atualizar secretaria.";
      toast.error(message);
    },
  });
}

export function useDeleteSecretaria() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      cityId,
      secretariaId,
    }: {
      cityId: string;
      secretariaId: string;
    }) => deleteSecretaria(cityId, secretariaId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["secretarias", variables.cityId] });
      queryClient.invalidateQueries({ queryKey: ["reportTypes", variables.cityId] });
      toast.success("Secretaria deletada com sucesso!");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Erro ao deletar secretaria.";
      toast.error(message);
    },
  });
}



