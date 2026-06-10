import { cn } from '@/lib/utils'

const Skeleton = ({ className, ...properties }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('animate-pulse rounded-md bg-muted', className)} {...properties} />
)

export { Skeleton }
