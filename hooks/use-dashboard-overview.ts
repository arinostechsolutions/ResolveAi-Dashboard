"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { DashboardOverviewResponse } from "@/types/dashboard";

type Params = {
  cityId: string;
  startDate?: string;
  endDate?: string;
};

async function fetchOverview({ cityId, startDate, endDate }: Params) {
  const response = await apiClient.get<DashboardOverviewResponse>(
    "/api/dashboard/overview",
    {
      params: {
        cityId,
        startDate,
        endDate,
      },
    },
  );

  return response.data;
}

export function useDashboardOverview(params: Params) {
  const { cityId, startDate, endDate } = params;

  return useQuery({
    queryKey: ["dashboard", "overview", cityId, startDate, endDate],
    queryFn: () => fetchOverview(params),
    enabled: Boolean(cityId),
  });
}

