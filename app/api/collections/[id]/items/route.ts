import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { ok, handleRouteError, ApiException } from "@/lib/api/respond";
import { requireAuth } from "@/lib/api/requireAuth";
import { collectionItemSchema } from "@/lib/schemas/collection";

type RouteContext = { params: Promise<{ id: string }> };

async function assertOwner(collectionId: string, userId: string) {
  const c = await prisma.collection.findUnique({
    where: { id: collectionId },
    select: { ownerId: true },
  });
  if (!c) throw new ApiException("NOT_FOUND", "Collection not found");
  if (c.ownerId !== userId) throw new ApiException("FORBIDDEN", "Not your collection");
}

export async function POST(req: NextRequest, ctx: RouteContext) {
  try {
    const { userId } = await requireAuth();
    const { id } = await ctx.params;
    const body = collectionItemSchema.parse(await req.json());

    await assertOwner(id, userId);

    const video = await prisma.video.findUnique({
      where: { id: body.videoId },
      select: { id: true },
    });
    if (!video) throw new ApiException("NOT_FOUND", "Video not found");

    const existing = await prisma.collectionItem.findUnique({
      where: { collectionId_videoId: { collectionId: id, videoId: body.videoId } },
      select: { id: true },
    });

    if (!existing) {
      await prisma.collectionItem.create({
        data: { collectionId: id, videoId: body.videoId },
      });
    }

    return ok({ success: true });
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function DELETE(req: NextRequest, ctx: RouteContext) {
  try {
    const { userId } = await requireAuth();
    const { id } = await ctx.params;
    const videoId = req.nextUrl.searchParams.get("videoId");
    if (!videoId) throw new ApiException("BAD_REQUEST", "videoId is required");

    await assertOwner(id, userId);

    await prisma.collectionItem.deleteMany({
      where: { collectionId: id, videoId },
    });

    return ok({ success: true });
  } catch (err) {
    return handleRouteError(err);
  }
}
