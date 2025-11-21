"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { toast } from "react-hot-toast";

export type MobileConfig = {
  showFeed: boolean;
  showMap: boolean;
  showHealthAppointments?: boolean;
  showEvents?: boolean;
  showIptu?: boolean;
};

async function fetchMobileConfig(cityId: string): Promise<MobileConfig> {
  const response = await apiClient.get<MobileConfig>(
    `/api/cities/mobile-config/${cityId}`
  );
  return response.data;
}

async function updateMobileConfig(
  cityId: string,
  payload: Partial<MobileConfig>
): Promise<MobileConfig> {
  const response = await apiClient.put<{ mobileConfig: MobileConfig }>(
    `/api/cities/mobile-config/${cityId}`,
    payload
  );
  return response.data.mobileConfig;
}

export function useMobileConfig(cityId: string | undefined) {
  return useQuery({
    queryKey: ["mobileConfig", cityId],
    queryFn: () => fetchMobileConfig(cityId!),
    enabled: Boolean(cityId),
  });
}

export function useUpdateMobileConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      cityId,
      payload,
    }: {
      cityId: string;
      payload: Partial<MobileConfig>;
    }) => updateMobileConfig(cityId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["mobileConfig", variables.cityId],
      });
      toast.success("Configuração atualizada com sucesso!");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Erro ao atualizar configuração.";
      toast.error(message);
    },
  });
}

