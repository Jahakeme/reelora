import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { ok, handleRouteError } from "@/lib/api/respond";
import { requireAuth, getOptionalAuth } from "@/lib/api/requireAuth";

type RouteContext = { params: Promise<{ channelId: string }> };

export async function GET(_req: NextRequest, ctx: RouteContext) {
  try {
    const { channelId } = await ctx.params;
    const auth = await getOptionalAuth();

    if (!auth?.userId) {
      return ok({ subscribed: false });
    }

    const existing = await prisma.subscription.findFirst({
      where: { subscriberId: auth.userId, channelId },
      select: { id: true },
    });

    return ok({ subscribed: !!existing });
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function DELETE(_req: NextRequest, ctx: RouteContext) {
  try {
    const { userId } = await requireAuth();
    const { channelId } = await ctx.params;

    await prisma.subscription.deleteMany({
      where: { subscriberId: userId, channelId },
    });

    return new Response(null, { status: 204 });
  } catch (err) {
    return handleRouteError(err);
  }
}
