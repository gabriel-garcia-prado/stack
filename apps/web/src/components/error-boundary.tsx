import type { ErrorComponentProps } from '@tanstack/react-router'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

/**
 * Route-level error boundary. Wired into the root route via `errorComponent`,
 * so any error thrown while rendering a route (or in a loader) is caught here
 * instead of unmounting the whole app.
 */
export const ErrorBoundary = ({ error, reset }: ErrorComponentProps) => (
  <div className="flex min-h-svh items-center justify-center p-5">
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Something went wrong</CardTitle>
        <CardDescription>An unexpected error occurred while rendering this page.</CardDescription>
      </CardHeader>
      <CardContent>
        <pre className="overflow-auto rounded-md bg-muted p-3 text-sm text-muted-foreground">{error.message}</pre>
      </CardContent>
      <CardFooter className="gap-2">
        <Button onClick={reset}>Try again</Button>
        <Button variant="outline" onClick={() => window.location.assign('/')}>
          Go home
        </Button>
      </CardFooter>
    </Card>
  </div>
)
