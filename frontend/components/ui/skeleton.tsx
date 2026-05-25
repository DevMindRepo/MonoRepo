import { cn } from "@/lib/utils"

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn("skeleton", className)}
      aria-hidden
    />
  )
}

export function MemoryCardSkeleton() {
  return (
    <div className="rounded-[14px] border border-[rgba(255,255,255,0.06)] bg-[#11181C] p-4 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <div className="flex items-center gap-2 pt-1">
        <Skeleton className="h-5 w-14 rounded-full" />
        <Skeleton className="h-5 w-10 rounded-full" />
        <Skeleton className="h-4 w-20 ml-auto" />
      </div>
    </div>
  )
}

export function ApprovalCardSkeleton() {
  return (
    <div className="rounded-[14px] border border-[rgba(255,255,255,0.06)] bg-[#11181C] p-5 space-y-4">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-4/6" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-9 w-24 rounded-[10px]" />
        <Skeleton className="h-9 w-20 rounded-[10px]" />
        <Skeleton className="h-9 w-20 rounded-[10px]" />
      </div>
    </div>
  )
}
