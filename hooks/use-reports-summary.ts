"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { ReportsSummaryResponse } from "@/types/dashboard";

type Params = {
  cityId: string;
  startDate?: string;
  endDate?: string;
  secretariaId?: string;
};

async function fetchReportsSummary({
  cityId,
  startDate,
  endDate,
  secretariaId,
}: Params) {
  const params: Record<string, string> = { cityId };
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  if (secretariaId) params.secretariaId = secretariaId;

  const response = await apiClient.get<ReportsSummaryResponse>(
    "/api/dashboard/reports/summary",
    { params }
  );

  return response.data;
}

export function useReportsSummary(params: Params) {
  const { cityId, startDate, endDate, secretariaId } = params;

  return useQuery({
    queryKey: ["dashboard", "summary", cityId, startDate, endDate, secretariaId],
    queryFn: () => fetchReportsSummary(params),
    enabled: Boolean(cityId),
  });
}



