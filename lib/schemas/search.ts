import { z } from "zod";

export const searchQuerySchema = z.object({
  q: z.string().min(1).max(200),
  sort: z.enum(["relevance", "new", "views"]).default("relevance"),
  date: z.enum(["today", "week", "month", "year", "all"]).default("all"),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
