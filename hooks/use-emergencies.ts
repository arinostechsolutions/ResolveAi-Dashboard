"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { toast } from "react-hot-toast";

export type EmergencyContact = {
  _id: string;
  name: string;
  type: "policia" | "bombeiro" | "defesa_civil" | "disk_denuncia" | "violencia_mulher" | "samu" | "outro";
  phone: string;
  alternativePhone?: string | null;
  description?: string | null;
  location?: {
    lat: number;
    lng: number;
    address?: string;
    bairro?: string;
    rua?: string;
  } | null;
  city: {
    id: string;
    label: string;
  };
  createdBy: {
    adminId: string;
    adminName: string;
    secretaria?: string;
  };
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateEmergencyContactPayload = {
  name: string;
  type: EmergencyContact["type"];
  phone: string;
  alternativePhone?: string;
  description?: string;
  location?: {
    address?: string;
    bairro?: string;
    rua?: string;
    lat: number;
    lng: number;
  };
  cityId: string;
  displayOrder?: number;
};

export type UpdateEmergencyContactPayload = Partial<CreateEmergencyContactPayload> & {
  isActive?: boolean;
};

async function fetchEmergencyContacts(cityId: string): Promise<EmergencyContact[]> {
  const response = await apiClient.get<EmergencyContact[]>(
    `/api/emergency-contacts/city/${cityId}?includeInactive=true`
  );
  return response.data;
}

async function fetchEmergencyContact(id: string): Promise<EmergencyContact> {
  const response = await apiClient.get<EmergencyContact>(`/api/emergency-contacts/${id}`);
  return response.data;
}

async function createEmergencyContact(
  payload: CreateEmergencyContactPayload
): Promise<EmergencyContact> {
  const response = await apiClient.post<{ contact: EmergencyContact; message: string }>(
    `/api/emergency-contacts/create`,
    payload
  );
  return response.data.contact;
}

async function updateEmergencyContact(
  id: string,
  payload: UpdateEmergencyContactPayload
): Promise<EmergencyContact> {
  const response = await apiClient.put<{ contact: EmergencyContact; message: string }>(
    `/api/emergency-contacts/${id}`,
    payload
  );
  return response.data.contact;
}

async function deleteEmergencyContact(id: string): Promise<void> {
  await apiClient.delete(`/api/emergency-contacts/${id}`);
}

export function useEmergencyContacts(cityId: string | undefined) {
  return useQuery({
    queryKey: ["emergencyContacts", cityId],
    queryFn: () => fetchEmergencyContacts(cityId!),
    enabled: Boolean(cityId),
  });
}

export function useEmergencyContact(id: string | undefined) {
  return useQuery({
    queryKey: ["emergencyContact", id],
    queryFn: () => fetchEmergencyContact(id!),
    enabled: Boolean(id),
  });
}

export function useCreateEmergencyContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateEmergencyContactPayload) =>
      createEmergencyContact(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["emergencyContacts", variables.cityId],
      });
      toast.success("Telefone de emergência criado com sucesso!");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Erro ao criar telefone de emergência.";
      toast.error(message);
    },
  });
}

export function useUpdateEmergencyContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateEmergencyContactPayload }) =>
      updateEmergencyContact(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["emergencyContacts", data.city.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["emergencyContact", data._id],
      });
      toast.success("Telefone de emergência atualizado com sucesso!");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Erro ao atualizar telefone de emergência.";
      toast.error(message);
    },
  });
}

export function useDeleteEmergencyContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, cityId }: { id: string; cityId: string }) =>
      deleteEmergencyContact(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["emergencyContacts", variables.cityId],
      });
      toast.success("Telefone de emergência removido com sucesso!");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Erro ao remover telefone de emergência.";
      toast.error(message);
    },
  });
}

