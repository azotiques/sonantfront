import { create } from "zustand";

const timeouts: Record<string, ReturnType<typeof setTimeout>> = {};

type TypingStore = {
  typingByChannel: Record<string, Record<string, string>>;
  setTyping: (channelId: string, userId: string, username: string) => void;
  clearTyping: (channelId: string, userId: string) => void;
}

export const useTypingStore = create<TypingStore>((set, get) => ({
  typingByChannel: {},
  setTyping: (channelId, userId, username) => {
    const key = `${channelId}:${userId}`;

    if (timeouts[key]) {
      clearTimeout(timeouts[key]);
    }

    set((state) => ({
      typingByChannel: {
        ...state.typingByChannel,
        [channelId]: {
          ...state.typingByChannel[channelId],
          [userId]: username,
        },
      },
    }));

    timeouts[key] = setTimeout(() => {
      get().clearTyping(channelId, userId);
    }, 5000);
  },

  clearTyping: (channelId, userId) => {
    const key = `${channelId}:${userId}`
    if (timeouts[key]) {
      clearTimeout(timeouts[key]);
      delete timeouts[key];
    }

    set((state) => {
      const channelUsers = { ...state.typingByChannel[channelId] };
      delete channelUsers[userId];
      return {
        typingByChannel: {
          ...state.typingByChannel,
          [channelId]: channelUsers,
        },
      };
    });
  }
}));
