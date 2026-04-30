import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { ok, handleRouteError, ApiException } from "@/lib/api/respond";
import { requireAuth } from "@/lib/api/requireAuth";
import { recordHistorySchema } from "@/lib/schemas/history";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await requireAuth();
    const body = recordHistorySchema.parse(await req.json());

    const video = await prisma.video.findUnique({
      where: { id: body.videoId },
      select: { id: true },
    });
    if (!video) throw new ApiException("NOT_FOUND", "Video not found");

    await prisma.watchHistory.upsert({
      where: { userId_videoId: { userId, videoId: body.videoId } },
      update: { watchedAt: new Date() },
      create: { userId, videoId: body.videoId },
    });

    return ok({ success: true });
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function DELETE() {
  try {
    const { userId } = await requireAuth();
    await prisma.watchHistory.deleteMany({ where: { userId } });
    return ok({ success: true });
  } catch (err) {
    return handleRouteError(err);
  }
}
