import "server-only";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export type LibraryVideo = {
  id: string;
  title: string;
  thumbnail: string | null;
  duration: number | null;
  views: number;
  createdAt: string;
  owner: { id: string; name: string | null; image: string | null };
};

const VIDEO_CARD_SELECT = {
  id: true,
  title: true,
  thumbnail: true,
  duration: true,
  views: true,
  createdAt: true,
  owner: { select: { id: true, name: true, image: true } },
} as const;

type VideoRow = {
  id: string;
  title: string;
  thumbnail: string | null;
  duration: number | null;
  views: number;
  createdAt: Date;
  owner: { id: string; name: string | null; image: string | null };
};

function toVideo(v: VideoRow): LibraryVideo {
  return { ...v, createdAt: v.createdAt.toISOString() };
}

async function viewerId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return session?.user?.id ?? null;
}

export async function getHistory(): Promise<LibraryVideo[] | null> {
  const userId = await viewerId();
  if (!userId) return null;

  const rows = await prisma.watchHistory.findMany({
    where: { userId },
    orderBy: { watchedAt: "desc" },
    take: 50,
    select: { video: { select: VIDEO_CARD_SELECT } },
  });
  return rows.map((r) => toVideo(r.video));
}

export async function getLikedVideos(): Promise<LibraryVideo[] | null> {
  const userId = await viewerId();
  if (!userId) return null;

  const rows = await prisma.videoLike.findMany({
    where: { userId, type: "LIKE" },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: { video: { select: VIDEO_CARD_SELECT } },
  });
  return rows.map((r) => toVideo(r.video));
}

export type CollectionSummary = {
  id: string;
  name: string;
  itemCount: number;
  preview: { id: string; thumbnail: string | null } | null;
  updatedAt: string;
};

export async function getCollections(): Promise<CollectionSummary[] | null> {
  const userId = await viewerId();
  if (!userId) return null;

  const rows = await prisma.collection.findMany({
    where: { ownerId: userId },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      name: true,
      updatedAt: true,
      _count: { select: { items: true } },
      items: {
        orderBy: { addedAt: "desc" },
        take: 1,
        select: { video: { select: { id: true, thumbnail: true } } },
      },
    },
  });

  return rows.map((c) => ({
    id: c.id,
    name: c.name,
    itemCount: c._count.items,
    updatedAt: c.updatedAt.toISOString(),
    preview: c.items[0]?.video ?? null,
  }));
}

export async function getCollectionDetail(collectionId: string) {
  const userId = await viewerId();
  if (!userId) return null;

  const collection = await prisma.collection.findUnique({
    where: { id: collectionId },
    select: {
      id: true,
      name: true,
      ownerId: true,
      updatedAt: true,
      items: {
        orderBy: { addedAt: "desc" },
        select: {
          addedAt: true,
          video: { select: VIDEO_CARD_SELECT },
        },
      },
    },
  });

  if (!collection || collection.ownerId !== userId) return null;

  return {
    id: collection.id,
    name: collection.name,
    updatedAt: collection.updatedAt.toISOString(),
    videos: collection.items.map((i) => toVideo(i.video)),
  };
}
