"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { ReportsMapResponse } from "@/types/dashboard";

type Params = {
  cityId: string;
  status?: string;
  reportType?: string;
  secretariaId?: string;
  reportId?: string; // ID do report específico para focar
};

async function fetchReportsMap({
  cityId,
  status,
  reportType,
  secretariaId,
  reportId,
}: Params) {
  const params: Record<string, string> = { cityId };
  if (status) params.status = status;
  if (reportType) params.reportType = reportType;
  if (secretariaId) params.secretariaId = secretariaId;
  if (reportId) params.reportId = reportId;

  const response = await apiClient.get<ReportsMapResponse>(
    "/api/dashboard/map",
    { params }
  );

  return response.data;
}

export function useReportsMap(params: Params) {
  const { cityId, status, reportType, secretariaId, reportId } = params;

  return useQuery({
    queryKey: ["dashboard", "map", cityId, status, reportType, secretariaId, reportId],
    queryFn: () => fetchReportsMap(params),
    enabled: Boolean(cityId),
  });
}



