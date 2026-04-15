import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { ok, handleRouteError, ApiException } from "@/lib/api/respond";
import { requireAuth } from "@/lib/api/requireAuth";
import { encodeCursor, decodeCursor } from "@/lib/api/cursor";
import {
  createCommentSchema,
  listCommentsQuerySchema,
} from "@/lib/schemas/comment";

const COMMENT_SELECT = {
  id: true,
  body: true,
  videoId: true,
  parentId: true,
  createdAt: true,
  author: { select: { id: true, name: true, image: true } },
} as const;

type CommentRow = {
  id: string;
  body: string;
  videoId: string;
  parentId: string | null;
  createdAt: Date;
  author: { id: string; name: string | null; image: string | null };
};

function serializeComment(c: CommentRow) {
  return { ...c, createdAt: c.createdAt.toISOString() };
}

export async function GET(req: NextRequest) {
  try {
    const query = listCommentsQuerySchema.parse(
      Object.fromEntries(req.nextUrl.searchParams),
    );

    const cursor = query.cursor ? decodeCursor(query.cursor) : null;

    const where = query.videoId
      ? { videoId: query.videoId, parentId: null }
      : { parentId: query.parentId };

    const items = await prisma.comment.findMany({
      where: cursor
        ? {
            ...where,
            OR: [
              { createdAt: { lt: new Date(cursor.createdAt) } },
              {
                createdAt: new Date(cursor.createdAt),
                id: { lt: cursor.id },
              },
            ],
          }
        : where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: query.limit + 1,
      select: COMMENT_SELECT,
    });

    const hasMore = items.length > query.limit;
    const page = hasMore ? items.slice(0, query.limit) : items;
    const last = page[page.length - 1];
    const nextCursor =
      hasMore && last
        ? encodeCursor({ createdAt: last.createdAt.toISOString(), id: last.id })
        : null;

    return ok({ items: page.map(serializeComment), nextCursor });
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await requireAuth();
    const body = createCommentSchema.parse(await req.json());

    const video = await prisma.video.findUnique({
      where: { id: body.videoId },
      select: { id: true },
    });
    if (!video) throw new ApiException("NOT_FOUND", "Video not found");

    let effectiveParentId: string | null = null;
    if (body.parentId) {
      const parent = await prisma.comment.findUnique({
        where: { id: body.parentId },
        select: { id: true, parentId: true, videoId: true },
      });
      if (!parent) {
        throw new ApiException("NOT_FOUND", "Parent comment not found");
      }
      if (parent.videoId !== body.videoId) {
        throw new ApiException(
          "BAD_REQUEST",
          "Parent comment does not belong to this video",
        );
      }
      // Flatten to 2-level depth: replies to replies attach to the top-level ancestor.
      effectiveParentId = parent.parentId ?? parent.id;
    }

    const comment = await prisma.comment.create({
      data: {
        body: body.body,
        videoId: body.videoId,
        authorId: userId,
        parentId: effectiveParentId,
      },
      select: COMMENT_SELECT,
    });

    return ok({ comment: serializeComment(comment) }, { status: 201 });
  } catch (err) {
    return handleRouteError(err);
  }
}
