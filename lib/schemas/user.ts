import { z } from "zod";

export const registerUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.email(),
  password: z.string().min(8).max(200),
  image: z.url().optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  image: z.url().optional(),
});

export type RegisterUserInput = z.infer<typeof registerUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
