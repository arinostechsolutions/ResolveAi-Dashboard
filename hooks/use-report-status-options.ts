"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";

type StatusOptionsResponse = {
  cityId: string;
  statuses: string[];
};

export function useReportStatusOptions(cityId: string | undefined, secretariaId?: string) {
  return useQuery({
    queryKey: ["reports", "status-options", cityId, secretariaId],
    queryFn: async () => {
      const params: Record<string, string> = { cityId: cityId! };
      if (secretariaId) params.secretariaId = secretariaId;
      
      const response = await apiClient.get<StatusOptionsResponse>(
        "/api/dashboard/reports/status-options",
        { params }
      );
      return response.data;
    },
    enabled: Boolean(cityId),
    staleTime: 1000 * 60 * 5,
  });
}



