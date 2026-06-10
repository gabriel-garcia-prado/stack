import { createFileRoute, Outlet } from '@tanstack/react-router'

import { LoginForm } from '@/components/login-form'
import { Skeleton } from '@/components/ui/skeleton'
import { client } from '@/lib/auth-client'

const useSession = client.useSession

const Auth = () => {
  const { data: session, isPending, error } = useSession()
  if (isPending) {
    return (
      <div className="p-5" role="status" aria-busy="true" aria-label="Loading session">
        <Skeleton className="mx-auto h-64 w-full max-w-sm rounded-xl" />
      </div>
    )
  }
  if (error || session === null || new Date(session.session.expiresAt).getTime() < Date.now()) {
    return (
      <div className="p-5">
        <LoginForm onSubmit={client.signIn.email} />
      </div>
    )
  }

  return <Outlet />
}

export const Route = createFileRoute('/_auth')({
  component: Auth
})
