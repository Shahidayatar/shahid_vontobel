"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { modelsApi } from "@/lib/api";
import type { ModelType } from "@/types/domain";

export function useModels() {
  return useQuery({ queryKey: ["models"], queryFn: modelsApi.list });
}

export function useCreateModel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string; model: ModelType; region: string }) => modelsApi.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["models"] })
  });
}

export function useDeleteModel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => modelsApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["models"] })
  });
}
