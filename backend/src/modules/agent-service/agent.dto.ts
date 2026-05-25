import { z } from "zod";

export const createAgentSchema = z.object({
  name: z.string().min(3).max(64),
  description: z.string().min(8).max(280),
  modelDeploymentId: z.string().min(1),
  systemPrompt: z.string().min(10),
  temperature: z.number().min(0).max(1),
  retrievalEnabled: z.boolean()
});

export type CreateAgentDto = z.infer<typeof createAgentSchema>;
