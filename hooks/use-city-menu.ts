"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { toast } from "react-hot-toast";

export type MenuItem = {
  id: string;
  label: string;
  bgColor: string;
  iconName: string;
  description?: string;
};

async function fetchCityMenu(cityId: string): Promise<MenuItem[]> {
  const response = await apiClient.get<any>(`/api/cities/getCityById/${cityId}`);
  return response.data.menu || [];
}

async function updateCityMenu(cityId: string, menu: MenuItem[]): Promise<MenuItem[]> {
  const response = await apiClient.put<{ city: any }>(`/api/cities/updateMenuByCity/${cityId}`, {
    menu,
  });
  return response.data.city.menu || [];
}

export function useCityMenu(cityId: string | undefined) {
  return useQuery({
    queryKey: ["cityMenu", cityId],
    queryFn: () => fetchCityMenu(cityId!),
    enabled: Boolean(cityId),
  });
}

export function useUpdateCityMenu() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cityId, menu }: { cityId: string; menu: MenuItem[] }) =>
      updateCityMenu(cityId, menu),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["cityMenu", variables.cityId],
      });
      queryClient.invalidateQueries({
        queryKey: ["healthServices", variables.cityId],
      });
      toast.success("Menu atualizado com sucesso!");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Erro ao atualizar menu.";
      toast.error(message);
    },
  });
}

