"use client";

import { useMutation } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";

type SendMessagePayload = {
  reportId: string;
  title: string;
  message: string;
  type?: "feedback" | "atualizacao" | "solicitacao" | "outro";
};

export function useSendMessage() {
  return useMutation({
    mutationFn: async (payload: SendMessagePayload) => {
      const response = await apiClient.post("/api/messages/create", payload);
      return response.data;
    },
  });
}


