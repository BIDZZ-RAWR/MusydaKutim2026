"use client"

import { X, Trash2, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BulkActionBarProps {
  selectedCount: number
  onClear: () => void
  onDelete: () => void
  onDownloadQR?: () => void
}

export function BulkActionBar({ selectedCount, onClear, onDelete, onDownloadQR }: BulkActionBarProps) {
  if (selectedCount === 0) return null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-slide-up">
      <div className="flex items-center gap-3 bg-white border border-stone-200 shadow-lg rounded-2xl px-5 py-3">
        <span className="text-sm font-medium text-stone-700 whitespace-nowrap">
          {selectedCount} dipilih
        </span>
        <div className="w-px h-6 bg-stone-200" />
        {onDownloadQR && (
          <Button variant="ghost" size="sm" onClick={onDownloadQR} className="text-stone-600">
            <Download className="h-4 w-4 mr-1.5" />
            QR
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={onDelete} className="text-red-600 hover:text-red-700 hover:bg-red-50">
          <Trash2 className="h-4 w-4 mr-1.5" />
          Hapus
        </Button>
        <div className="w-px h-6 bg-stone-200" />
        <button
          onClick={onClear}
          className="text-stone-400 hover:text-stone-600 transition-colors"
          aria-label="Batal pilih"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
