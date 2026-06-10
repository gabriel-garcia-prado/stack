import { createFileRoute } from '@tanstack/react-router'

const Dashboard = () => {
  return (
    <div>
      <h1>Dashboard</h1>
    </div>
  )
}

export const Route = createFileRoute('/_auth/dashboard')({
  component: Dashboard
})
