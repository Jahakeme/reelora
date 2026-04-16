import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";

interface CommentAuthor {
  id: string;
  name: string | null;
  image: string | null;
}

export interface CommentItem {
  id: string;
  body: string;
  videoId: string;
  parentId: string | null;
  createdAt: string;
  author: CommentAuthor;
}

interface CommentsPage {
  items: CommentItem[];
  nextCursor: string | null;
}

async function fetchComments(
  videoId: string,
  parentId: string | null,
  cursor?: string
): Promise<CommentsPage> {
  const params = new URLSearchParams({ limit: "20" });
  if (parentId) {
    params.set("parentId", parentId);
  } else {
    params.set("videoId", videoId);
  }
  if (cursor) params.set("cursor", cursor);

  const res = await fetch(`/api/comments?${params}`);
  if (!res.ok) throw new Error("Failed to fetch comments");
  return res.json();
}

export function useComments(videoId: string, parentId: string | null = null) {
  return useInfiniteQuery<
    CommentsPage,
    Error,
    InfiniteData<CommentsPage>,
    [string, string, string | null],
    string | undefined
  >({
    queryKey: ["comments", videoId, parentId],
    queryFn: ({ pageParam }) => fetchComments(videoId, parentId, pageParam),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: !!videoId,
  });
}

export function useCreateComment(videoId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      body: string;
      videoId: string;
      parentId?: string;
    }) => {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to post comment");
      const json = await res.json();
      return json.comment as CommentItem;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["comments", videoId, variables.parentId ?? null],
      });
    },
  });
}

export function useDeleteComment(videoId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commentId: string) => {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete comment");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["comments", videoId],
      });
    },
  });
}
