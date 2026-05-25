"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { agentsApi } from "@/lib/api";
import type { Agent } from "@/types/domain";

export function useAgents() {
  return useQuery({ queryKey: ["agents"], queryFn: agentsApi.list });
}

export function useCreateAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<Agent, "id" | "createdAt" | "status">) => agentsApi.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["agents"] })
  });
}
