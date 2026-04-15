import "server-only";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ApiException } from "@/lib/api/respond";

export async function requireAuth(): Promise<{ userId: string }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new ApiException("UNAUTHORIZED", "Authentication required");
  }
  return { userId: session.user.id };
}

export async function getOptionalAuth(): Promise<{ userId: string } | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  return { userId: session.user.id };
}
