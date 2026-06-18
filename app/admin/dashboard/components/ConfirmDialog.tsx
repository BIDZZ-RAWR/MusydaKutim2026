"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface ConfirmDialogProps {
  open: boolean
  title: string
  description?: string
  loading?: boolean
  onConfirm?: () => void | Promise<void>
  onClose: () => void
}

export function ConfirmDialog({ open, title, description, loading, onConfirm, onClose }: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent showCloseButton={!loading} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title || "Konfirmasi"}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button
            variant="destructive"
            onClick={async () => {
              if (onConfirm) {
                try {
                  await onConfirm()
                } catch (_) {
                } finally {
                  onClose()
                }
              }
            }}
            disabled={loading}
            className="min-w-[96px]"
          >
            {loading ? "Memproses..." : "Ya, Hapus"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
