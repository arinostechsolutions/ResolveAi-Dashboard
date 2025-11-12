"use client";

import { useQuery } from "@tanstack/react-query";
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

type ReportsListResponse = {
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
};

export function useReportsList({
  cityId,
  status = "all",
  search,
  page = 1,
  limit = 10,
}: UseReportsListParams) {
  return useQuery({
    queryKey: ["reports", "list", cityId, status, search, page, limit],
    queryFn: async () => {
      const response = await apiClient.get<ReportsListResponse>(
        "/api/dashboard/reports/list",
        {
          params: {
            cityId,
            status,
            search,
            page,
            limit,
          },
        },
      );
      return response.data;
    },
    enabled: Boolean(cityId),
    keepPreviousData: true,
  });
}

