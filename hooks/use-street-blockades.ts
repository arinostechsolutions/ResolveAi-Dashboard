"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";

export type BlockadeType = "evento" | "obra" | "emergencia" | "manutencao" | "outro";
export type BlockadeStatus = "agendado" | "ativo" | "encerrado" | "cancelado";
export type ImpactLevel = "baixo" | "medio" | "alto" | "total";

export interface BlockadeCoordinate {
  lat: number;
  lng: number;
  order?: number;
}

export interface BlockadeRoute {
  coordinates: BlockadeCoordinate[];
  streetName: string;
  neighborhood: string;
  description?: string;
}

export interface AlternativeRoute {
  coordinates: BlockadeCoordinate[];
  description?: string;
}

export interface BlockadeImpact {
  level: ImpactLevel;
  affectedArea?: string;
}

export interface StreetBlockade {
  _id: string;
  cityId: string;
  route: BlockadeRoute;
  type: BlockadeType;
  reason: string;
  startDate: string;
  endDate?: string;
  status: BlockadeStatus;
  alternativeRoute?: AlternativeRoute;
  impact: BlockadeImpact;
  internalNotes?: string;
  createdBy: {
    adminId: string;
    adminName: string;
    secretaria?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export type BlockadesListResponse = {
  blockades: StreetBlockade[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

type UseBlockadesListParams = {
  cityId: string | undefined;
  status?: string;
  page?: number;
  limit?: number;
};

async function fetchBlockadesList({
  cityId,
  status,
  page = 1,
  limit = 20,
}: UseBlockadesListParams): Promise<BlockadesListResponse> {
  const params: Record<string, string | number> = {
    page,
    limit,
  };
  if (status) params.status = status;

  const response = await apiClient.get<BlockadesListResponse>(
    `/api/street-blockades/all/${cityId}`,
    { params },
  );
  return response.data;
}

export function useStreetBlockadesList({
  cityId,
  status,
  page = 1,
  limit = 20,
}: UseBlockadesListParams) {
  return useQuery({
    queryKey: ["street-blockades", "list", cityId, status, page, limit],
    queryFn: () => fetchBlockadesList({ cityId, status, page, limit }),
    enabled: Boolean(cityId),
    placeholderData: (previousData) => previousData,
  });
}

export function useStreetBlockade(id: string | undefined) {
  return useQuery({
    queryKey: ["street-blockade", id],
    queryFn: async () => {
      const response = await apiClient.get<StreetBlockade>(`/api/street-blockades/${id}`);
      return response.data;
    },
    enabled: Boolean(id),
  });
}

export interface CreateBlockadeData {
  cityId: string;
  route: BlockadeRoute;
  type: BlockadeType;
  reason: string;
  startDate: string;
  endDate: string;
  alternativeRoute?: AlternativeRoute;
  impact?: BlockadeImpact;
  internalNotes?: string;
}

export function useCreateBlockade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateBlockadeData) => {
      const response = await apiClient.post("/api/street-blockades/create", data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["street-blockades", "list", variables.cityId] });
    },
  });
}

export interface UpdateBlockadeData extends Partial<CreateBlockadeData> {
  id: string;
}

export function useUpdateBlockade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateBlockadeData) => {
      const response = await apiClient.put(`/api/street-blockades/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["street-blockade", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["street-blockades", "list"] });
    },
  });
}

export function useUpdateBlockadeStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: BlockadeStatus }) => {
      const response = await apiClient.patch(`/api/street-blockades/${id}/status`, { status });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["street-blockades"] });
    },
  });
}

export function useDeleteBlockade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/api/street-blockades/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["street-blockades"] });
    },
  });
}

