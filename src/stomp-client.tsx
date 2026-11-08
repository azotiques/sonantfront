import { Client } from "@stomp/stompjs";
import { createContext, useContext } from "react";
import { keycloak } from "./keycloak";
import { create } from "zustand";

export const stomp = new Client({
  brokerURL: `${import.meta.env.VITE_WS_LINK}/ws`,
  reconnectDelay: 5000,
  beforeConnect: async () => {
    await keycloak.updateToken(30);

    stomp.connectHeaders = {
      Authorization: `Bearer ${keycloak.token}`,
    };
  },
  onConnect: () => {
    useStompStore.getState().setConnected(true);
  },
  onDisconnect: () => {
    useStompStore.getState().setConnected(false);
  },
  onWebSocketClose: () => {
    useStompStore.getState().setConnected(false);
  },
  onStompError: frame => console.error('broker error', frame.headers['message']),
  onWebSocketError: event => console.error('ws error', event)
});

type StompStore = {
  connected: boolean,
  setConnected: (connected: boolean) => void;
}

export const useStompStore = create<StompStore>((set) => ({
  connected: false,
  setConnected: (connected) => set({ connected })
}));
