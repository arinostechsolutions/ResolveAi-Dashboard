"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { TopReportsResponse } from "@/types/dashboard";

type Params = {
  cityId: string;
  sort?: "engagement" | "oldest";
  status?: string;
  limit?: number;
};

async function fetchTopReports({
  cityId,
  sort = "engagement",
  status = "pendente",
  limit = 5,
}: Params) {
  const response = await apiClient.get<TopReportsResponse>(
    "/api/dashboard/reports/top",
    {
      params: {
        cityId,
        sort,
        status,
        limit,
      },
    },
  );

  return response.data;
}

export function useTopReports(params: Params) {
  const { cityId, sort = "engagement", status = "pendente", limit = 5 } = params;

  return useQuery({
    queryKey: ["dashboard", "top-reports", cityId, sort, status, limit],
    queryFn: () => fetchTopReports(params),
    enabled: Boolean(cityId),
  });
}


