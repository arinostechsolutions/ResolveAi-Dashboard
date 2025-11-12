"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";

type UpdatePayload = {
  reportId: string;
  cityId: string;
  status: string;
};

export function useUpdateReportStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reportId, status, cityId }: UpdatePayload) => {
      const response = await apiClient.patch(
        `/api/dashboard/reports/${reportId}/status`,
        { status, cityId },
      );
      return response.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["reports", "list", variables.cityId],
      });
      queryClient.invalidateQueries({
        queryKey: ["dashboard", "overview", variables.cityId],
      });
      queryClient.invalidateQueries({
        queryKey: ["dashboard", "summary", variables.cityId],
      });
      queryClient.invalidateQueries({
        queryKey: ["dashboard", "top-reports", variables.cityId],
      });
      queryClient.invalidateQueries({
        queryKey: ["dashboard", "map", variables.cityId],
      });
    },
  });
}

