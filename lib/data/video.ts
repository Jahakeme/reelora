import "server-only";
import prisma from "@/lib/prisma";

export async function getVideo(id: string) {
  try {
    const video = await prisma.video.update({
      where: { id },
      data: { views: { increment: 1 } },
      select: {
        id: true,
        title: true,
        description: true,
        url: true,
        thumbnail: true,
        duration: true,
        views: true,
        tags: true,
        createdAt: true,
        owner: {
          select: {
            id: true,
            name: true,
            image: true,
            _count: { select: { subscribers: true } },
          },
        },
      },
    });

    return {
      ...video,
      createdAt: video.createdAt.toISOString(),
      owner: {
        id: video.owner.id,
        name: video.owner.name,
        image: video.owner.image,
        subscriberCount: video.owner._count.subscribers,
      },
    };
  } catch {
    return null;
  }
}

export async function getRelatedVideos(excludeId: string) {
  const videos = await prisma.video.findMany({
    where: { id: { not: excludeId } },
    orderBy: { createdAt: "desc" },
    take: 8,
    select: {
      id: true,
      title: true,
      thumbnail: true,
      duration: true,
      views: true,
      createdAt: true,
      owner: {
        select: { id: true, name: true, image: true },
      },
    },
  });

  return videos.map((v) => ({
    ...v,
    createdAt: v.createdAt.toISOString(),
  }));
}
