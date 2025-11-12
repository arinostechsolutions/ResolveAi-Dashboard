"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { ReportsSummaryResponse } from "@/types/dashboard";

type Params = {
  cityId: string;
  startDate?: string;
  endDate?: string;
};

async function fetchReportsSummary({
  cityId,
  startDate,
  endDate,
}: Params) {
  const response = await apiClient.get<ReportsSummaryResponse>(
    "/api/dashboard/reports/summary",
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

export function useReportsSummary(params: Params) {
  const { cityId, startDate, endDate } = params;

  return useQuery({
    queryKey: ["dashboard", "summary", cityId, startDate, endDate],
    queryFn: () => fetchReportsSummary(params),
    enabled: Boolean(cityId),
  });
}

