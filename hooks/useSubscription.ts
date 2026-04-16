import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface SubscriptionState {
  subscribed: boolean;
}

export function useSubscribeMutation(channelId: string) {
  const queryClient = useQueryClient();
  const key = ["subscription", channelId] as const;

  return useMutation({
    mutationFn: async (subscribed: boolean) => {
      if (subscribed) {
        const res = await fetch("/api/subscriptions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ channelId }),
        });
        if (!res.ok) throw new Error("Failed to subscribe");
      } else {
        const res = await fetch(`/api/subscriptions/${channelId}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("Failed to unsubscribe");
      }
      return { subscribed };
    },
    onMutate: async (subscribed: boolean) => {
      await queryClient.cancelQueries({ queryKey: key });
      const prev = queryClient.getQueryData<SubscriptionState>(key);
      queryClient.setQueryData(key, { subscribed });
      return { prev };
    },
    onError: (_err, _subscribed, context) => {
      if (context?.prev) queryClient.setQueryData(key, context.prev);
      toast.error("Something went wrong");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: key });
    },
  });
}
