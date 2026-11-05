import { AppSidebar } from '#/components/ui/app-sidebar'
import { SidebarProvider, SidebarTrigger } from '#/components/ui/sidebar'
import { initKeycloak } from '#/keycloak';
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'

export const Route = createFileRoute('/app')({
  beforeLoad: async ({ preload }) => {
    if (preload) return;
    await initKeycloak();
  },
  component: RouteComponent,
})

function RouteComponent() {
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
