"use client";

import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import type {
  PositivePost,
  PositivePostsFeedResponse,
  CreatePositivePostPayload,
  UpdatePositivePostPayload,
} from "@/types/positive-posts";

type UsePositivePostsParams = {
  cityId: string | undefined;
  page?: number;
  limit?: number;
  status?: string;
  category?: string;
};

async function fetchPositivePosts({
  cityId,
  page = 1,
  limit = 20,
  status = "publicado",
  category,
}: UsePositivePostsParams): Promise<PositivePostsFeedResponse> {
  const params: Record<string, string | number> = {
    page,
    limit,
    status,
  };
  if (category) params.category = category;

  const response = await apiClient.get<PositivePostsFeedResponse>(
    `/api/positive-posts/feed/${cityId}`,
    { params }
  );
  return response.data;
}

export function usePositivePosts({
  cityId,
  page = 1,
  limit = 20,
  status = "publicado",
  category,
}: UsePositivePostsParams) {
  return useQuery({
    queryKey: ["positive-posts", "feed", cityId, page, limit, status, category],
    queryFn: () => fetchPositivePosts({ cityId, page, limit, status, category }),
    enabled: Boolean(cityId),
    placeholderData: keepPreviousData,
  });
}

async function fetchPositivePostById(id: string): Promise<PositivePost> {
  const response = await apiClient.get<PositivePost>(`/api/positive-posts/${id}`);
  return response.data;
}

export function usePositivePost(id: string | undefined) {
  return useQuery({
    queryKey: ["positive-posts", "detail", id],
    queryFn: () => fetchPositivePostById(id!),
    enabled: Boolean(id),
  });
}

async function fetchPositivePostsByCity({
  cityId,
  page = 1,
  limit = 20,
  status,
  category,
}: UsePositivePostsParams): Promise<PositivePostsFeedResponse> {
  const params: Record<string, string | number> = {
    page,
    limit,
  };
  if (status) params.status = status;
  if (category) params.category = category;

  const response = await apiClient.get<PositivePostsFeedResponse>(
    `/api/positive-posts/city/${cityId}`,
    { params }
  );
  return response.data;
}

export function usePositivePostsByCity({
  cityId,
  page = 1,
  limit = 20,
  status,
  category,
}: UsePositivePostsParams) {
  return useQuery({
    queryKey: ["positive-posts", "city", cityId, page, limit, status, category],
    queryFn: () => fetchPositivePostsByCity({ cityId, page, limit, status, category }),
    enabled: Boolean(cityId),
    placeholderData: keepPreviousData,
  });
}

export function useCreatePositivePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreatePositivePostPayload) => {
      const response = await apiClient.post("/api/positive-posts/create", payload);
      return response.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["positive-posts", "feed", variables.city.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["positive-posts", "city", variables.city.id],
      });
    },
  });
}

export function useUpdatePositivePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdatePositivePostPayload }) => {
      const response = await apiClient.put(`/api/positive-posts/${id}`, payload);
      return response.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["positive-posts", "detail", variables.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["positive-posts"],
      });
    },
  });
}

export function useDeletePositivePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/api/positive-posts/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["positive-posts"],
      });
    },
  });
}




