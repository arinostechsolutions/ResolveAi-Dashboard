"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";

type StatusOptionsResponse = {
  cityId: string;
  statuses: string[];
};

export function useReportStatusOptions(cityId: string | undefined) {
  return useQuery({
    queryKey: ["reports", "status-options", cityId],
    queryFn: async () => {
      const response = await apiClient.get<StatusOptionsResponse>(
        "/api/dashboard/reports/status-options",
        {
          params: {
            cityId,
          },
        },
      );
      return response.data;
    },
    enabled: Boolean(cityId),
    staleTime: 1000 * 60 * 5,
  });
}


