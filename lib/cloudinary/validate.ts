import "server-only";

function getCloudName(): string | null {
  const url = process.env.CLOUDINARY_URL;
  if (!url) return null;
  const match = url.match(/cloudinary:\/\/[^@]+@([^\s/]+)/);
  return match?.[1] ?? null;
}

export function isValidAvatarUrl(url: string, userId: string): boolean {
  const cloudName = getCloudName();
  if (!cloudName) return false;
  if (!url.startsWith(`https://res.cloudinary.com/${cloudName}/`)) return false;
  if (!url.includes(`/reelora/avatars/${userId}`)) return false;
  return true;
}
