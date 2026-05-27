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
    <div className="rounded-[14px] border border-[rgba(255,255,255,0.06)] p-4 space-y-3" style={{ background: "rgba(17,25,35,0.7)" }}>
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
    <div className="rounded-[14px] border border-[rgba(255,255,255,0.06)] p-5 space-y-4" style={{ background: "rgba(17,25,35,0.7)" }}>
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

export function ArtifactRowSkeleton() {
  return (
    <div className="grid grid-cols-[1fr_80px_120px_90px_140px_100px] items-center px-4 py-3.5 border-b border-[rgba(255,255,255,0.05)]" style={{ background: "rgba(17,25,35,0.7)" }}>
      <div className="flex items-center gap-3">
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className="h-4 w-40" />
      </div>
      <Skeleton className="h-5 w-16 rounded-full" />
      <Skeleton className="h-4 w-12" />
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-4 w-24" />
      <div className="flex gap-1 justify-end">
        <Skeleton className="h-7 w-7 rounded-[8px]" />
        <Skeleton className="h-7 w-7 rounded-[8px]" />
        <Skeleton className="h-7 w-7 rounded-[8px]" />
      </div>
    </div>
  )
}

export function TimelineEventSkeleton() {
  return (
    <div className="rounded-[14px] border border-[rgba(255,255,255,0.06)] p-4" style={{ background: "rgba(17,25,35,0.7)" }}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-7 w-7 rounded-[8px]" />
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
    </div>
  )
}

export function DashboardMetricSkeleton() {
  return (
    <div className="rounded-[16px] p-5 space-y-3 border border-[rgba(255,255,255,0.06)]" style={{ background: "rgba(17,25,35,0.7)" }}>
      <div className="flex items-center gap-2">
        <Skeleton className="h-3.5 w-3.5 rounded" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-3 w-28" />
    </div>
  )
}

export function SettingsSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden border border-[rgba(255,255,255,0.09)]" style={{ background: "rgba(17,25,35,0.7)" }}>
      <div className="px-5 py-4 border-b border-[rgba(255,255,255,0.06)] flex items-center gap-3">
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="p-5 space-y-3">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full rounded-[10px]" />
        <Skeleton className="h-4 w-24 mt-2" />
        <Skeleton className="h-10 w-full rounded-[10px]" />
        <Skeleton className="h-9 w-full rounded-[10px] mt-2" />
      </div>
    </div>
  )
}
