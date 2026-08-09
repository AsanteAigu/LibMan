import { z } from "zod";

export const createTitleSchema = z.object({
  name: z.string().min(1, "Enter a title"),
  author: z.string().min(1, "Enter an author"),
  replacementCost: z
    .number({ error: "Enter a replacement cost" })
    .min(0, "Replacement cost can't be negative"),
  hasEbook: z.boolean(),
});
export type CreateTitleInput = z.infer<typeof createTitleSchema>;
