"use client"

import { Button } from "@/components/ui/button"
import { Camera, StopCircle } from "lucide-react"

interface CameraControlsProps {
  isScanning: boolean
  onStart: () => void
  onStop: () => void
}

export default function CameraControls({ isScanning, onStart, onStop }: CameraControlsProps) {
  return (
    <div className="flex gap-2">
      {!isScanning ? (
        <Button onClick={onStart} className="flex-1 bg-blue-600 hover:bg-blue-700">
          <Camera className="w-4 h-4 mr-2" /> Buka Kamera
        </Button>
      ) : (
        <Button onClick={onStop} variant="destructive" className="flex-1">
          <StopCircle className="w-4 h-4 mr-2" /> Stop Kamera
        </Button>
      )}
    </div>
  )
}
