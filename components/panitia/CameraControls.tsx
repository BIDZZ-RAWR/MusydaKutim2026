"use client"

import { Button } from "@/components/ui/button"
import { Camera, StopCircle, Loader2 } from "lucide-react"

interface CameraControlsProps {
  isScanning: boolean
  onStart: () => void
  onStop: () => void
  loading?: boolean
}

export default function CameraControls({ isScanning, onStart, onStop, loading }: CameraControlsProps) {
  return (
    <div className="flex gap-2">
      {!isScanning ? (
        <Button onClick={onStart} disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700">
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Memuat...
            </>
          ) : (
            <>
              <Camera className="w-4 h-4 mr-2" /> Buka Kamera
            </>
          )}
        </Button>
      ) : (
        <Button onClick={onStop} variant="destructive" className="flex-1">
          <StopCircle className="w-4 h-4 mr-2" /> Stop Kamera
        </Button>
      )}
    </div>
  )
}
