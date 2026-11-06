import { Outlet, createRootRoute } from '@tanstack/react-router'

import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { toast } from 'sonner'

import '../styles.css'
import { ThemeProvider } from '#/components/theme-provider'
import { Toaster } from '#/components/ui/sonner'
import { ApiError } from '#/queries/api'

export const Route = createRootRoute({
  component: RootComponent,
})

function handleQueryError(error: Error) {
  if (error instanceof ApiError) {
    toast.error(error.error || `Error ${error.status}`, {
      description: error.message,
    });
  } else {
    toast.error('An unexpected error occurred', {
      description: error.message,
    });
  }
}

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: handleQueryError,
  }),
  mutationCache: new MutationCache({
    onError: handleQueryError,
  }),
});


function RootComponent() {

  return (
    <>
      <ThemeProvider defaultTheme='dark'>
        <QueryClientProvider client={queryClient}>
          <Outlet />
          <Toaster richColors closeButton />
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
