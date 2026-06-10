import './main.css'

import type { AppType } from '@stack/api'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createRouter, RouterProvider } from '@tanstack/react-router'
import { hc } from 'hono/client'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { ApiClientProvider } from '@/components/api-client-provider'
import { ThemeProvider } from '@/components/theme-provider'
import { routeTree } from '@/routeTree.gen'

const router = createRouter({ routeTree })
const queryClient = new QueryClient()
const apiClient = hc<AppType>(import.meta.env.VITE_APP_API_URL)

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
createRoot(document.querySelector('#root')!).render(
  <StrictMode>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <ApiClientProvider client={apiClient}>
          <RouterProvider router={router} />
        </ApiClientProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>
)

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
