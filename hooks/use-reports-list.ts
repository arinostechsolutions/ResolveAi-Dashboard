"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";

type ReportListItem = {
  id: string;
  reportType: string;
  status: string;
  address: string;
  bairro: string | null;
  referencia: string | null;
  createdAt: string;
  updatedAt: string;
  imageUrl: string | null;
  city: {
    id: string;
    label: string;
  };
};

export type ReportsListResponse = {
  cityId: string;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  results: ReportListItem[];
};

type UseReportsListParams = {
  cityId: string | undefined;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
  secretariaId?: string;
};

async function fetchReportsList({
  cityId,
  status = "all",
  search,
  page = 1,
  limit = 10,
  secretariaId,
}: UseReportsListParams): Promise<ReportsListResponse> {
  const params: Record<string, string | number> = {
    cityId: cityId!,
    status,
    page,
    limit,
  };
  if (search) params.search = search;
  if (secretariaId) params.secretariaId = secretariaId;

  const response = await apiClient.get<ReportsListResponse>(
    "/api/dashboard/reports/list",
    { params },
  );
  return response.data;
}

export function useReportsList({
  cityId,
  status = "all",
  search,
  page = 1,
  limit = 10,
  secretariaId,
}: UseReportsListParams) {
  return useQuery({
    queryKey: ["reports", "list", cityId, status, search, page, limit, secretariaId],
    queryFn: () => fetchReportsList({ cityId, status, search, page, limit, secretariaId }),
    enabled: Boolean(cityId),
    placeholderData: keepPreviousData,
  });
}

