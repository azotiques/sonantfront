import { Client } from "@stomp/stompjs";
import { keycloak } from "./keycloak";

export const stomp = new Client({
  brokerURL: `wss://${import.meta.env.VITE_API_LINK}/ws`,
  reconnectDelay: 5000,
  beforeConnect: async () => {
    await keycloak.updateToken(30);

    stomp.connectHeaders = {
      Authorization: `Bearer ${keycloak.token}`,
    };
  },
  onConnect: () => {
    console.log("connected");
  },
  onStompError: frame => console.error('broker error', frame.headers['message']),
  onWebSocketError: event => console.error('ws error', event)
});
