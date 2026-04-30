import { z } from "zod";

export const createCollectionSchema = z.object({
  name: z.string().trim().min(1).max(100),
});

export const renameCollectionSchema = z.object({
  name: z.string().trim().min(1).max(100),
});

export const collectionItemSchema = z.object({
  videoId: z.string().min(1),
});

export type CreateCollectionInput = z.infer<typeof createCollectionSchema>;
export type RenameCollectionInput = z.infer<typeof renameCollectionSchema>;
