"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { agentChatApi } from "@/lib/api";

export function useAgentChatHistory(agentId: string) {
  return useQuery({
    queryKey: ["agent-chat-history", agentId],
    queryFn: () => agentChatApi.history(agentId),
    enabled: Boolean(agentId)
  });
}

export function useSendAgentMessage() {
  return useMutation({
    mutationFn: ({ agentId, message }: { agentId: string; message: string }) => agentChatApi.send(agentId, message)
  });
}
