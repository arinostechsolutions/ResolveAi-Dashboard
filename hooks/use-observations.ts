"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { toast } from "react-hot-toast";

export type Observation = {
  _id: string;
  cityId: string;
  secretariaId: string;
  secretariaLabel: string;
  mayorId: string;
  mayorName: string;
  message: string;
  read: boolean;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type ObservationsResponse = {
  observations: Observation[];
  total: number;
};

type CreateObservationPayload = {
  secretariaId: string;
  message: string;
};

async function fetchObservations(secretariaId?: string): Promise<ObservationsResponse> {
  const params = new URLSearchParams();
  if (secretariaId) {
    params.append("secretariaId", secretariaId);
  }
  const response = await apiClient.get<ObservationsResponse>(
    `/api/admin/observations?${params.toString()}`
  );
  return response.data;
}

async function createObservation(
  payload: CreateObservationPayload
): Promise<Observation> {
  const response = await apiClient.post<{ observation: Observation }>(
    `/api/admin/observations`,
    payload
  );
  return response.data.observation;
}

async function markObservationAsRead(observationId: string): Promise<Observation> {
  const response = await apiClient.put<{ observation: Observation }>(
    `/api/admin/observations/${observationId}/read`
  );
  return response.data.observation;
}

export function useObservations(secretariaId?: string) {
  return useQuery({
    queryKey: ["observations", secretariaId],
    queryFn: () => fetchObservations(secretariaId),
  });
}

export function useCreateObservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateObservationPayload) => createObservation(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["observations"] });
      toast.success("Observação enviada com sucesso!");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Erro ao enviar observação.";
      toast.error(message);
    },
  });
}

export function useMarkObservationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (observationId: string) => markObservationAsRead(observationId),
    onSuccess: () => {
      // Invalidar todas as queries de observações para atualizar o contador
      queryClient.invalidateQueries({ queryKey: ["observations"] });
      toast.success("Observação marcada como lida.");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Erro ao marcar observação como lida.";
      toast.error(message);
    },
  });
}

/**
 * Hook para contar observações não lidas
 * Para secretarias: conta todas as não lidas destinadas a elas
 * Para prefeitos: não precisa (eles veem todas que enviaram)
 */
export function useUnreadObservationsCount(enabled: boolean = true) {
  // Para secretarias, buscar todas as observações (sem filtro de secretaria)
  // O backend retorna apenas as observações destinadas à secretaria do admin logado
  // Usa a mesma query key base que useObservations para que invalidações funcionem
  const { data: observationsData } = useQuery({
    queryKey: ["observations", undefined], // undefined = sem filtro de secretaria
    queryFn: () => fetchObservations(undefined),
    enabled,
  });
  
  const unreadCount = observationsData?.observations.filter(
    (obs) => !obs.read
  ).length || 0;

  return unreadCount;
}

