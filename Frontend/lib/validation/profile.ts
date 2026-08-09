import { z } from "zod";

export const profileSchema = z.object({
  name: z.string().min(2, "Enter your full name"),
  email: z.string().email("Enter a valid email address"),
});
export type ProfileInput = z.infer<typeof profileSchema>;
