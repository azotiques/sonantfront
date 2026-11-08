import { create } from "zustand";

type UserStatus = "ONLINE" | "OFFLINE";

type PresenceStore = {
  statuses: Record<string, UserStatus>;
  setStatus: (userId: string, status: UserStatus) => void;
}

export const usePresenceStore = create<PresenceStore>((set) => ({
  statuses: {},
  setStatus: (userId, status) =>
    set((state) => ({
      statuses: {
        ...state.statuses,
        [userId]: status,
      },
    })),
}));
