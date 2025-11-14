"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { DashboardOverviewResponse } from "@/types/dashboard";

type Params = {
  cityId: string;
  startDate?: string;
  endDate?: string;
  secretariaId?: string;
};

async function fetchOverview({ cityId, startDate, endDate, secretariaId }: Params) {
  const params: Record<string, string> = { cityId };
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  if (secretariaId) params.secretariaId = secretariaId;

  const response = await apiClient.get<DashboardOverviewResponse>(
    "/api/dashboard/overview",
    { params }
  );

  return response.data;
}

export function useDashboardOverview(params: Params) {
  const { cityId, startDate, endDate, secretariaId } = params;

  return useQuery({
    queryKey: ["dashboard", "overview", cityId, startDate, endDate, secretariaId],
    queryFn: () => fetchOverview(params),
    enabled: Boolean(cityId),
  });
}



