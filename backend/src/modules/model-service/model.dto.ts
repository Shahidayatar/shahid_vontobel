import { z } from "zod";

export const createModelSchema = z.object({
  name: z.string().min(3).max(64),
  model: z.enum(["gpt-4o", "gpt-4.1", "text-embedding-3-large"]),
  region: z.string().min(3)
});

export type CreateModelDto = z.infer<typeof createModelSchema>;
