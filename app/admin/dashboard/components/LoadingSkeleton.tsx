"use client"

interface LoadingSkeletonProps {
  variant?: "card" | "table" | "text" | "circle"
  count?: number
}

export function LoadingSkeleton({ variant = "text", count = 1 }: LoadingSkeletonProps) {
  const shimmer = "bg-gradient-to-r from-stone-100 via-stone-200/80 to-stone-100 bg-[length:200%_100%] animate-shimmer rounded-lg"

  if (variant === "card") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: count || 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-stone-200 bg-white p-5 space-y-3">
            <div className={`${shimmer} h-3 w-16`} />
            <div className={`${shimmer} h-8 w-24`} />
            <div className={`${shimmer} h-3 w-20`} />
          </div>
        ))}
      </div>
    )
  }

  if (variant === "table") {
    return (
      <div className="rounded-2xl border border-stone-200 bg-white p-4 space-y-3">
        <div className="flex gap-4 pb-2 border-b border-stone-100">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={`${shimmer} h-4 w-20`} />
          ))}
        </div>
        {Array.from({ length: count || 5 }).map((_, i) => {
          const widths = ["w-20", "w-24", "w-28", "w-32", "w-36"]
          return (
            <div key={i} className="flex gap-4">
              {Array.from({ length: 5 }).map((_, j) => (
                <div key={j} className={`${shimmer} h-4 ${widths[j] || "w-20"}`} />
              ))}
            </div>
          )
        })}
      </div>
    )
  }

  if (variant === "circle") {
    return (
      <div className={count > 1 ? "flex gap-3" : ""}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className={`${shimmer} h-10 w-10 rounded-full`} />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`${shimmer} h-4 w-${i === 0 ? "full" : "3/4"}`} />
      ))}
    </div>
  )
}
