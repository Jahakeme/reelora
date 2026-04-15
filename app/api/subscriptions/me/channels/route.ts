import prisma from "@/lib/prisma";
import { ok, handleRouteError } from "@/lib/api/respond";
import { requireAuth } from "@/lib/api/requireAuth";

export async function GET() {
  try {
    const { userId } = await requireAuth();

    const subs = await prisma.subscription.findMany({
      where: { subscriberId: userId },
      orderBy: { createdAt: "desc" },
      select: {
        channel: {
          select: {
            id: true,
            name: true,
            image: true,
            _count: { select: { subscribers: true } },
          },
        },
      },
    });

    const channels = subs.map((s) => ({
      id: s.channel.id,
      name: s.channel.name,
      image: s.channel.image,
      subscriberCount: s.channel._count.subscribers,
    }));

    return ok({ channels });
  } catch (err) {
    return handleRouteError(err);
  }
}
