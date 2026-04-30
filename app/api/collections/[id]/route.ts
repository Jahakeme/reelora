import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { ok, handleRouteError, ApiException } from "@/lib/api/respond";
import { requireAuth } from "@/lib/api/requireAuth";
import { renameCollectionSchema } from "@/lib/schemas/collection";

type RouteContext = { params: Promise<{ id: string }> };

async function assertOwner(collectionId: string, userId: string) {
  const c = await prisma.collection.findUnique({
    where: { id: collectionId },
    select: { ownerId: true },
  });
  if (!c) throw new ApiException("NOT_FOUND", "Collection not found");
  if (c.ownerId !== userId) throw new ApiException("FORBIDDEN", "Not your collection");
}

export async function PATCH(req: NextRequest, ctx: RouteContext) {
  try {
    const { userId } = await requireAuth();
    const { id } = await ctx.params;
    const body = renameCollectionSchema.parse(await req.json());

    await assertOwner(id, userId);

    const updated = await prisma.collection.update({
      where: { id },
      data: { name: body.name },
      select: { id: true, name: true, updatedAt: true },
    });

    return ok({
      collection: { ...updated, updatedAt: updated.updatedAt.toISOString() },
    });
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function DELETE(_req: NextRequest, ctx: RouteContext) {
  try {
    const { userId } = await requireAuth();
    const { id } = await ctx.params;

    await assertOwner(id, userId);

    await prisma.$transaction([
      prisma.collectionItem.deleteMany({ where: { collectionId: id } }),
      prisma.collection.delete({ where: { id } }),
    ]);

    return ok({ success: true });
  } catch (err) {
    return handleRouteError(err);
  }
}
