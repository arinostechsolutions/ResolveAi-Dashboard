"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { toast } from "react-hot-toast";

// ==================== TYPES ====================

export type Event = {
  _id: string;
  city: {
    id: string;
    label: string;
  };
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  images: string[];
  address: {
    street?: string;
    number?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  sponsors: Array<{
    name: string;
    logo?: string;
  }>;
  schedule: Array<{
    date: string;
    title: string;
    subtitle?: string;
  }>;
  isActive: boolean;
  createdBy?: {
    adminId: string;
    adminName: string;
  };
  createdAt?: string;
  updatedAt?: string;
};

type EventsResponse = {
  events: Event[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

// ==================== QUERIES ====================

async function fetchEventsByCity(cityId: string): Promise<EventsResponse> {
  const response = await apiClient.get<EventsResponse>(
    `/api/events/getEventsByCity/${cityId}?includeFinished=true`
  );
  return response.data;
}

async function fetchEventById(id: string): Promise<Event> {
  const response = await apiClient.get<Event>(`/api/events/getEventById/${id}`);
  return response.data;
}

export function useEvents(cityId: string | undefined) {
  return useQuery({
    queryKey: ["events", cityId],
    queryFn: () => fetchEventsByCity(cityId!),
    enabled: Boolean(cityId),
  });
}

export function useEvent(id: string | undefined) {
  return useQuery({
    queryKey: ["event", id],
    queryFn: () => fetchEventById(id!),
    enabled: Boolean(id),
  });
}

// ==================== MUTATIONS ====================

type CreateEventPayload = {
  cityId: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  images?: string[];
  address?: Event["address"];
  sponsors?: Event["sponsors"];
  schedule?: Event["schedule"];
};

type UpdateEventPayload = Partial<CreateEventPayload> & {
  isActive?: boolean;
};

async function createEvent(payload: CreateEventPayload): Promise<Event> {
  const response = await apiClient.post<{ event: Event; message: string }>(
    "/api/events/createEvent",
    payload
  );
  return response.data.event;
}

async function updateEvent(
  id: string,
  payload: UpdateEventPayload
): Promise<Event> {
  const response = await apiClient.put<{ event: Event; message: string }>(
    `/api/events/updateEvent/${id}`,
    payload
  );
  return response.data.event;
}

async function deleteEvent(id: string): Promise<void> {
  await apiClient.delete(`/api/events/deleteEvent/${id}`);
}

export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createEvent,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["events", variables.cityId],
      });
      toast.success("Evento criado com sucesso!");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Erro ao criar evento.";
      toast.error(message);
    },
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateEventPayload }) =>
      updateEvent(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["events", data.city.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["event", data._id],
      });
      toast.success("Evento atualizado com sucesso!");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Erro ao atualizar evento.";
      toast.error(message);
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteEvent,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: ["events"],
      });
      toast.success("Evento deletado com sucesso!");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Erro ao deletar evento.";
      toast.error(message);
    },
  });
}




