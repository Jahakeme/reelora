import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { ok, handleRouteError, ApiException } from "@/lib/api/respond";
import { requireAuth } from "@/lib/api/requireAuth";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(_req: NextRequest, ctx: RouteContext) {
  try {
    const { userId } = await requireAuth();
    const { id } = await ctx.params;

    const comment = await prisma.comment.findUnique({
      where: { id },
      select: { authorId: true, parentId: true },
    });
    if (!comment) throw new ApiException("NOT_FOUND", "Comment not found");
    if (comment.authorId !== userId) {
      throw new ApiException("FORBIDDEN", "Not your comment");
    }

    const isTopLevel = comment.parentId === null;

    const replyIds = isTopLevel
      ? (
          await prisma.comment.findMany({
            where: { parentId: id },
            select: { id: true },
          })
        ).map((r) => r.id)
      : [];

    const allIds = [id, ...replyIds];

    await prisma.$transaction([
      prisma.like.deleteMany({ where: { commentId: { in: allIds } } }),
      ...(replyIds.length > 0
        ? [prisma.comment.deleteMany({ where: { id: { in: replyIds } } })]
        : []),
      prisma.comment.delete({ where: { id } }),
    ]);

    return ok({ success: true });
  } catch (err) {
    return handleRouteError(err);
  }
}
