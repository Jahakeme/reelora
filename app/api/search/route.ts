import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { ok, handleRouteError } from "@/lib/api/respond";
import { searchQuerySchema } from "@/lib/schemas/search";

const DAY_MS = 86_400_000;

const DATE_WINDOW_DAYS: Record<"today" | "week" | "month" | "year", number> = {
  today: 1,
  week: 7,
  month: 30,
  year: 365,
};

export async function GET(req: NextRequest) {
  try {
    const query = searchQuerySchema.parse(
      Object.fromEntries(req.nextUrl.searchParams),
    );

    const createdAtFilter =
      query.date === "all"
        ? undefined
        : {
            gte: new Date(Date.now() - DATE_WINDOW_DAYS[query.date] * DAY_MS),
          };

    const where = {
      AND: [
        {
          OR: [
            { title: { contains: query.q, mode: "insensitive" as const } },
            {
              description: {
                contains: query.q,
                mode: "insensitive" as const,
              },
            },
          ],
        },
        ...(createdAtFilter ? [{ createdAt: createdAtFilter }] : []),
      ],
    };

    const orderBy =
      query.sort === "new"
        ? { createdAt: "desc" as const }
        : { views: "desc" as const };

    const items = await prisma.video.findMany({
      where,
      orderBy,
      take: query.limit,
      select: {
        id: true,
        title: true,
        description: true,
        thumbnail: true,
        duration: true,
        views: true,
        ownerId: true,
        createdAt: true,
        owner: { select: { id: true, name: true, image: true } },
      },
    });

    return ok({
      items: items.map((v) => ({
        ...v,
        createdAt: v.createdAt.toISOString(),
      })),
      nextCursor: null,
    });
  } catch (err) {
    return handleRouteError(err);
  }
}
