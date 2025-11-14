"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { TopReportsResponse } from "@/types/dashboard";

type Params = {
  cityId: string;
  sort?: "engagement" | "oldest";
  status?: string;
  limit?: number;
  page?: number;
  secretariaId?: string;
  startDate?: string;
  endDate?: string;
};

async function fetchTopReports({
  cityId,
  sort = "engagement",
  status = "pendente",
  limit = 5,
  page = 1,
  secretariaId,
  startDate,
  endDate,
}: Params) {
  const params: Record<string, string | number> = { cityId, sort, status, limit, page };
  if (secretariaId) params.secretariaId = secretariaId;
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;

  const response = await apiClient.get<TopReportsResponse>(
    "/api/dashboard/reports/top",
    { params }
  );

  return response.data;
}

export function useTopReports(params: Params) {
  const { cityId, sort = "engagement", status = "pendente", limit = 5, page = 1, secretariaId, startDate, endDate } = params;

  return useQuery({
    queryKey: ["dashboard", "top-reports", cityId, sort, status, limit, page, secretariaId, startDate, endDate],
    queryFn: () => fetchTopReports(params),
    enabled: Boolean(cityId),
    placeholderData: (previousData) => previousData,
  });
}



