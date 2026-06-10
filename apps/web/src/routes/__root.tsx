import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

import { ErrorBoundary } from '@/components/error-boundary'
import { ModeToggle } from '@/components/mode-toggle'
import { Button } from '@/components/ui/button'
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarTrigger } from '@/components/ui/menubar'
import { client } from '@/lib/auth-client'

const Root = () => {
  const { data } = client.useSession()
  return (
    <div className="">
      <div className="p-2 flex gap-2">
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>Menu</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>
                <Link to="/">Home</Link>
              </MenubarItem>
              <MenubarItem>
                <Link to="/dashboard">Dashboard</Link>
              </MenubarItem>
              {data?.session ? (
                <MenubarItem>
                  <Button onClick={() => client.signOut()}>LogOut</Button>
                </MenubarItem>
              ) : undefined}
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
        <ModeToggle />
      </div>
      <hr />
      <Outlet />
      <TanStackRouterDevtools />
    </div>
  )
}

export const Route = createRootRoute({ component: Root, errorComponent: ErrorBoundary })
