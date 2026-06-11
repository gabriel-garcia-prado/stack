import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import { useApiClient } from '@/components/api-client-provider'
import { Skeleton } from '@/components/ui/skeleton'

const Dashboard = () => {
  const client = useApiClient()
  // Calls the server-side protected endpoint: the API checks the session
  // cookie and returns 401 without one (the client-side gate in _auth.tsx is
  // only a UX nicety, the API is the real guard).
  const me = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const response = await client.api.me.$get()
      if (!response.ok) {
        throw new Error('Failed to load profile')
      }
      return response.json()
    }
  })

  return (
    <div className="p-5">
      <h1 className="text-2xl">Dashboard</h1>
      {me.isPending ? (
        <Skeleton className="mt-2 h-6 w-64" />
      ) : me.isError ? (
        <p className="text-destructive">{me.error.message}</p>
      ) : (
        <p>
          Signed in as <strong>{me.data.user.email}</strong>
        </p>
      )}
    </div>
  )
}

export const Route = createFileRoute('/_auth/dashboard')({
  component: Dashboard
})
