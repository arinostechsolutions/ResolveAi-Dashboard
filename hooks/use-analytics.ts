"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";

export type NeighborhoodAnalytics = {
  bairro: string;
  total: number;
  pendente: number;
  em_andamento: number;
  resolvido: number;
  totalLikes: number;
  totalViews: number;
  totalShares: number;
  engagementScore: number;
};

export type TypeAnalytics = {
  reportType: string;
  total: number;
  pendente: number;
  em_andamento: number;
  resolvido: number;
  totalLikes: number;
  totalViews: number;
  totalShares: number;
  engagementScore: number;
};

export type TrendData = {
  _id: {
    year: number;
    month?: number;
    day?: number;
    week?: number;
  };
  date: string;
  total: number;
  pendente: number;
  em_andamento: number;
  resolvido: number;
};

export type ComparisonData = {
  label: string;
  total: number;
  avgEngagement: number;
  resolutionRate: number;
};

type AnalyticsResponse<T> = {
  results: T[];
};

async function fetchByNeighborhood(
  cityId: string,
  secretariaId?: string,
  startDate?: string,
  endDate?: string
): Promise<AnalyticsResponse<NeighborhoodAnalytics>> {
  const params: Record<string, string> = { cityId };
  if (secretariaId) params.secretariaId = secretariaId;
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;

  const response = await apiClient.get<AnalyticsResponse<NeighborhoodAnalytics>>(
    "/api/dashboard/analytics/by-neighborhood",
    { params }
  );
  return response.data;
}

async function fetchByType(
  cityId: string,
  secretariaId?: string,
  startDate?: string,
  endDate?: string
): Promise<AnalyticsResponse<TypeAnalytics>> {
  const params: Record<string, string> = { cityId };
  if (secretariaId) params.secretariaId = secretariaId;
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;

  const response = await apiClient.get<AnalyticsResponse<TypeAnalytics>>(
    "/api/dashboard/analytics/by-type",
    { params }
  );
  return response.data;
}

async function fetchTrends(
  cityId: string,
  secretariaId?: string,
  startDate?: string,
  endDate?: string,
  groupBy: "day" | "week" | "month" = "day",
  bairro?: string,
  reportType?: string
): Promise<AnalyticsResponse<TrendData>> {
  const params: Record<string, string> = { cityId, groupBy };
  if (secretariaId) params.secretariaId = secretariaId;
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  if (bairro) params.bairro = bairro;
  if (reportType) params.reportType = reportType;

  const response = await apiClient.get<AnalyticsResponse<TrendData>>(
    "/api/dashboard/analytics/trends",
    { params }
  );
  return response.data;
}

async function fetchComparison(
  cityId: string,
  secretariaId?: string,
  startDate?: string,
  endDate?: string,
  compareBy: "neighborhood" | "type" = "neighborhood"
): Promise<AnalyticsResponse<ComparisonData>> {
  const params: Record<string, string> = { cityId, compareBy };
  if (secretariaId) params.secretariaId = secretariaId;
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;

  const response = await apiClient.get<AnalyticsResponse<ComparisonData>>(
    "/api/dashboard/analytics/comparison",
    { params }
  );
  return response.data;
}

export function useNeighborhoodAnalytics(
  cityId?: string,
  secretariaId?: string,
  startDate?: string,
  endDate?: string
) {
  return useQuery({
    queryKey: ["analytics", "neighborhood", cityId, secretariaId, startDate, endDate],
    queryFn: () => fetchByNeighborhood(cityId!, secretariaId, startDate, endDate),
    enabled: Boolean(cityId),
  });
}

export function useTypeAnalytics(
  cityId?: string,
  secretariaId?: string,
  startDate?: string,
  endDate?: string
) {
  return useQuery({
    queryKey: ["analytics", "type", cityId, secretariaId, startDate, endDate],
    queryFn: () => fetchByType(cityId!, secretariaId, startDate, endDate),
    enabled: Boolean(cityId),
  });
}

export function useTrendsAnalytics(
  cityId?: string,
  secretariaId?: string,
  startDate?: string,
  endDate?: string,
  groupBy: "day" | "week" | "month" = "day",
  bairro?: string,
  reportType?: string
) {
  return useQuery({
    queryKey: ["analytics", "trends", cityId, secretariaId, startDate, endDate, groupBy, bairro, reportType],
    queryFn: () => fetchTrends(cityId!, secretariaId, startDate, endDate, groupBy, bairro, reportType),
    enabled: Boolean(cityId),
  });
}

export function useComparisonAnalytics(
  cityId?: string,
  secretariaId?: string,
  startDate?: string,
  endDate?: string,
  compareBy: "neighborhood" | "type" = "neighborhood"
) {
  return useQuery({
    queryKey: ["analytics", "comparison", cityId, secretariaId, startDate, endDate, compareBy],
    queryFn: () => fetchComparison(cityId!, secretariaId, startDate, endDate, compareBy),
    enabled: Boolean(cityId),
  });
}

