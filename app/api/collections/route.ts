import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { ok, handleRouteError } from "@/lib/api/respond";
import { requireAuth } from "@/lib/api/requireAuth";
import { createCollectionSchema } from "@/lib/schemas/collection";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await requireAuth();
    const videoId = req.nextUrl.searchParams.get("videoId") ?? undefined;

    const collections = await prisma.collection.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { items: true } },
        ...(videoId
          ? {
              items: {
                where: { videoId },
                select: { id: true },
                take: 1,
              },
            }
          : {}),
      },
    });

    const items = collections.map((c) => ({
      id: c.id,
      name: c.name,
      itemCount: c._count.items,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
      ...(videoId ? { containsVideo: (c as { items?: unknown[] }).items!.length > 0 } : {}),
    }));

    return ok({ items });
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await requireAuth();
    const body = createCollectionSchema.parse(await req.json());

    const collection = await prisma.collection.create({
      data: { ownerId: userId, name: body.name },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return ok(
      {
        collection: {
          ...collection,
          itemCount: 0,
          createdAt: collection.createdAt.toISOString(),
          updatedAt: collection.updatedAt.toISOString(),
        },
      },
      { status: 201 },
    );
  } catch (err) {
    return handleRouteError(err);
  }
}
