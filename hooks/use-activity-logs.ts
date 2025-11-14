"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";

export type ActivityLog = {
  _id: string;
  adminId: string;
  adminName: string;
  adminEmail: string | null;
  adminCpf: string | null;
  secretaria: string | null;
  isSuperAdmin: boolean;
  actionType: string;
  description: string;
  details: Record<string, any>;
  entityType: string | null;
  entityId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  cityId: string | null;
  createdAt: string;
  updatedAt: string;
};

type ActivityLogsResponse = {
  logs: ActivityLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
};

type ActivityLogStatsResponse = {
  totalLogs: number;
  uniqueAdmins: number;
  byActionType: Array<{
    _id: string;
    count: number;
  }>;
};

type ActivityLogsParams = {
  adminId?: string;
  actionType?: string;
  cityId?: string;
  entityType?: string;
  entityId?: string;
  startDate?: string;
  endDate?: string;
  secretariaId?: string;
  page?: number;
  limit?: number;
};

async function fetchActivityLogs(params: ActivityLogsParams): Promise<ActivityLogsResponse> {
  const queryParams = new URLSearchParams();
  if (params.adminId) queryParams.append("adminId", params.adminId);
  if (params.actionType) queryParams.append("actionType", params.actionType);
  if (params.cityId) queryParams.append("cityId", params.cityId);
  if (params.entityType) queryParams.append("entityType", params.entityType);
  if (params.entityId) queryParams.append("entityId", params.entityId);
  if (params.startDate) queryParams.append("startDate", params.startDate);
  if (params.endDate) queryParams.append("endDate", params.endDate);
  if (params.secretariaId) queryParams.append("secretariaId", params.secretariaId);
  if (params.page) queryParams.append("page", params.page.toString());
  if (params.limit) queryParams.append("limit", params.limit.toString());

  const response = await apiClient.get<ActivityLogsResponse>(
    `/api/admin/activity-logs?${queryParams.toString()}`
  );
  return response.data;
}

async function fetchActivityLogStats(params: {
  cityId?: string;
  startDate?: string;
  endDate?: string;
}): Promise<ActivityLogStatsResponse> {
  const queryParams = new URLSearchParams();
  if (params.cityId) queryParams.append("cityId", params.cityId);
  if (params.startDate) queryParams.append("startDate", params.startDate);
  if (params.endDate) queryParams.append("endDate", params.endDate);

  const response = await apiClient.get<ActivityLogStatsResponse>(
    `/api/admin/activity-logs/stats?${queryParams.toString()}`
  );
  return response.data;
}

export function useActivityLogs(params: ActivityLogsParams) {
  return useQuery({
    queryKey: ["activityLogs", params],
    queryFn: () => fetchActivityLogs(params),
  });
}

export function useActivityLogStats(params: {
  cityId?: string;
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: ["activityLogStats", params],
    queryFn: () => fetchActivityLogStats(params),
  });
}

