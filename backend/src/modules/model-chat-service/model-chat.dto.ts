import { z } from "zod";

export const modelChatRequestSchema = z.object({
  modelId: z.string().uuid(),
  message: z.string().min(1)
});

export type ModelChatRequestDto = z.infer<typeof modelChatRequestSchema>;
