import { Outlet, createRootRoute } from '@tanstack/react-router'

import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import '../styles.css'
import { ThemeProvider } from '#/components/theme-provider'

export const Route = createRootRoute({
  component: RootComponent,
})

const queryClient = new QueryClient();


function RootComponent() {

  return (
    <>
      <ThemeProvider defaultTheme='dark'>
        <QueryClientProvider client={queryClient}>
          <Outlet />
          <TanStackDevtools
            config={{
              position: 'bottom-right',
            }}
            plugins={[
              {
                name: 'TanStack Router',
                render: <TanStackRouterDevtoolsPanel />,
              },
            ]}
          />
        </QueryClientProvider>
      </ThemeProvider>
    </>
  )
}
