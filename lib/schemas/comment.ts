import { z } from "zod";

export const createCommentSchema = z.object({
  videoId: z.string().min(1),
  body: z.string().min(1).max(10000),
  parentId: z.string().min(1).optional(),
});

export const listCommentsQuerySchema = z
  .object({
    videoId: z.string().min(1).optional(),
    parentId: z.string().min(1).optional(),
    cursor: z.string().optional(),
    limit: z.coerce.number().int().min(1).max(50).default(20),
  })
  .refine((d) => Boolean(d.videoId) !== Boolean(d.parentId), {
    message: "Exactly one of videoId or parentId is required",
  });

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
