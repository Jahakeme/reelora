import { z } from "zod";

export const recordHistorySchema = z.object({
  videoId: z.string().min(1),
});

export type RecordHistoryInput = z.infer<typeof recordHistorySchema>;
