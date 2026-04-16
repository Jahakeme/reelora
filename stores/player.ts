import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PlayerState {
  volume: number;
  muted: boolean;
  setVolume: (volume: number) => void;
  setMuted: (muted: boolean) => void;
  toggleMute: () => void;
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set) => ({
      volume: 1,
      muted: false,
      setVolume: (volume) => set({ volume, muted: volume === 0 }),
      setMuted: (muted) => set({ muted }),
      toggleMute: () => set((s) => ({ muted: !s.muted })),
    }),
    { name: "reelora-player" }
  )
);
