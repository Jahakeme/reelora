import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useCallback } from "react";

export function useRequireAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const requireAuth = useCallback(
    (action: () => void) => {
      if (status === "loading") return;
      if (!session) {
        router.push(`/signin?callbackUrl=${encodeURIComponent(pathname)}`);
        return;
      }
      action();
    },
    [session, status, router, pathname]
  );

  return {
    session,
    status,
    isAuthenticated: !!session,
    requireAuth,
  };
}
