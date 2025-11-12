"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";

type City = {
  id: string;
  label: string;
};

async function fetchCities() {
  const response = await apiClient.get("/api/cities/getAllCities");
  return response.data as Array<City>;
}

export function useCities(enabled: boolean) {
  return useQuery({
    queryKey: ["cities", "all"],
    queryFn: fetchCities,
    enabled,
    staleTime: 1000 * 60 * 10,
  });
}


