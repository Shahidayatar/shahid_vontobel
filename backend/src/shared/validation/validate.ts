import { ZodSchema } from "zod";

export function validate<T>(schema: ZodSchema<T>, payload: unknown): T {
  return schema.parse(payload);
}
