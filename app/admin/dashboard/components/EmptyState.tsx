"use client"

import type { LucideIcon } from "lucide-react"
import { Inbox } from "lucide-react"

interface EmptyStateProps {
  icon?: LucideIcon
  title?: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({
  icon: Icon = Inbox,
  title = "Tidak ada data",
  description = "Belum ada data yang tersedia untuk ditampilkan.",
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 rounded-2xl border border-dashed border-stone-200 bg-stone-50/50">
      <div className="h-14 w-14 rounded-full bg-stone-100 flex items-center justify-center mb-4">
        <Icon className="h-7 w-7 text-stone-400" />
      </div>
      <h3 className="text-sm font-semibold text-stone-800 mb-1">{title}</h3>
      <p className="text-xs text-stone-500 text-center max-w-xs mb-4">{description}</p>
      {action}
    </div>
  )
}
