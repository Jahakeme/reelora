import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface LikeState {
  liked: boolean;
  disliked: boolean;
  likeCount: number;
  dislikeCount: number;
}

type LikeType = "LIKE" | "DISLIKE";

interface LikeTarget {
  videoId?: string;
  commentId?: string;
}

async function fetchLikes(target: LikeTarget): Promise<LikeState> {
  const params = new URLSearchParams();
  if (target.videoId) params.set("videoId", target.videoId);
  if (target.commentId) params.set("commentId", target.commentId);

  const res = await fetch(`/api/likes?${params}`);
  if (!res.ok) throw new Error("Failed to fetch likes");
  return res.json();
}

function likeQueryKey(target: LikeTarget) {
  return ["likes", target.videoId ?? null, target.commentId ?? null] as const;
}

export function useLikes(target: LikeTarget) {
  return useQuery({
    queryKey: likeQueryKey(target),
    queryFn: () => fetchLikes(target),
    enabled: !!(target.videoId || target.commentId),
  });
}

export function useLikeMutation(target: LikeTarget) {
  const queryClient = useQueryClient();
  const key = likeQueryKey(target);

  return useMutation({
    mutationFn: async (type: LikeType) => {
      const res = await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...target, type }),
      });
      if (!res.ok) throw new Error("Failed to toggle like");
      return res.json() as Promise<LikeState>;
    },
    onMutate: async (type: LikeType) => {
      await queryClient.cancelQueries({ queryKey: key });
      const prev = queryClient.getQueryData<LikeState>(key);

      if (prev) {
        const next = { ...prev };

        if (prev.liked && type === "LIKE") {
          next.liked = false;
          next.likeCount -= 1;
        } else if (prev.disliked && type === "DISLIKE") {
          next.disliked = false;
          next.dislikeCount -= 1;
        } else {
          if (prev.liked) {
            next.liked = false;
            next.likeCount -= 1;
          }
          if (prev.disliked) {
            next.disliked = false;
            next.dislikeCount -= 1;
          }
          if (type === "LIKE") {
            next.liked = true;
            next.likeCount += 1;
          } else {
            next.disliked = true;
            next.dislikeCount += 1;
          }
        }

        queryClient.setQueryData(key, next);
      }

      return { prev };
    },
    onError: (_err, _type, context) => {
      if (context?.prev) queryClient.setQueryData(key, context.prev);
      toast.error("Something went wrong");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: key });
    },
  });
}
