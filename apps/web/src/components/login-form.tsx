import { useForm } from '@tanstack/react-form'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Login = {
  email: string
  password: string
}

type Properties = {
  onSubmit: (data: Readonly<Login>) => void
}

export function LoginForm({ onSubmit }: Properties) {
  const form = useForm({
    defaultValues: {
      email: '',
      password: ''
    } as Login,
    onSubmit: async ({ value }) => {
      onSubmit(value)
    }
  })

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>Enter your email below to login to your account</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <form
            onSubmit={(event) => {
              event.preventDefault()
              event.stopPropagation()
              form.handleSubmit()
            }}
          >
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <form.Field
                name="email"
                children={(field) => (
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                  />
                )}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
              </div>
              <form.Field
                name="password"
                children={(field) => (
                  <Input
                    id="password"
                    type="password"
                    required
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                  />
                )}
              />
            </div>
            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  )
}
