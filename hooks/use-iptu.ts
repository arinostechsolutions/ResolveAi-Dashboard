"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { toast } from "react-hot-toast";

export type IptuConfig = {
  enabled: boolean;
  paymentURL: string;
};

async function fetchIptuConfig(cityId: string): Promise<IptuConfig> {
  const response = await apiClient.get<IptuConfig>(
    `/api/iptu/getIptuConfig/${cityId}`
  );
  return response.data;
}

async function updateIptuConfig(
  cityId: string,
  payload: Partial<IptuConfig>
): Promise<IptuConfig> {
  const response = await apiClient.put<{ iptu: IptuConfig; message: string }>(
    `/api/iptu/updateIptuConfig/${cityId}`,
    payload
  );
  return response.data.iptu;
}

export function useIptuConfig(cityId: string | undefined) {
  return useQuery({
    queryKey: ["iptuConfig", cityId],
    queryFn: () => fetchIptuConfig(cityId!),
    enabled: Boolean(cityId),
  });
}

export function useUpdateIptuConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      cityId,
      payload,
    }: {
      cityId: string;
      payload: Partial<IptuConfig>;
    }) => updateIptuConfig(cityId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["iptuConfig", variables.cityId],
      });
      toast.success("Configuração de IPTU atualizada com sucesso!");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Erro ao atualizar configuração de IPTU.";
      toast.error(message);
    },
  });
}




