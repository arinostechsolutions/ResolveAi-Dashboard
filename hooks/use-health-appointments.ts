"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { toast } from "react-hot-toast";

// ==================== TYPES ====================

export type HealthService = {
  id: string;
  name: string;
  address: string;
  availableSpecialties: Specialty[];
  availableExams: Exam[];
};

export type Specialty = {
  id: string;
  label: string;
  operatingHours: {
    availableDays: string[];
    shifts: {
      morning: { dailyLimit: number };
      afternoon: { dailyLimit: number };
    };
  };
};

export type Exam = {
  id: string;
  label: string;
  operatingHours: {
    availableDays: string[];
    shifts: {
      morning: { dailyLimit: number };
      afternoon: { dailyLimit: number };
    };
  };
};

type HealthServicesResponse = {
  city: { id: string; label: string };
  healthServices: HealthService[];
};

type SpecialtiesResponse = {
  city: { id: string; label: string };
  service: { id: string; name: string };
  specialties: Specialty[];
};

type ExamsResponse = {
  city: { id: string; label: string };
  service: { id: string; name: string };
  exams: Exam[];
};

type CreateHealthServicePayload = {
  id: string;
  name: string;
  address: string;
};

type UpdateHealthServicePayload = {
  name?: string;
  address?: string;
};

type CreateSpecialtyPayload = {
  id: string;
  label: string;
  availableDays: string[];
  morningLimit?: number;
  afternoonLimit?: number;
};

type UpdateSpecialtyPayload = {
  label?: string;
  availableDays?: string[];
  morningLimit?: number;
  afternoonLimit?: number;
};

type CreateExamPayload = {
  id: string;
  label: string;
  availableDays: string[];
  morningLimit?: number;
  afternoonLimit?: number;
};

type UpdateExamPayload = {
  label?: string;
  availableDays?: string[];
  morningLimit?: number;
  afternoonLimit?: number;
};

// ==================== HEALTH SERVICES ====================

async function fetchHealthServices(cityId: string): Promise<HealthServicesResponse> {
  const response = await apiClient.get<HealthServicesResponse>(
    `/api/health/services/${cityId}`
  );
  return response.data;
}

async function createHealthService(
  cityId: string,
  payload: CreateHealthServicePayload
): Promise<HealthService> {
  const response = await apiClient.post<{ healthService: HealthService }>(
    `/api/health/services/${cityId}`,
    payload
  );
  return response.data.healthService;
}

async function updateHealthService(
  cityId: string,
  serviceId: string,
  payload: UpdateHealthServicePayload
): Promise<HealthService> {
  const response = await apiClient.put<{ healthService: HealthService }>(
    `/api/health/services/${cityId}/${serviceId}`,
    payload
  );
  return response.data.healthService;
}

async function deleteHealthService(
  cityId: string,
  serviceId: string
): Promise<void> {
  await apiClient.delete(`/api/health/services/${cityId}/${serviceId}`);
}

// ==================== SPECIALTIES ====================

async function fetchSpecialties(
  cityId: string,
  serviceId: string
): Promise<SpecialtiesResponse> {
  const response = await apiClient.get<SpecialtiesResponse>(
    `/api/health/specialties/${cityId}/${serviceId}`
  );
  return response.data;
}

async function createSpecialty(
  cityId: string,
  serviceId: string,
  payload: CreateSpecialtyPayload
): Promise<Specialty> {
  const response = await apiClient.post<{ specialty: Specialty }>(
    `/api/health/specialties/${cityId}/${serviceId}`,
    payload
  );
  return response.data.specialty;
}

async function updateSpecialty(
  cityId: string,
  serviceId: string,
  specialtyId: string,
  payload: UpdateSpecialtyPayload
): Promise<Specialty> {
  const response = await apiClient.put<{ specialty: Specialty }>(
    `/api/health/specialties/${cityId}/${serviceId}/${specialtyId}`,
    payload
  );
  return response.data.specialty;
}

async function deleteSpecialty(
  cityId: string,
  serviceId: string,
  specialtyId: string
): Promise<void> {
  await apiClient.delete(
    `/api/health/specialties/${cityId}/${serviceId}/${specialtyId}`
  );
}

// ==================== EXAMS ====================

async function fetchExams(
  cityId: string,
  serviceId: string
): Promise<ExamsResponse> {
  const response = await apiClient.get<ExamsResponse>(
    `/api/health/exams/${cityId}/${serviceId}`
  );
  return response.data;
}

async function createExam(
  cityId: string,
  serviceId: string,
  payload: CreateExamPayload
): Promise<Exam> {
  const response = await apiClient.post<{ exam: Exam }>(
    `/api/health/exams/${cityId}/${serviceId}`,
    payload
  );
  return response.data.exam;
}

async function updateExam(
  cityId: string,
  serviceId: string,
  examId: string,
  payload: UpdateExamPayload
): Promise<Exam> {
  const response = await apiClient.put<{ exam: Exam }>(
    `/api/health/exams/${cityId}/${serviceId}/${examId}`,
    payload
  );
  return response.data.exam;
}

async function deleteExam(
  cityId: string,
  serviceId: string,
  examId: string
): Promise<void> {
  await apiClient.delete(`/api/health/exams/${cityId}/${serviceId}/${examId}`);
}

// ==================== HOOKS - HEALTH SERVICES ====================

export function useHealthServices(cityId: string | undefined) {
  return useQuery({
    queryKey: ["healthServices", cityId],
    queryFn: () => fetchHealthServices(cityId!),
    enabled: Boolean(cityId),
  });
}

export function useCreateHealthService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      cityId,
      payload,
    }: {
      cityId: string;
      payload: CreateHealthServicePayload;
    }) => createHealthService(cityId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["healthServices", variables.cityId],
      });
      toast.success("Unidade de saúde criada com sucesso!");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Erro ao criar unidade de saúde.";
      toast.error(message);
    },
  });
}

export function useUpdateHealthService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      cityId,
      serviceId,
      payload,
    }: {
      cityId: string;
      serviceId: string;
      payload: UpdateHealthServicePayload;
    }) => updateHealthService(cityId, serviceId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["healthServices", variables.cityId],
      });
      toast.success("Unidade de saúde atualizada com sucesso!");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Erro ao atualizar unidade de saúde.";
      toast.error(message);
    },
  });
}

export function useDeleteHealthService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      cityId,
      serviceId,
    }: {
      cityId: string;
      serviceId: string;
    }) => deleteHealthService(cityId, serviceId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["healthServices", variables.cityId],
      });
      toast.success("Unidade de saúde deletada com sucesso!");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Erro ao deletar unidade de saúde.";
      toast.error(message);
    },
  });
}

// ==================== HOOKS - SPECIALTIES ====================

export function useSpecialties(
  cityId: string | undefined,
  serviceId: string | undefined
) {
  return useQuery({
    queryKey: ["specialties", cityId, serviceId],
    queryFn: () => fetchSpecialties(cityId!, serviceId!),
    enabled: Boolean(cityId && serviceId),
  });
}

export function useCreateSpecialty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      cityId,
      serviceId,
      payload,
    }: {
      cityId: string;
      serviceId: string;
      payload: CreateSpecialtyPayload;
    }) => createSpecialty(cityId, serviceId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["specialties", variables.cityId, variables.serviceId],
      });
      queryClient.invalidateQueries({
        queryKey: ["healthServices", variables.cityId],
      });
      toast.success("Especialidade criada com sucesso!");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Erro ao criar especialidade.";
      toast.error(message);
    },
  });
}

export function useUpdateSpecialty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      cityId,
      serviceId,
      specialtyId,
      payload,
    }: {
      cityId: string;
      serviceId: string;
      specialtyId: string;
      payload: UpdateSpecialtyPayload;
    }) => updateSpecialty(cityId, serviceId, specialtyId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["specialties", variables.cityId, variables.serviceId],
      });
      queryClient.invalidateQueries({
        queryKey: ["healthServices", variables.cityId],
      });
      toast.success("Especialidade atualizada com sucesso!");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Erro ao atualizar especialidade.";
      toast.error(message);
    },
  });
}

export function useDeleteSpecialty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      cityId,
      serviceId,
      specialtyId,
    }: {
      cityId: string;
      serviceId: string;
      specialtyId: string;
    }) => deleteSpecialty(cityId, serviceId, specialtyId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["specialties", variables.cityId, variables.serviceId],
      });
      queryClient.invalidateQueries({
        queryKey: ["healthServices", variables.cityId],
      });
      toast.success("Especialidade deletada com sucesso!");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Erro ao deletar especialidade.";
      toast.error(message);
    },
  });
}

// ==================== HOOKS - EXAMS ====================

export function useExams(
  cityId: string | undefined,
  serviceId: string | undefined
) {
  return useQuery({
    queryKey: ["exams", cityId, serviceId],
    queryFn: () => fetchExams(cityId!, serviceId!),
    enabled: Boolean(cityId && serviceId),
  });
}

export function useCreateExam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      cityId,
      serviceId,
      payload,
    }: {
      cityId: string;
      serviceId: string;
      payload: CreateExamPayload;
    }) => createExam(cityId, serviceId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["exams", variables.cityId, variables.serviceId],
      });
      queryClient.invalidateQueries({
        queryKey: ["healthServices", variables.cityId],
      });
      toast.success("Exame criado com sucesso!");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Erro ao criar exame.";
      toast.error(message);
    },
  });
}

export function useUpdateExam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      cityId,
      serviceId,
      examId,
      payload,
    }: {
      cityId: string;
      serviceId: string;
      examId: string;
      payload: UpdateExamPayload;
    }) => updateExam(cityId, serviceId, examId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["exams", variables.cityId, variables.serviceId],
      });
      queryClient.invalidateQueries({
        queryKey: ["healthServices", variables.cityId],
      });
      toast.success("Exame atualizado com sucesso!");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Erro ao atualizar exame.";
      toast.error(message);
    },
  });
}

export function useDeleteExam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      cityId,
      serviceId,
      examId,
    }: {
      cityId: string;
      serviceId: string;
      examId: string;
    }) => deleteExam(cityId, serviceId, examId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["exams", variables.cityId, variables.serviceId],
      });
      queryClient.invalidateQueries({
        queryKey: ["healthServices", variables.cityId],
      });
      toast.success("Exame deletado com sucesso!");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Erro ao deletar exame.";
      toast.error(message);
    },
  });
}




