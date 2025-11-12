"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { ReportsMapResponse } from "@/types/dashboard";

type Params = {
  cityId: string;
  status?: string;
  reportType?: string;
};

async function fetchReportsMap({
  cityId,
  status,
  reportType,
}: Params) {
  const response = await apiClient.get<ReportsMapResponse>(
    "/api/dashboard/map",
    {
      params: {
        cityId,
        status,
        reportType,
      },
    },
  );

  return response.data;
}

export function useReportsMap(params: Params) {
  const { cityId, status, reportType } = params;

  return useQuery({
    queryKey: ["dashboard", "map", cityId, status, reportType],
    queryFn: () => fetchReportsMap(params),
    enabled: Boolean(cityId),
  });
}


