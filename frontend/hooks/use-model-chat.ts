"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { modelChatApi } from "@/lib/api";

export function useModelChatHistory(modelId: string) {
  return useQuery({
    queryKey: ["model-chat-history", modelId],
    queryFn: () => modelChatApi.history(modelId),
    enabled: Boolean(modelId)
  });
}

export function useSendModelMessage() {
  return useMutation({
    mutationFn: ({ modelId, message }: { modelId: string; message: string }) => modelChatApi.send(modelId, message)
  });
}
