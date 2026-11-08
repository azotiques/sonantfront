import { AppSidebar } from '#/components/ui/app-sidebar'
import { SidebarProvider, SidebarTrigger } from '#/components/ui/sidebar'
import { initKeycloak } from '#/keycloak';
import { getCurrentUser } from '#/queries/users';
import { stomp, useStompStore } from '#/stomp-client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { useEffect, useRef, useState } from 'react';
import { usePresenceStore } from '#/stores/presence-store';

export const Route = createFileRoute('/app')({
  beforeLoad: async ({ preload }) => {
    if (preload) return;
    await initKeycloak();
  },
  component: RouteComponent,
})

function RouteComponent() {

  const connected = useStompStore((state) => state.connected);

  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ["users"],
    queryFn: getCurrentUser
  });

  useEffect(() => {
    stomp.activate();
    return () => {
      stomp.deactivate();
    };
  }, [])

  const setStatus = usePresenceStore((state) => state.setStatus);

  useEffect(() => {
    if (!connected || !stomp.connected || !currentUser?.id) return;

    const receiptId = `presence-sub-${currentUser.id}`;

    stomp.watchForReceipt(receiptId, () => {
      if (stomp.connected) {
        stomp.publish({ destination: "/app/presence/heartbeat" });
      }
    });

    const subscription = stomp.subscribe(
      `/topic/presence.${currentUser.id}`,
      (message) => {
        const { userId, status } = JSON.parse(message.body) as {
          userId: string,
          status: "ONLINE" | "OFFLINE"
        };

        setStatus(userId, status);
      },
      { receipt: receiptId }
    );

    const interval = setInterval(() => {
      if (stomp.connected) {
        stomp.publish({ destination: "/app/presence/heartbeat" });
      }
    }, 30_000);

    return () => {
      clearInterval(interval);
      subscription.unsubscribe();
    };
  }, [connected, currentUser?.id, queryClient]);


  return (
    <div>
      <SidebarProvider>
        <AppSidebar />
        <main className="flex h-svh w-screen flex-col">
          <div className="flex h-12 shrink-0 items-center border-b px-2 md:hidden">
            <SidebarTrigger aria-label="Open sidebar" className="size-9">
              <ArrowLeft />
            </SidebarTrigger>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <Outlet />
          </div>
        </main>
      </SidebarProvider>
    </div>
  )
}
