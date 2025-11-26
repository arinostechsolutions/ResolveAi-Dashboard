"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { toast } from "react-hot-toast";

export type NewsStatus = "rascunho" | "publicado" | "arquivado";
export type NewsCategory = "geral" | "saude" | "educacao" | "infraestrutura" | "eventos" | "servicos" | "outro";

export interface News {
  _id: string;
  cityId: string;
  title: string;
  content: string;
  summary?: string;
  imageUrl?: string;
  status: NewsStatus;
  publishedAt?: string;
  category: NewsCategory;
  tags: string[];
  views: number;
  isHighlighted: boolean;
  createdBy: {
    adminId: string;
    adminName: string;
    role: "super_admin" | "mayor" | "secretaria";
  };
  createdAt: string;
  updatedAt: string;
}

export interface NewsListResponse {
  news: News[];
  pagination: {
    currentPage: number;
    totalPages: number;
    total: number;
    limit: number;
  };
}

export interface CreateNewsPayload {
  cityId: string;
  title: string;
  content: string;
  summary?: string;
  imageUrl?: string;
  status?: NewsStatus;
  category?: NewsCategory;
  tags?: string[];
  isHighlighted?: boolean;
  publishedAt?: string;
}

export interface UpdateNewsPayload extends Partial<CreateNewsPayload> {
  _id: string;
}

async function fetchNewsByCity(
  cityId: string,
  params?: {
    status?: string;
    category?: string;
    page?: number;
    limit?: number;
    includeDrafts?: boolean;
  }
): Promise<NewsListResponse> {
  const queryParams = new URLSearchParams();
  if (params?.status) queryParams.append("status", params.status);
  if (params?.category) queryParams.append("category", params.category);
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.includeDrafts) queryParams.append("includeDrafts", "true");

  const response = await apiClient.get<NewsListResponse>(
    `/api/news/city/${cityId}?${queryParams.toString()}`
  );
  return response.data;
}

async function fetchNewsById(id: string): Promise<News> {
  const response = await apiClient.get<News>(`/api/news/${id}`);
  return response.data;
}

async function createNews(payload: CreateNewsPayload): Promise<News> {
  const response = await apiClient.post<{ news: News }>("/api/news", payload);
  return response.data.news;
}

async function updateNews(payload: UpdateNewsPayload): Promise<News> {
  const { _id, ...data } = payload;
  const response = await apiClient.put<{ news: News }>(`/api/news/${_id}`, data);
  return response.data.news;
}

async function deleteNews(id: string): Promise<void> {
  await apiClient.delete(`/api/news/${id}`);
}

export function useNewsList(
  cityId: string | undefined,
  params?: {
    status?: string;
    category?: string;
    page?: number;
    limit?: number;
    includeDrafts?: boolean;
  }
) {
  return useQuery({
    queryKey: ["news", cityId, params],
    queryFn: () => fetchNewsByCity(cityId!, params),
    enabled: !!cityId,
  });
}

export function useNews(id: string | undefined) {
  return useQuery({
    queryKey: ["news", id],
    queryFn: () => fetchNewsById(id!),
    enabled: !!id,
  });
}

export function useCreateNews() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateNewsPayload) => createNews(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["news"] });
      toast.success("Notícia criada com sucesso!");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Erro ao criar notícia.";
      toast.error(message);
    },
  });
}

export function useUpdateNews() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateNewsPayload) => updateNews(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["news"] });
      toast.success("Notícia atualizada com sucesso!");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Erro ao atualizar notícia.";
      toast.error(message);
    },
  });
}

export function useDeleteNews() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteNews(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["news"] });
      toast.success("Notícia excluída com sucesso!");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Erro ao excluir notícia.";
      toast.error(message);
    },
  });
}


