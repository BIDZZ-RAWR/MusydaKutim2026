"use client"

const statusMap: Record<string, { label: string; className: string }> = {
  aktif: { label: "Aktif", className: "bg-emerald-50 text-emerald-700 ring-emerald-600/20" },
  active: { label: "Active", className: "bg-emerald-50 text-emerald-700 ring-emerald-600/20" },
  sudah: { label: "Sudah", className: "bg-emerald-50 text-emerald-700 ring-emerald-600/20" },
  idle: { label: "Idle", className: "bg-stone-100 text-stone-600 ring-stone-500/20" },
  belum: { label: "Belum", className: "bg-amber-50 text-amber-700 ring-amber-600/20" },
  pending: { label: "Pending", className: "bg-amber-50 text-amber-700 ring-amber-600/20" },
  error: { label: "Error", className: "bg-red-50 text-red-700 ring-red-600/20" },
  nonaktif: { label: "Nonaktif", className: "bg-stone-100 text-stone-500 ring-stone-400/20" },
}

interface StatusBadgeProps {
  status: string
  customLabel?: string
}

export function StatusBadge({ status, customLabel }: StatusBadgeProps) {
  const resolved = statusMap[status?.toLowerCase()] || {
    label: status || "Unknown",
    className: "bg-stone-100 text-stone-600 ring-stone-500/20",
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium ring-1 ring-inset ${resolved.className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${resolved.className.split(" ")[0].replace("bg-", "bg-")}`} />
      {customLabel || resolved.label}
    </span>
  )
}
