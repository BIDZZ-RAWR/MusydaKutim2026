import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Monitor, Smartphone } from "lucide-react"

interface ModeSelectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectMode: (mode: "monitor" | "hp") => void
}

export default function ModeSelectionDialog({ open, onOpenChange, onSelectMode }: ModeSelectionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">Pilih Mode Perangkat</DialogTitle>
          <DialogDescription className="text-center">
            Apakah perangkat ini akan digunakan sebagai Monitor Bilik atau HP Panitia (Scanner)?
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <Button
            variant="outline"
            className="h-32 flex flex-col items-center justify-center gap-3 hover:bg-green-50 hover:border-green-500 transition-all bg-transparent"
            onClick={() => onSelectMode("monitor")}
          >
            <Monitor className="w-10 h-10 text-green-600" />
            <span className="font-bold text-green-700">Mode Monitor</span>
            <span className="text-xs text-gray-500 text-center">Tampilan untuk Monitor</span>
          </Button>
          <Button
            variant="outline"
            className="h-32 flex flex-col items-center justify-center gap-3 hover:bg-blue-50 hover:border-blue-500 transition-all bg-transparent"
            onClick={() => onSelectMode("hp")}
          >
            <Smartphone className="w-10 h-10 text-blue-600" />
            <span className="font-bold text-blue-700">Mode HP Panitia</span>
            <span className="text-xs text-gray-500 text-center">Untuk scan QR Code</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
