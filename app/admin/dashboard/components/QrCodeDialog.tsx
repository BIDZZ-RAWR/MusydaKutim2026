"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import type { Peserta } from "../types"

interface QrCodeDialogProps {
  peserta: Peserta | null
  qrCodeUrl: string
  onDownload: (peserta: Peserta) => void
  onClose: () => void
}

export function QrCodeDialog({ peserta, qrCodeUrl, onDownload, onClose }: QrCodeDialogProps) {
  return (
    <Dialog open={!!peserta} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>QR Code Peserta</DialogTitle>
          <DialogDescription>
            {peserta?.NamaPeserta} — {peserta?.NIB}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center p-6 space-y-4">
          {qrCodeUrl && (
            <img src={qrCodeUrl || "/placeholder.svg"} alt="QR Code" className="w-64 h-64 border rounded-lg" />
          )}
          <Button onClick={() => peserta && onDownload(peserta)} className="w-full">
            <Download className="w-4 h-4 mr-2" /> Download QR Code
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
