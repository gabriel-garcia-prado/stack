import { useMutation } from '@tanstack/react-query'
import { createLazyFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

import reactLogo from '@/assets/react.svg'
import viteLogo from '@/assets/vite.svg'
import { useApiClient } from '@/components/api-client-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'

const Index = () => {
  const [count, setCount] = useState(0)

  const client = useApiClient()
  const mutation = useMutation({
    mutationFn: (data: Readonly<{ name: string; age: string }>) =>
      client.api['hello-world'].$get({ query: data }).then(async (response) => {
        if (response.ok) {
          return await response.json()
        } else {
          throw new Error('Failed to fetch')
        }
      })
  })

  return (
    // center div
    <div className="flex flex-col items-center">
      <div className="flex">
        <a href="https://vitejs.dev" target="_blank" rel="noopener">
          <img src={viteLogo} className="p-5 hover:drop-shadow-[0_0_2em_#646cff]" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank" rel="noopener">
          <img src={reactLogo} className="p-5 hover:drop-shadow-[0_0_2em_#646cff]" alt="React logo" />
        </a>
      </div>
      <Card>
        <CardHeader>
          <h1>Vite + React</h1>
        </CardHeader>
        <CardContent className="flex justify-between">
          <Button onClick={() => setCount((c) => c + 1)}>count is {count}</Button>
          <Button disabled={mutation.isPending} onClick={() => mutation.mutate({ name: 'name', age: '27' })}>
            Hono RPC: {mutation.isPending ? 'Loading…' : mutation.isSuccess ? mutation.data.message : 'Click me'}
          </Button>
        </CardContent>
        <CardFooter>
          <p>
            Edit <code>src/routes/index.lazy.tsx</code> to test HMR
          </p>
        </CardFooter>
      </Card>
      <p className="read-the-docs">Click on the Vite and React logos to learn more</p>
    </div>
  )
}

export const Route = createLazyFileRoute('/')({
  component: Index
})
