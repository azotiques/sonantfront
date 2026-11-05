import { AppSidebar } from '#/components/ui/app-sidebar'
import { SidebarProvider } from '#/components/ui/sidebar'
import { initKeycloak } from '#/keycloak';
import { createFileRoute, Outlet } from '@tanstack/react-router'

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
        <main className="w-screen">
          <Outlet />
        </main>
      </SidebarProvider>
    </div>
  )
}
