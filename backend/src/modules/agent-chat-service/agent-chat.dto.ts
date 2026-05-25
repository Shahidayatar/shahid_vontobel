import { z } from "zod";

export const agentChatRequestSchema = z.object({
  agentId: z.string().uuid(),
  message: z.string().min(1)
});

export type AgentChatRequestDto = z.infer<typeof agentChatRequestSchema>;
