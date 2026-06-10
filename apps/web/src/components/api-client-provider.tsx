import type { AppType } from '@stack/api'
import type { hc } from 'hono/client'
import { createContext, useContext } from 'react'

type Client = ReturnType<typeof hc<AppType>>

type ApiClientProviderProperties = Readonly<{
  children: React.ReactNode
  client: Client
}>

const ApiClientContext = createContext<Client | null>(null)

// eslint-disable-next-line react-refresh/only-export-components
export const useApiClient = () => {
  const client = useContext(ApiClientContext)
  if (!client) {
    throw new Error('useApiClient must be used within an ApiClientProvider')
  }
  return client
}

export const ApiClientProvider = ({ children, client }: ApiClientProviderProperties) => {
  return <ApiClientContext.Provider value={client}>{children}</ApiClientContext.Provider>
}
